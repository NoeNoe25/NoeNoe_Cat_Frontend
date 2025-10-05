import sys
import queue
import json
import threading
import sounddevice as sd
from vosk import Model, KaldiRecognizer
import google.generativeai as genai
import pyttsx3
import time
import tempfile
import os
import subprocess
import platform

# Windows-only winsound (used for WAV playback)
if platform.system() == "Windows":
    import winsound

# ----------------------------
# Gemini setup
# ----------------------------
api_key = "AIzaSyBqpN-lzZ4ePx99up3DpAaGZ1f6ChWS4vg"
genai.configure(api_key=api_key)

system_instruction = (
    "You are a student (a kid) practicing English with your teacher. "
    "You will receive spoken sentences from your teacher, but the input comes from Automatic Speech Recognition (ASR), "
    "so it may contain mistakes. "
    "Your role is to behave like a curious kid. "
    "If the teacher’s sentence looks correct and understandable, respond naturally as a student would. "
    "Always keep your tone childlike, curious, and respectful. "
    "Do not try to 'fix' the teacher’s English yourself. Just ask for clarification like a student would when they don’t understand. "
    "Your goal is to make the interaction feel like a real student learning English from a non-native teacher."
)

model_gemini = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_instruction)
chat_state = model_gemini.start_chat()  # persistent chat

def generate_response(message):
    try:
        response = chat_state.send_message(message)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error: {e}", file=sys.stderr)
        return "Sorry, something went wrong."

# ----------------------------
# Vosk setup
# ----------------------------
MODEL_PATH = r"C:\Users\DELL\Desktop\My Projects\ChatBot\backend\vosk-model-small-en-us-0.15"
vosk_model = Model(MODEL_PATH)
recognizer = KaldiRecognizer(vosk_model, 16000)

audio_queue = queue.Queue()

# Event to control STT (pause when TTS is speaking)
stt_allowed = threading.Event()
stt_allowed.set()  # initially allowed

# Global mic stream so we can stop/start it from TTS thread
mic_stream = None

def audio_callback(indata, frames, time_info, status):
    if status:
        print("AUDIO STATUS:", status, file=sys.stderr)
    # Only push audio to queue if STT allowed
    if stt_allowed.is_set():
        try:
            audio_queue.put(bytes(indata))
        except Exception as e:
            print("audio_callback queue put error:", e, file=sys.stderr)

# ----------------------------
# TTS setup (engine kept for fallback)
# ----------------------------
engine = pyttsx3.init()

def _synthesize_wav_windows_ps(text, out_path):
    """
    Use Windows System.Speech via PowerShell to write a WAV file.
    This does not play audio, only writes the file. We pass the text through stdin
    to avoid quoting issues.
    """
    # Build a short PS command that reads stdin and synthesizes to wave file
    ps_cmd = (
        "$text = [Console]::In.ReadToEnd(); "
        "Add-Type -AssemblyName System.speech; "
        f"$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        f"$s.SetOutputToWaveFile('{out_path}'); "
        "$s.Speak($text); $s.Dispose();"
    )
    # Run powershell and pipe the text into stdin
    subprocess.run(["powershell", "-Command", ps_cmd], input=text.encode("utf-8"), check=True)

def speak_async(text):
    """Speak text in a thread while safely stopping/starting the mic stream."""
    def run():
        global mic_stream, recognizer
        print("[TTS] starting...")

        # Pause STT and stop mic stream to avoid device conflicts
        stt_allowed.clear()
        try:
            if mic_stream is not None and mic_stream.active:
                print("[TTS] stopping mic stream...")
                mic_stream.stop()
        except Exception as e:
            print("[TTS] error stopping mic stream:", e, file=sys.stderr)

        # Flush any accumulated mic data
        with audio_queue.mutex:
            audio_queue.queue.clear()

        temp_wav = None
        used_powershell = False

        try:
            if platform.system() == "Windows":
                # create temp wav
                fd, temp_wav = tempfile.mkstemp(suffix=".wav")
                os.close(fd)
                print(f"[TTS] generating WAV at {temp_wav} using PowerShell SAPI...")
                _synthesize_wav_windows_ps(text, temp_wav)
                used_powershell = True

                # play it synchronously (blocking) on this thread
                print("[TTS] playing WAV (winsound)...")
                winsound.PlaySound(temp_wav, winsound.SND_FILENAME)
            else:
                # Non-windows fallback: try saving via pyttsx3 then play with sounddevice
                print("[TTS] non-Windows: falling back to pyttsx3 save_to_file + sounddevice playback")
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
                tmpname = tmp.name
                tmp.close()
                engine.save_to_file(text, tmpname)
                engine.runAndWait()
                # Attempt to play with sounddevice (requires soundfile to be installed)
                try:
                    import soundfile as sf
                    data, sr = sf.read(tmpname, dtype='float32')
                    sd.play(data, sr)
                    sd.wait()
                except Exception as e:
                    print("[TTS] playback fallback error (soundfile/sd):", e, file=sys.stderr)
                    # last resort: directly use pyttsx3 speak (may block or cause the original issue)
                    print("[TTS] last-resort: pyttsx3 speak (may cause device issues)...")
                    engine.say(text)
                    engine.runAndWait()
                temp_wav = tmpname
        except subprocess.CalledProcessError as e:
            print("[TTS] PowerShell error:", e, file=sys.stderr)
            # fallback to pyttsx3 speak (synchronous)
            try:
                engine.say(text)
                engine.runAndWait()
            except Exception as e2:
                print("[TTS] pyttsx3 fallback failed:", e2, file=sys.stderr)
        except Exception as e:
            print("[TTS] general TTS error:", e, file=sys.stderr)
            try:
                engine.say(text)
                engine.runAndWait()
            except Exception as e2:
                print("[TTS] pyttsx3 fallback failed:", e2, file=sys.stderr)
        finally:
            # cleanup temp wav
            if temp_wav and os.path.exists(temp_wav):
                try:
                    os.remove(temp_wav)
                except Exception:
                    pass

            # Recreate/reset recognizer and resume mic
            try:
                print("[TTS] recreating recognizer and clearing queue...")
                with audio_queue.mutex:
                    audio_queue.queue.clear()
                recognizer = KaldiRecognizer(vosk_model, 16000)
            except Exception as e:
                print("[TTS] error recreating recognizer:", e, file=sys.stderr)

            try:
                if mic_stream is not None and not mic_stream.active:
                    print("[TTS] restarting mic stream...")
                    mic_stream.start()
            except Exception as e:
                print("[TTS] error restarting mic stream:", e, file=sys.stderr)

            stt_allowed.set()
            print("[TTS] finished, STT resumed.")

    threading.Thread(target=run, daemon=True).start()

# ----------------------------
# STT Thread
# ----------------------------
def stt_loop():
    global recognizer
    while True:
        if not stt_allowed.is_set():
            time.sleep(0.05)
            continue
        try:
            data = audio_queue.get(timeout=0.1)
        except queue.Empty:
            continue

        try:
            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                text = result.get("text", "").strip()
                if text:
                    print(f"\nYou said: {text}")
                    if text.lower() == "exit":
                        print("Goodbye!")
                        break
                    reply = generate_response(text)
                    print(f"AI  : {reply}\n")
                    speak_async(reply)

                    # Reset recognizer proactively (also done in speak_async finalize)
                    try:
                        recognizer = KaldiRecognizer(vosk_model, 16000)
                    except Exception as e:
                        print("Error resetting recognizer after reply:", e, file=sys.stderr)
            else:
                partial = json.loads(recognizer.PartialResult()).get("partial", "")
                if partial:
                    print(f"Partial: {partial}", end="\r")
        except Exception as e:
            print("STT loop exception:", e, file=sys.stderr)
            # try to recover by reinitializing the recognizer
            try:
                recognizer = KaldiRecognizer(vosk_model, 16000)
            except Exception as e2:
                print("Failed to recreate recognizer in exception handler:", e2, file=sys.stderr)

# ----------------------------
# Main loop
# ----------------------------
def main():
    global mic_stream
    print("=== CLI English Chat with Gemini + Vosk + TTS ===")
    print("Speak into your microphone. Say 'exit' to quit.\n")

    # Start STT thread
    stt_thread = threading.Thread(target=stt_loop, daemon=True)
    stt_thread.start()

    # Create and start mic stream explicitly (so we can stop/start it)
    mic_stream = sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16',
                                  channels=1, callback=audio_callback)
    try:
        mic_stream.start()
    except Exception as e:
        print("Error starting mic stream:", e, file=sys.stderr)
        return

    try:
        while stt_thread.is_alive():
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("Interrupted by user, exiting...")
    finally:
        try:
            if mic_stream is not None and mic_stream.active:
                mic_stream.stop()
                mic_stream.close()
        except Exception:
            pass

if __name__ == "__main__":
    main()

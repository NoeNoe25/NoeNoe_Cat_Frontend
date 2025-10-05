import sys
import queue
import json
import sounddevice as sd
from vosk import Model, KaldiRecognizer
import google.generativeai as genai

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
    """Send message to Gemini and get reply"""
    try:
        response = chat_state.send_message(message)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        return "Sorry, something went wrong."

# ----------------------------
# Vosk setup
# ----------------------------
MODEL_PATH = r"C:\Users\DELL\Desktop\My Projects\ChatBot\backend\vosk-model-small-en-us-0.15"  # adjust to your local path
vosk_model = Model(MODEL_PATH)
recognizer = KaldiRecognizer(vosk_model, 16000)
q = queue.Queue()

def audio_callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))

# ----------------------------
# Main CLI loop
# ----------------------------
def main():
    print("=== CLI English Chat with Gemini + Vosk ===")
    print("Speak into your microphone. Type 'exit' to quit.\n")

    with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16',
                           channels=1, callback=audio_callback):
        while True:
            data = q.get()
            if recognizer.AcceptWaveform(data):
                result = recognizer.Result()
                text = json.loads(result).get("text", "").strip()
                if text:
                    print(f"\nYou said: {text}")
                    if text.lower() == "exit":
                        print("Goodbye!")
                        break
                    # Send to Gemini
                    reply = generate_response(text)
                    print(f"AI  : {reply}\n")
            else:
                partial = recognizer.PartialResult()
                partial_text = json.loads(partial).get("partial", "")
                if partial_text:
                    print(f"Partial: {partial_text}", end="\r")

if __name__ == "__main__":
    main()

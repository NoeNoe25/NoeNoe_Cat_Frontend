import sys
import sounddevice as sd
import queue
import json
from vosk import Model, KaldiRecognizer

# Path to your model
MODEL_PATH = r"backend/vosk-model-small-en-us-0.15"

# Load model
model = Model(MODEL_PATH)
recognizer = KaldiRecognizer(model, 16000)

q = queue.Queue()

def callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))

def main():
    print("=== Vosk Streaming Speech Recognition ===")
    print("Speak into your microphone...\n")

    with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16',
                           channels=1, callback=callback):
        while True:
            data = q.get()
            if recognizer.AcceptWaveform(data):
                result = recognizer.Result()
                text = json.loads(result).get("text", "")
                if text.strip():
                    print("You said:", text)
            else:
                partial = recognizer.PartialResult()
                partial_text = json.loads(partial).get("partial", "")
                if partial_text:
                    print("Partial:", partial_text, end="\r")

if __name__ == "__main__":
    main()


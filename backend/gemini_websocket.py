# import asyncio
# import websockets
# import google.generativeai as genai
# import os
# import sys

# # --- Gemini Setup ---
# API_KEY = os.getenv("GEMINI_API_KEY") or "YOUR_API_KEY_HERE"
# genai.configure(api_key=API_KEY)

# system_instruction = (
#     "You are a student (a kid) practicing English with your teacher. "
#     "You will receive sentences from your teacher. "
#     "Your role is to behave like a curious kid, respond naturally, and keep a childlike tone."
# )

# MODEL_NAME = "gemini-2.5-flash-lite"  # make sure this model exists
# model = genai.GenerativeModel(MODEL_NAME, system_instruction=system_instruction)


# # --- WebSocket Handler ---
# async def handle_client(websocket):
#     async for message in websocket:
#         try:
#             # Streaming response (sync generator)
#             response = model.generate_content(message, stream=True)
#             # reply_chunks = []

#             # Send chunks as they arrive
#             for chunk in response:
#                 if chunk.text:
#                     # reply_chunks.append(chunk.text)
#                     await websocket.send(chunk.text)

#             # full_reply = "".join(reply_chunks)

#             # Send END marker so client knows it's done
#             await websocket.send("[[END]]")

#             # Save into database
#             # await insert_chat(user_input=message, gemini_reply=full_reply)

#         except Exception as e:
#             await websocket.send(f"Error: {str(e)}")


# async def start_gemini_websocket():
#     server = await websockets.serve(handle_client, "0.0.0.0", 8765)
#     print("✅ Gemini WebSocket server started on ws://localhost:8765")
#     return server


# if __name__ == "__main__":

#     async def main():
#         server = await start_gemini_websocket()
#         await asyncio.Future()  # run forever

#     asyncio.run(main())

# import asyncio
# import websockets
# import google.generativeai as genai
# import os
# from gtts import gTTS
# import io
# import base64

# # --- Gemini Setup ---
# API_KEY = os.getenv("GEMINI_API_KEY") or "YOUR_API_KEY_HERE"
# genai.configure(api_key=API_KEY)

# system_instruction = (
#     "You are a student (a kid) practicing English with your teacher. "
#     "You will receive sentences from your teacher. "
#     "Your role is to behave like a curious kid, respond naturally, and keep a childlike tone."
# )

# MODEL_NAME = "gemini-2.5-flash-lite"
# model = genai.GenerativeModel(MODEL_NAME, system_instruction=system_instruction)


# # --- WebSocket Handler ---
# async def handle_client(websocket):
#     async for message in websocket:
#         try:
#             # Stream Gemini response
#             response = model.generate_content(message, stream=True)

#             for chunk in response:
#                 if chunk.text:
#                     # 1️⃣ Send text chunk
#                     await websocket.send(chunk.text)

#                     # 2️⃣ Convert chunk to audio
#                     audio_fp = io.BytesIO()
#                     tts = gTTS(text=chunk.text, lang="en")
#                     tts.write_to_fp(audio_fp)
#                     audio_bytes = audio_fp.getvalue()

#                     # 3️⃣ Encode audio to base64 and send
#                     audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
#                     await websocket.send(f"AUDIO::{audio_b64}")

#             # End of message
#             await websocket.send("[[END]]")

#         except Exception as e:
#             await websocket.send(f"Error: {str(e)}")


# # --- Start WebSocket Server ---
# async def start_gemini_websocket():
#     server = await websockets.serve(handle_client, "0.0.0.0", 8765)
#     print("✅ Gemini WebSocket server started on ws://localhost:8765")
#     return server


# if __name__ == "__main__":

#     async def main():
#         server = await start_gemini_websocket()
#         await asyncio.Future()  # run forever

#     asyncio.run(main())

import asyncio
import websockets
import google.generativeai as genai
import os
from gtts import gTTS
import io
import base64

# --- Gemini Setup ---
API_KEY = os.getenv("GEMINI_API_KEY") or "YOUR_API_KEY_HERE"
genai.configure(api_key=API_KEY)

system_instruction = (
    "You are a student (a kid) practicing English with your teacher. "
    "You will receive sentences from your teacher. "
    "Your role is to behave like a curious kid, respond naturally, and keep a childlike tone."
)

MODEL_NAME = "gemini-2.5-flash-lite"
model = genai.GenerativeModel(MODEL_NAME, system_instruction=system_instruction)


# --- Audio Queue Worker ---
async def audio_worker(websocket, queue: asyncio.Queue):
    while True:
        chunk_text = await queue.get()
        try:
            audio_fp = io.BytesIO()
            tts = gTTS(text=chunk_text, lang="en")
            tts.write_to_fp(audio_fp)
            audio_bytes = audio_fp.getvalue()
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            await websocket.send(f"AUDIO::{audio_b64}")
        except Exception as e:
            print(f"Audio generation error: {e}")
        queue.task_done()


# --- WebSocket Handler ---
async def handle_client(websocket):
    # Create a queue for sequential audio
    audio_queue = asyncio.Queue()
    # Start background audio worker
    audio_task = asyncio.create_task(audio_worker(websocket, audio_queue))

    try:
        async for message in websocket:
            try:
                # Stream Gemini response
                response = model.generate_content(message, stream=True)

                for chunk in response:
                    if chunk.text:
                        # 1️⃣ Send text immediately
                        await websocket.send(chunk.text)
                        # 2️⃣ Enqueue audio for sequential sending
                        await audio_queue.put(chunk.text)

                # End marker
                await websocket.send("[[END]]")

            except Exception as e:
                await websocket.send(f"Error: {str(e)}")
    finally:
        # Cleanup
        audio_task.cancel()
        try:
            await audio_task
        except asyncio.CancelledError:
            pass


# --- Start WebSocket Server ---
async def start_gemini_websocket():
    server = await websockets.serve(handle_client, "0.0.0.0", 8765)
    print("✅ Gemini WebSocket server started on ws://localhost:8765")
    return server


if __name__ == "__main__":

    async def main():
        await start_gemini_websocket()
        await asyncio.Future()  # Run forever

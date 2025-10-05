from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# ----------------------------
# Firebase Setup
# ----------------------------
cred = credentials.Certificate("firebase-key.json")  # <-- your Firebase service account JSON
firebase_admin.initialize_app(cred)
db = firestore.client()

# ----------------------------
# Gemini Setup
# ----------------------------
api_key = "AIzaSyBqpN-lzZ4ePx99up3DpAaGZ1f6ChWS4vg"  # <-- replace with your key
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

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    system_instruction=system_instruction
)

# ----------------------------
# AI Response Function
# ----------------------------
def generate_response(message):
    try:
        chat = model.start_chat()
        response = chat.send_message(message)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating response: {e}")
        return "Sorry, something went wrong."

# ----------------------------
# API Routes
# ----------------------------
@app.route('/chat', methods=['POST'])
def chat():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    username = data.get("username", "TestUser")
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Generate Gemini reply
    reply = generate_response(message)

    # Save to Firestore
    user_ref = db.collection("users").document(username)
    messages_ref = user_ref.collection("messages")
    messages_ref.add({
        "user_message": message,
        "assistant_reply": reply,
        "timestamp": datetime.utcnow()
    })

    return jsonify({"reply": reply})

@app.route('/history/<username>', methods=['GET'])
def history(username):
    user_ref = db.collection("users").document(username)
    messages_ref = user_ref.collection("messages").order_by("timestamp")
    messages = messages_ref.stream()

    history = [
        {
            "user_message": msg.to_dict().get("user_message"),
            "assistant_reply": msg.to_dict().get("assistant_reply"),
            "timestamp": msg.to_dict().get("timestamp").strftime("%Y-%m-%d %H:%M:%S")
        }
        for msg in messages
    ]

    return jsonify({"username": username, "history": history})

# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

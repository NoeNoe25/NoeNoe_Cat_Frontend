from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore

# ----------------------------
# Flask setup
# ----------------------------
app = Flask(__name__)
CORS(app)

# ----------------------------
# Firebase setup
# ----------------------------
cred = credentials.Certificate("firebase-key.json")  # your Firebase service account JSON
firebase_admin.initialize_app(cred)
db = firestore.client()

# ----------------------------
# Gemini setup
# ----------------------------
api_key = "AIzaSyBqpN-lzZ4ePx99up3DpAaGZ1f6ChWS4vg"  # replace with your key
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

model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_instruction)

# ----------------------------
# Store chat objects per user
# ----------------------------
user_chats = {}  # key = uid, value = Gemini chat object

# ----------------------------
# Helpers
# ----------------------------
def generate_response(message, uid):
    """Use persistent chat per user"""
    try:
        if uid not in user_chats:
            user_chats[uid] = model.start_chat()
        chat = user_chats[uid]
        response = chat.send_message(message)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error for uid {uid}: {e}")
        return "Sorry, something went wrong."

# ----------------------------
# Routes
# ----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "message": "AI Chat API running"})

@app.route("/chat", methods=["POST"])
def chat():
    uid = "test-user"  # hardcoded for testing without Firebase auth

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    message = data.get("message", "")
    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Generate Gemini reply
    reply = generate_response(message, uid)

    # Save conversation in Firestore
    user_ref = db.collection("users").document(uid)
    messages_ref = user_ref.collection("messages")
    messages_ref.add({
        "user_message": message,
        "assistant_reply": reply,
        "timestamp": datetime.utcnow()
    })

    return jsonify({"reply": reply})

@app.route("/history", methods=["GET"])
def history():
    uid = "test-user"  # hardcoded for testing

    user_ref = db.collection("users").document(uid)
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

    return jsonify({"uid": uid, "history": history})

# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

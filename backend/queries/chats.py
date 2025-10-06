from typing import Any, List
from datetime import datetime
from database import database


# Insert chat
async def insert_chat(user_input: str, gemini_reply: str):
    query = """
    INSERT INTO chats (user_text, bot_reply, created_at)
    VALUES (:user_text, :bot_reply, :created_at)
    """
    values = {
        "user_text": user_input,  # Changed to match table column
        "bot_reply": gemini_reply,  # Changed to match table column
        "created_at": datetime.utcnow(),
    }
    await database.execute(query=query, values=values)


# Get chats with limit
async def get_chats(limit: int = 50) -> list[dict[str, Any]]:
    query = "SELECT * FROM chats ORDER BY created_at DESC LIMIT :limit"
    return await database.fetch_all(query=query, values={"limit": limit})

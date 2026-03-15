from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    language: str = "English"
    context: Optional[Dict[str, Any]] = None

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.post("/chat")
async def ai_chat(request: ChatRequest):
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

        system_prompt = f"""You are GSTSmart AI, an expert GST tax assistant for Indian small businesses. 
The user's current forecast data is provided in the context. 
Always respond in the exact language specified in the language field. 
Supported languages are English, Hindi, Gujarati, Marathi, Tamil. 
Keep all responses concise under 150 words and highly practical. 
Focus only on GST compliance, invoice patterns, tax liability trends, fraud detection insights, and GST filing advice relevant to Indian businesses. 
Always format currency values with rupee symbol and Indian number formatting like ₹1,00,000. 
If the user asks about their forecast always use the provided context data to give specific accurate answers. 
Never make up numbers not in the context."""

        # Prepare context summary for AI
        ctx_text = ""
        if request.context:
            ctx_text = f"\n\nContext Data:\n"
            for k, v in request.context.items():
                ctx_text += f"- {k}: {v}\n"

        user_content = f"Language: {request.language}\nUser Message: {request.message}{ctx_text}"

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_content,
                }
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=500,
        )

        reply = chat_completion.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

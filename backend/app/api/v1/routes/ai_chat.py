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
    context: Optional[Dict[str, Any]] = None

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.post("/chat")
async def ai_chat(request: ChatRequest):
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

        system_prompt = f"""You are GSTSmart AI, an expert GST tax assistant for Indian small businesses. 
The user's current forecast data is provided in the context. 
1. Detect mapping of user's language and respond naturally in the SAME language. 
2. Provide exactly 3 short, relevant follow-up questions (suggestions) in the SAME detected language.
3. Output your response in valid JSON format with keys: "reply" (string) and "suggestions" (list of 3 strings).
Supported primary languages are English, Hindi, Gujarati, Marathi, Tamil, but always match the user's input language. 
Keep the reply concise under 150 words and highly practical. 
Focus only on GST compliance, invoice patterns, tax liability trends, fraud detection insights, and GST filing advice relevant to Indian businesses. 
Always format currency values with rupee symbol and Indian number formatting like ₹1,0,000. 
If the user asks about their forecast always use the provided context data to give specific accurate answers. 
Never make up numbers not in the context."""

        # Prepare context summary for AI
        ctx_text = ""
        if request.context:
            ctx_text = f"\n\nContext Data:\n"
            for k, v in request.context.items():
                ctx_text += f"- {k}: {v}\n"

        user_content = f"User Message: {request.message}{ctx_text}\nOutput JSON format only."

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
            max_tokens=600,
            response_format={"type": "json_object"}
        )

        import json
        response_data = json.loads(chat_completion.choices[0].message.content)
        return response_data

    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

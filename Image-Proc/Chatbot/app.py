# app.py
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import base64
import json
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import io
import uuid
from fastapi.responses import JSONResponse
import time
from datetime import datetime

app = FastAPI(
    title="Medical Scan Analysis API",
    description="API for analyzing medical scans and providing healthcare information",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables for API keys (in production use proper env management)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyD_MwkxaZUMjYEMpN4byy8SoMtdOQJ-u98")

# In-memory storage for session data
session_storage = {}

MAX_HISTORY_LENGTH = 10  # Adjust based on your needs

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = []
    session_id: Optional[str] = None

class AnalysisResult(BaseModel):
    session_id: str
    filename: str
    timestamp: str
    analysis: str
    image_type: str

# Middleware to handle errors gracefully
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        )

# Helper function to get or create session
def get_or_create_session(session_id: Optional[str] = None):
    if not session_id or session_id not in session_storage:
        session_id = str(uuid.uuid4())
        session_storage[session_id] = {
            "created_at": datetime.now().isoformat(),
            "image_analyses": [],
            "chat_history": []
        }
    
    # Trim history if too long
    if len(session_storage[session_id]["chat_history"]) > MAX_HISTORY_LENGTH * 2:
        session_storage[session_id]["chat_history"] = session_storage[session_id]["chat_history"][-MAX_HISTORY_LENGTH * 2:]
    
    return session_id

@app.post("/api/analyze-scan", response_model=AnalysisResult)
async def analyze_scan(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None)
):
    """
    Analyze a CT/MRI scan using Gemini API and store the results
    """
    try:
        # Get or create session
        session_id = get_or_create_session(session_id)
        
        # Read file content
        content = await file.read()
        
        # Convert to base64 for Gemini API
        encoded_content = base64.b64encode(content).decode("utf-8")
        
        # Prepare Gemini API request
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        
        # Enhanced medical prompt engineering
        prompt = """
        You are a medical imaging specialist assistant. Analyze this medical scan image and provide a detailed description.
        
        Please include:
        1. What type of scan this appears to be (X-ray, CT, MRI, ultrasound, etc.)
        2. Which body region/anatomy is visible in the image
        3. General observations about visible structures
        4. Image quality assessment and visible landmarks
        
        DO NOT provide:
        - Specific diagnoses or pathology identifications
        - Treatment recommendations
        - Critical or serious condition insights
        - Recommendations for surgery or interventions
        
        End your analysis with a clear disclaimer that this is NOT medical advice and the patient should consult a healthcare professional.
        Format your response with appropriate markdown headings and bullet points for readability.
        """
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        },
                        {
                            "inline_data": {
                                "mime_type": file.content_type,
                                "data": encoded_content
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.95,
                "maxOutputTokens": 800
            }
        }
        
        # Make request to Gemini API with retry logic
        analysis_text = None
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        gemini_url,
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if response.status_code != 200:
                        if attempt == max_retries - 1:
                            raise HTTPException(status_code=response.status_code, 
                                              detail=f"Error from Gemini API: {response.text}")
                        time.sleep(1)  # Wait before retry
                        continue
                        
                    result = response.json()
                    
                    # Extract text from response
                    try:
                        analysis_text = result["candidates"][0]["content"]["parts"][0]["text"]
                        break  # Success, exit retry loop
                    except (KeyError, IndexError) as e:
                        if attempt == max_retries - 1:
                            raise HTTPException(status_code=500, 
                                              detail=f"Failed to parse Gemini API response: {str(e)}")
                        time.sleep(1)  # Wait before retry
            except httpx.RequestError as e:
                if attempt == max_retries - 1:
                    raise HTTPException(status_code=503, 
                                      detail=f"Service unavailable: {str(e)}")
                time.sleep(1)  # Wait before retry
        
        # Create timestamp
        timestamp = datetime.now().isoformat()
        
        # Store analysis in session
        analysis_record = {
            "filename": file.filename,
            "content_type": file.content_type,
            "timestamp": timestamp,
            "analysis": analysis_text
        }
        
        session_storage[session_id]["image_analyses"].append(analysis_record)
        
        # Return result
        return AnalysisResult(
            session_id=session_id,
            filename=file.filename,
            timestamp=timestamp,
            analysis=analysis_text,
            image_type=file.content_type
        )
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing scan: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint that connects to Groq's LLM API with session management
    """
    try:
        # Get or create session
        session_id = get_or_create_session(request.session_id)
        
        # Initialize messages list with enhanced system prompt
        sanitized_messages = [{
            "role": "system",
            "content": """You are MediAssist, an advanced healthcare information assistant built for hospital environments.

Your primary role is to provide clear, accurate medical information while maintaining appropriate boundaries:

DO NOT provide:
- Specific diagnoses
- Treatment recommendations for serious conditions
- Prescription medications or dosages
- Critical operation insights
- Medical advice that could replace professional consultation

FOCUS ON:
- Explaining medical terminology in accessible language
- General health education
- Understanding test procedures
- Wellness and preventive care information
- Clarifying general medical concepts

Always include appropriate disclaimers about consulting healthcare professionals for medical advice. 
Be empathetic, clear, and professional in your responses."""
        }]
        
        # Check if there are any image analyses in this session to include
        if session_storage[session_id]["image_analyses"]:
            # Get the latest analysis
            latest_analysis = session_storage[session_id]["image_analyses"][-1]
            sanitized_messages.append({
                "role": "system",
                "content": f"The user has uploaded a medical scan ({latest_analysis['filename']}) with the following analysis: {latest_analysis['analysis']}"
            })
        
        # Add user messages if any are provided
        if request.messages:
            for msg in request.messages:
                sanitized_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
                
                # Store user messages in session history
                if msg.role == "user":
                    session_storage[session_id]["chat_history"].append({
                        "role": "user",
                        "content": msg.content,
                        "timestamp": datetime.now().isoformat()
                    })
        else:
            # If no messages provided, add a default greeting prompt
            sanitized_messages.append({
                "role": "user",
                "content": "Hello, I'd like some general health information."
            })
        
        # Make request to Groq API with retry logic
        reply = None
        max_retries = 3
        
        groq_url = "https://api.groq.com/openai/v1/chat/completions"
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": sanitized_messages,
            "temperature": 0.5,
            "max_tokens": 800
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }
        
        # Optimized retry logic
        async with httpx.AsyncClient(timeout=15.0) as client:  # Reduced timeout
            for attempt in range(max_retries):
                try:
                    response = await client.post(
                        groq_url,
                        json=payload,
                        headers=headers
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        reply = result["choices"][0]["message"]["content"]
                        break
                    
                    if attempt == max_retries - 1:
                        raise HTTPException(
                            status_code=response.status_code,
                            detail=f"Error from Groq API: {response.text}"
                        )
                except httpx.RequestError as e:
                    if attempt == max_retries - 1:
                        raise HTTPException(
                            status_code=503,
                            detail=f"Service unavailable: {str(e)}"
                        )
        
        return {
            "reply": reply,
            "session_id": session_id
        }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

@app.post("/api/simple-chat")
async def simple_chat(
    message: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    """
    Simplified chat endpoint that accepts a single message string
    and doesn't require previous conversation history
    """
    try:
        # Create a chat request with a single message
        chat_request = ChatRequest(
            messages=[ChatMessage(role="user", content=message)],
            session_id=session_id
        )
        
        # Use the existing chat endpoint
        return await chat(chat_request)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in simple chat: {str(e)}")

@app.get("/api/session/{session_id}")
async def get_session_info(session_id: str):
    """
    Get session information including analysis history
    """
    if session_id not in session_storage:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {
        "session_id": session_id,
        "created_at": session_storage[session_id]["created_at"],
        "analysis_count": len(session_storage[session_id]["image_analyses"]),
        "chat_count": len(session_storage[session_id]["chat_history"]) // 2,  # Divide by 2 for pairs of user/assistant messages
        "latest_analysis": session_storage[session_id]["image_analyses"][-1] if session_storage[session_id]["image_analyses"] else None
    }

@app.get("/api/healthcheck")
def healthcheck():
    """
    Simple health check endpoint
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
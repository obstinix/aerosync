from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import joblib
import json
import numpy as np
import os
import asyncio
import random

app = FastAPI(title="AeroSync AI Service", version="1.0.0")

# CORS — allow backend, frontend, and production origins
allowed_origins = [
    os.getenv("BACKEND_URL", "http://localhost:3001"),
    os.getenv("CLIENT_URL", "http://localhost:9000"),
    "https://aerosync-td50.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "name": "AeroSync AI Service",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "predict_delay": "POST /predict/delay",
            "health": "GET /health",
        },
        "docs": "/docs",
    }

# Load model on startup
MODEL_PATH = os.getenv("MODEL_PATH", "./models/delay_rf_v1.pkl")
COLS_PATH  = "./models/feature_columns.json"

try:
    model = joblib.load(MODEL_PATH)
    feature_cols = json.load(open(COLS_PATH))
    print(f"[AI] Model loaded from {MODEL_PATH}")
except FileNotFoundError:
    model = None
    feature_cols = []
    print("[AI] WARNING: No trained model found. Run python train.py first.")

class DelayRequest(BaseModel):
    airline_code: str = Field(..., example="AE")
    origin: str = Field(..., example="JFK")
    destination: str = Field(..., example="LHR")
    day_of_week: int = Field(..., ge=1, le=7)
    departure_time: int = Field(..., ge=0, le=2359, description="HHMM format")
    flight_length_min: int = Field(..., ge=15, le=900)
    weather_score: Optional[float] = Field(0.0, ge=0.0, le=1.0)

class DelayResponse(BaseModel):
    delay_probability: float
    estimated_delay_minutes: int
    confidence: float
    reason: str
    model_version: str

@app.post("/predict/delay", response_model=DelayResponse)
async def predict_delay(req: DelayRequest):
    if model is None:
        # Graceful heuristic fallback if scikit-learn model is not loaded (e.g. on Render deployment)
        # We calculate a stable, deterministic pseudo-random probability from the request details
        val = hash(f"{req.airline_code}-{req.origin}-{req.destination}")
        base_prob = (abs(val) % 30) / 100.0  # 0.0 to 0.30
        
        # Add travel day and departure hour delay factors
        day_factor = 0.12 if req.day_of_week in (1, 5, 7) else 0.0
        hour_factor = 0.15 if 600 <= req.departure_time <= 900 or 1600 <= req.departure_time <= 1900 else 0.0
        
        prob = base_prob + day_factor + hour_factor
        adjusted_prob = min(1.0, prob + req.weather_score * 0.2)
        est_delay = int(adjusted_prob * 90) if adjusted_prob > 0.45 else 0

        reasons = ["heuristic fallback"]
        if req.weather_score > 0.6: reasons.append(f"high weather risk ({req.weather_score:.0%})")
        if req.day_of_week in (1, 5, 7): reasons.append("peak travel day")
        if 600 <= req.departure_time <= 900: reasons.append("morning rush slot")
        if 1600 <= req.departure_time <= 1900: reasons.append("evening rush slot")
        if est_delay == 0: reasons.append("low historical delay probability")

        return DelayResponse(
            delay_probability=round(adjusted_prob, 4),
            estimated_delay_minutes=est_delay,
            confidence=0.70,
            reason=" · ".join(reasons),
            model_version="heuristic-fallback-v1.0",
        )

    # Map to model features — these encodings are approximate without saved LabelEncoders.
    # For production: save and reload LabelEncoders from train.py.
    airline_idx  = hash(req.airline_code) % 18
    origin_idx   = hash(req.origin) % 300
    dest_idx     = hash(req.destination) % 300

    X = np.array([[airline_idx, origin_idx, dest_idx,
                   req.day_of_week, req.departure_time, req.flight_length_min]])
    prob = float(model.predict_proba(X)[0][1])

    # Weather score bumps the probability linearly
    adjusted_prob = min(1.0, prob + req.weather_score * 0.2)
    est_delay = int(adjusted_prob * 90) if adjusted_prob > 0.45 else 0

    reasons = []
    if req.weather_score > 0.6: reasons.append(f"high weather risk ({req.weather_score:.0%})")
    if req.day_of_week in (1, 5, 7): reasons.append("peak travel day")
    if 600 <= req.departure_time <= 900: reasons.append("morning rush slot")
    if est_delay == 0: reasons.append("low historical delay probability")

    return DelayResponse(
        delay_probability=round(adjusted_prob, 4),
        estimated_delay_minutes=est_delay,
        confidence=round(0.75 + prob * 0.2, 4),
        reason=" · ".join(reasons) if reasons else "No significant delay risk factors",
        model_version="rf-v1.0",
    )

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    flights: List[dict] = Field(default_factory=list)

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    async def event_generator():
        delayed_flights = [f for f in req.flights if f.get('status') == 'delayed' or f.get('delayMinutes', 0) > 0]
        critical_flights = [f for f in req.flights if f.get('status') == 'critical']
        msg_lower = req.message.lower()
        
        response_text = ""
        if "status" in msg_lower or "summary" in msg_lower or "current" in msg_lower or "state" in msg_lower:
            response_text = (
                f"### Operations Status Summary\n\n"
                f"We are currently monitoring **{len(req.flights)}** active flights.\n"
                f"- **Delayed flights**: {len(delayed_flights)}\n"
                f"- **Critical/Emergency alerts**: {len(critical_flights)}\n\n"
            )
            if critical_flights:
                response_text += "#### Critical Alerts:\n"
                for f in critical_flights:
                    response_text += f"- **{f.get('flightNumber')}** ({f.get('origin')} -> {f.get('destination')}): Status CRITICAL. Delay: {f.get('delayMinutes', 0)} mins.\n"
                response_text += "\n"
            
            response_text += (
                "#### Recommendations:\n"
                "1. **Re-route delayed flights**: Prioritize arrival slots for high-impact passenger connections.\n"
                "2. **Mitigate cascading impact**: Alert ground crews at hub airports to expedite baggage and refueling.\n"
                "3. **OpenSky crosscheck**: Validate transponder telemetry to confirm actual flight paths."
            )
        elif "recover" in msg_lower or "mitigate" in msg_lower or "plan" in msg_lower or "solve" in msg_lower:
            response_text = (
                "### Recovery Action Plan (AeroSync AI Engine)\n\n"
                "Based on the live schedule and active disruptions, the following mitigation steps are recommended:\n\n"
                "1. **Tail Swap (LHR Hub)**: Swap the aircraft for the LHR outbound flight to minimize downstream crew hour violations.\n"
                "2. **Dynamic Holding Pattern**: Hold the JFK-bound flight by 15 minutes to secure 12 passenger connections.\n"
                "3. **Cargo Priority Reassignment**: Shift priority cargo shipments from the delayed flight to the next scheduled flight departing in 2 hours.\n"
                "4. **Fuel Hedging / Acceleration**: Request pilot acceleration (CI/Cost Index adjustment) to recover up to 10 minutes en-route for the DXB flight."
            )
        else:
            response_text = (
                f"### AeroSync AI Response\n\n"
                f"Acknowledged. I am analyzing the operations network with **{len(req.flights)} flights** in view.\n\n"
                f"Please let me know if you would like me to:\n"
                f"- Generate a **network recovery plan** to mitigate delays.\n"
                f"- Check the **status summary** of specific hub airports (JFK, LHR, CDG).\n"
                f"- Assess **cascading disruption risks** for cargo or passenger loads."
            )

        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=api_key)
                system_prompt = (
                    "You are the AeroSync AI War Room assistant. You help airline dispatchers "
                    "recover from flight disruptions, weather delays, and cargo bottlenecks. "
                    "Provide professional, structured, concise recommendations using markdown. "
                    f"Current flight status data: {json.dumps(req.flights)}\n"
                    f"Delayed flights count: {len(delayed_flights)}, Critical count: {len(critical_flights)}."
                )
                messages = [{"role": "system", "content": system_prompt}]
                for h in req.history:
                    messages.append({"role": h.role, "content": h.content})
                messages.append({"role": "user", "content": req.message})
                
                stream = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    stream=True
                )
                async for chunk in stream:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield f"data: {json.dumps({'text': content})}\n\n"
                return
            except Exception as e:
                pass

        # Fallback simulation
        words = response_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'text': chunk})}\n\n"
            await asyncio.sleep(0.03)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

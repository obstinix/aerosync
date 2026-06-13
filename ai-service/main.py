from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import joblib
import json
import numpy as np
import os

app = FastAPI(title="AeroSync AI Service", version="1.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=[os.getenv("BACKEND_URL", "http://localhost:3001")],
    allow_methods=["POST"],
    allow_headers=["*"],
)

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
        raise HTTPException(503, "Model not loaded. Run python train.py.")

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

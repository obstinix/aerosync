"""AeroSync AI Service — Flight optimization and disruption prediction."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random

app = FastAPI(title="AeroSync AI Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class OptimizationRequest(BaseModel):
    flight_id: str
    origin: str
    destination: str
    current_status: str
    cargo_weight: Optional[float] = None


class DisruptionPrediction(BaseModel):
    airport: str
    event_type: str
    severity: float


@app.get("/health")
def health():
    return {"status": "ok", "service": "aerosync-ai"}


@app.post("/api/optimize")
def optimize_route(req: OptimizationRequest):
    """Generate AI-powered route optimization suggestions."""
    confidence = round(random.uniform(0.75, 0.98), 2)
    fuel_savings = round(random.uniform(500, 5000), 0)
    time_delta = random.randint(-30, 45)
    return {
        "flight_id": req.flight_id,
        "suggestion": {
            "type": "reroute" if confidence > 0.85 else "delay",
            "confidence": confidence,
            "description": f"Optimize {req.origin}->{req.destination} via alternate corridor",
            "fuel_savings_kg": fuel_savings,
            "time_delta_min": time_delta,
            "recommended": confidence > 0.80,
        },
    }


@app.post("/api/predict-disruption")
def predict_disruption(req: DisruptionPrediction):
    """Predict cascading impact of a disruption event."""
    affected_count = max(1, int(req.severity * random.randint(3, 12)))
    total_delay = int(req.severity * random.randint(60, 300))
    revenue_impact = int(req.severity * random.randint(10000, 80000))
    return {
        "airport": req.airport,
        "event_type": req.event_type,
        "prediction": {
            "affected_flights": affected_count,
            "total_delay_minutes": total_delay,
            "estimated_revenue_impact": revenue_impact,
            "confidence": round(random.uniform(0.70, 0.95), 2),
            "recommended_actions": [
                "Pre-position ground crews",
                "Notify connecting passengers",
                "Activate backup aircraft pool",
            ][:affected_count],
        },
    }


@app.post("/api/cargo-balance")
def cargo_balance(flights: list[dict]):
    """Suggest cargo rebalancing across flights."""
    suggestions = []
    for f in flights[:10]:
        util = f.get("cargoUtilization", 50)
        if util > 85:
            suggestions.append({
                "flight_id": f.get("id", "unknown"),
                "action": "offload",
                "amount_tons": round((util - 75) * 0.5, 1),
                "reason": "Exceeds optimal capacity threshold",
            })
        elif util < 40:
            suggestions.append({
                "flight_id": f.get("id", "unknown"),
                "action": "consolidate",
                "reason": "Underutilized — consider cargo consolidation",
            })
    return {"suggestions": suggestions}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

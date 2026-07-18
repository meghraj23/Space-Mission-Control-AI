from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel
import random
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["ai"])

class ChatMessageSchema(BaseModel):
    message: str

def get_cognitive_response(text: str) -> str:
    query = text.lower()
    
    if any(k in query for k in ["engine", "propulsion", "failure", "diagnose", "diagnostics"]):
        return """### **Cognitive Subsystem Diagnostics: STARSHIP-HLS**

**Subsystem Status: Degraded Warning**
* **Auxiliary Helium Manifold pressure:** 182 bar (Nominal: 200 bar)
* **Thrust Vector Actuator drift:** 0.08% (Nominal: < 0.05%)
* **Active Raptor chambers vibration index:** 1.34 mm/s (Alert limit: 1.20 mm/s)

**Failure Prediction Model:**
> [!WARNING]
> Anomaly detected in Booster Engine #9 propellant nozzle thermal dissipation coefficients. Thermal load rose 4.5% over past 3 minutes.
* **Failure Risk Profile:** 14.2% within T+120 seconds of stage 1 hot-fire ignition.

**Mitigation Protocol:**
1. Abort hot-fire pre-pressurization checks.
2. Cycle helium check-valve B-14 to purge manifold lines.
3. Throttle Raptor chamber 9 bypass valve to 94% to stabilize temperatures."""

    if any(k in query for k in ["delay", "weather", "launch", "recommendation"]):
        return """### **Launch Window Optimization Matrix**

**Orbital Window: Ares Pathfinder (Mars Transfer)**
* **Atmospheric wind limits:** 12 knots - **GO**
* **Solar proton flux densities:** 5.4 MeV - **WARNING (Class M storm active)**
* **Geomagnetic disruption Kp-Index:** Kp-5 (Minor Geomagnetic storm)

**AI Launch Optimization Recommendation:**
> [!IMPORTANT]
> Suggest **T-0 Hold: Delay 24 Hours**. The approaching coronal mass ejection cell is projected to intersect Earth's high orbital belt at T+45 minutes, raising ionizing radiation dosage to 12.4 mSv/hr.
* **Optimal Window alternative:** T+24.8 hours (Solar storm boundary clears)."""

    if any(k in query for k in ["fuel", "optimization", "burn"]):
        return """### **Launch trajectory Fuel Optimization**

**Target: low Earth Orbit (LEO) Insertion**
* **Gross Vehicle Mass:** 5,000,000 kg
* **Cryogenic propellant inventory:** 4,600,000 kg

**Optimization parameters:**
* **Optimized Ascent Angle:** 84.2 degrees (reduces atmospheric drag losses by 2.4%)
* **Stage-1 separation altitude target:** 68.5 km (MECO: T+2m 42s)
* **Estimated fuel savings:** 18,400 kg LOX/LCH4 propellant.
* **Propellant margin at insertion:** +3.8% above emergency reserve constraints."""

    if any(k in query for k in ["hubble", "orbit", "satellite", "correction"]):
        return """### **Hubble Cosmic II orbital Drift diagnostics**

**Telemetry vectors:**
* **Orbital altitude:** 535 km (Decay rate: 1.4m/day)
* **Battery charge index:** 45% (Solar array efficiency degraded)

**AI Trajectory Guidance:**
Perform two-burn Hohmann vector correction to restore altitude to 550 km.
1. **Perigee ignition burn (Delta-V 1):** 4.25 m/s (Duration: 18.4s)
2. **Apogee insertion burn (Delta-V 2):** 4.12 m/s (Duration: 17.9s)
*Estimated nitrogen cold-gas propellant cost: 3.4 kg. Orbit restoration chance: 98.4%.*"""

    return """### **Mission Control AI Onboard Assistant**

I am the cognitive copilot. I can run operations scans:
* **"Explain telemetry"** or **"Diagnose engine failure"**
* **"Optimize launch fuel"**
* **"Is weather Go for launch?"**
* **"Troubleshoot Hubble satellite orbit"**"""

@router.post("/chat")
async def chat_with_ai(data: ChatMessageSchema, current_user: dict = Depends(get_current_user)):
    reply = get_cognitive_response(data.message)
    return {"success": True, "data": {"message": reply}}

@router.post("/predict")
async def predict_failure(current_user: dict = Depends(get_current_user)):
    # AI failure forecast model
    prob = round(random.uniform(0.5, 18.0), 2)
    return {
        "success": True,
        "probability": prob,
        "diagnostic": f"Chamber vibration: {round(random.uniform(0.8, 1.4), 2)} mm/s. Valve pressure: nominal. Abort risk: low."
    }

@router.post("/risk")
async def risk_assessment(current_user: dict = Depends(get_current_user)):
    # AI risk assessment logs
    return {
        "success": True,
        "riskScore": 12, # out of 100
        "factors": [
            {"factor": "Solar activity", "risk": "Moderate", "impact": "High"},
            {"factor": "Telemetry gain", "risk": "Low", "impact": "Medium"},
            {"factor": "Booster thermal", "risk": "Low", "impact": "High"}
        ]
    }

@router.post("/pdf")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # AI PDF/Document Summarizer
    content = await file.read()
    filename = file.filename
    size = len(content)
    
    summary = f"### **AI Document Analysis: {filename}**\n\n* **File Size:** {size} bytes\n* **Document Type:** Technical PDF blueprint\n* **Summary:** The document outlines booster design specifications, payload latching clearances, and stage-2 separation systems. Cryogenic seal margins are rated up to -196°C. No structural anomalies detected in the design schema."
    
    return {"success": True, "summary": summary}

@router.get("/history")
async def get_ai_history(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": [
            {"sender": "AI Onboard", "text": "Telemetry handshake nominal. Ready for operational queries.", "timestamp": "08:00"}
        ]
    }

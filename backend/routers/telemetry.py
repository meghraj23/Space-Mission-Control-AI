from fastapi import APIRouter, Depends
from typing import Optional
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Telemetry
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])

@router.get("/history")
async def get_telemetry_history(missionId: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    try:
        m_id = int(missionId)
    except ValueError:
        m_id = 1

    history = db.query(Telemetry).filter(Telemetry.mission_id == m_id).order_by(Telemetry.timestamp.desc()).limit(100).all()
    
    # If no history exists in database, seed some initial data frames!
    if not history:
        now = datetime.utcnow()
        db_history = []
        for i in range(50, -1, -1):
            t_frame = Telemetry(
                mission_id=m_id,
                timestamp=now - timedelta(seconds=i * 5),
                velocity=24000.0 + random.random() * 5000.0 - (i * 50.0),
                altitude=300.0 + random.random() * 120.0 + (i * 2.0),
                pressure=round(max(0.0, 101.3 - (i * 1.5)), 2),
                temperature=round(20.0 + random.random() * 5.0, 2),
                fuel_level=max(0.0, round(100.0 - (50 - i) * 0.2, 2)),
                engine_status="Nominal",
                crew_pulse=70 + random.randint(0, 15),
                crew_o2=98 + random.randint(0, 1)
            )
            db_history.append(t_frame)
        
        db.add_all(db_history)
        db.commit()
        
        history = db.query(Telemetry).filter(Telemetry.mission_id == m_id).order_by(Telemetry.timestamp.desc()).limit(100).all()

    output = []
    for t in history:
        output.append({
            "timestamp": t.timestamp.isoformat(),
            "velocity": t.velocity,
            "altitude": t.altitude,
            "pressure": t.pressure,
            "temperature": t.temperature,
            "fuelLevel": t.fuel_level,
            "engineStatus": t.engine_status,
            "crewPulse": t.crew_pulse,
            "crewO2": t.crew_o2
        })
    
    # Return in chronological order
    return {"success": True, "data": output[::-1]}

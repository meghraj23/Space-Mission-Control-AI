import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Mission, AuditLog
from middleware.auth import RoleAuthorize

router = APIRouter(prefix="/api/missions", tags=["missions"])

class MissionSchema(BaseModel):
    name: str
    rocket: str
    crew: List[str] = []
    launchDate: str
    destination: str
    fuel: float = 100.0
    velocity: float = 0.0
    altitude: float = 0.0
    payload: str = "Scientific Sensors"
    description: str = ""
    status: str = "Scheduled"

@router.get("")
async def get_missions(current_user: dict = Depends(RoleAuthorize("Admin", "Operator", "Scientist", "Guest")), db: Session = Depends(get_db_session)):
    missions = db.query(Mission).all()
    output = []
    for m in missions:
        output.append({
            "_id": str(m.id),
            "name": m.name,
            "status": m.status,
            "rocket": m.rocket,
            "crew": json.loads(m.crew_json or '[]'),
            "launchDate": m.launch_date.isoformat(),
            "destination": m.destination,
            "fuel": m.fuel,
            "velocity": m.velocity,
            "altitude": m.altitude,
            "payload": m.payload,
            "description": m.description,
            "checklist": json.loads(m.checklist_json or '[]'),
            "timeline": json.loads(m.timeline_json or '[]'),
            "bookmarked": m.bookmarked
        })
    return {"success": True, "data": output}

@router.post("")
async def create_mission(data: MissionSchema, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    try:
        ld = datetime.fromisoformat(data.launchDate.replace("Z", "+00:00"))
    except ValueError:
        ld = datetime.utcnow()

    # Pre-populate launch checklist
    checklist = [
        {"item": "Avionics Power Lock", "done": True},
        {"item": "Propellant Pressurization", "done": False},
        {"item": "Liquid LOX Loading", "done": False},
        {"item": "Apogee Shield Deploy Verify", "done": False}
    ]

    new_m = Mission(
        name=data.name,
        status=data.status,
        rocket=data.rocket,
        crew_json=json.dumps(data.crew),
        launch_date=ld,
        destination=data.destination,
        fuel=data.fuel,
        velocity=data.velocity,
        altitude=data.altitude,
        payload=data.payload,
        description=data.description,
        checklist_json=json.dumps(checklist)
    )
    db.add(new_m)
    db.commit()
    db.refresh(new_m)

    audit = AuditLog(username=current_user["username"], action="create_mission", details=f"Scheduled flight: {data.name}")
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "data": {
            "_id": str(new_m.id),
            "name": new_m.name,
            "status": new_m.status,
            "rocket": new_m.rocket,
            "crew": data.crew,
            "launchDate": new_m.launch_date.isoformat(),
            "destination": new_m.destination,
            "fuel": new_m.fuel,
            "velocity": new_m.velocity,
            "altitude": new_m.altitude,
            "payload": new_m.payload,
            "description": new_m.description
        }
    }

@router.put("/{mission_id}")
async def update_mission(mission_id: str, data: dict, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    m = db.query(Mission).filter(Mission.id == int(mission_id)).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    if "name" in data: m.name = data["name"]
    if "status" in data: m.status = data["status"]
    if "rocket" in data: m.rocket = data["rocket"]
    if "destination" in data: m.destination = data["destination"]
    if "fuel" in data: m.fuel = float(data["fuel"])
    if "velocity" in data: m.velocity = float(data["velocity"])
    if "altitude" in data: m.altitude = float(data["altitude"])
    if "payload" in data: m.payload = data["payload"]
    if "description" in data: m.description = data["description"]
    if "checklist" in data: m.checklist_json = json.dumps(data["checklist"])
    if "timeline" in data: m.timeline_json = json.dumps(data["timeline"])
    
    if "launchDate" in data:
        try:
            m.launch_date = datetime.fromisoformat(data["launchDate"].replace("Z", "+00:00"))
        except ValueError:
            pass

    db.commit()
    
    audit = AuditLog(username=current_user["username"], action="update_mission", details=f"Modified flight status of: {m.name}")
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "data": {
            "_id": str(m.id),
            "name": m.name,
            "status": m.status,
            "rocket": m.rocket,
            "launchDate": m.launch_date.isoformat(),
            "destination": m.destination
        }
    }

@router.delete("/{mission_id}")
async def delete_mission(mission_id: str, current_user: dict = Depends(RoleAuthorize("Admin")), db: Session = Depends(get_db_session)):
    m = db.query(Mission).filter(Mission.id == int(mission_id)).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    db.delete(m)
    db.commit()

    audit = AuditLog(username=current_user["username"], action="delete_mission", details=f"Deleted flight manifest: {mission_id}")
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Mission decoupled from operations"}

@router.post("/{mission_id}/bookmark")
async def toggle_bookmark(mission_id: str, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    m = db.query(Mission).filter(Mission.id == int(mission_id)).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    m.bookmarked = not m.bookmarked
    db.commit()
    return {"success": True, "bookmarked": m.bookmarked}

@router.post("/{mission_id}/timeline")
async def generate_timeline(mission_id: str, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    m = db.query(Mission).filter(Mission.id == int(mission_id)).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    # AI flight timeline blueprint generator
    timeline = [
        {"time": "T-10h", "event": "Booster Rollout Completed"},
        {"time": "T-6h", "event": "Cryo Load Start"},
        {"time": "T-1h", "event": "Flight Crew Boarding Sequence"},
        {"time": "T-0", "event": "Booster Main Stage Ignition"},
        {"time": "T+1m 12s", "event": "Max Q Aerodynamic Thrust Peak"},
        {"time": "T+2m 45s", "event": "Stage 1 Separation MECO"},
        {"time": "T+8m 30s", "event": "Stage 2 Orbit Insertion"}
    ]
    m.timeline_json = json.dumps(timeline)
    db.commit()
    return {"success": True, "timeline": timeline}

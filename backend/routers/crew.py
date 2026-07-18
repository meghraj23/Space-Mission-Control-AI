import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Crew, AuditLog
from middleware.auth import RoleAuthorize

router = APIRouter(prefix="/api/crew", tags=["crew"])

class CrewSchema(BaseModel):
    name: str
    role: str
    status: str = "Idle"
    heartRate: int = 72
    bloodPressure: str = "120/80"
    oxygenLevel: int = 99
    performanceScore: float = 98.0
    bio: str = ""
    avatar: str = ""

class DutySchema(BaseModel):
    time: str
    task: str

@router.get("")
async def get_crew(current_user: dict = Depends(RoleAuthorize("Admin", "Operator", "Scientist", "Guest")), db: Session = Depends(get_db_session)):
    crew = db.query(Crew).all()
    output = []
    for c in crew:
        output.append({
            "_id": str(c.id),
            "name": c.name,
            "role": c.role,
            "status": c.status,
            "heartRate": c.heart_rate,
            "bloodPressure": c.blood_pressure,
            "oxygenLevel": c.oxygen_level,
            "performanceScore": c.performance_score,
            "bio": c.bio,
            "avatar": c.avatar,
            "assignments": json.loads(c.duty_assignments_json or '[]')
        })
    return {"success": True, "data": output}

@router.post("")
async def create_crew(data: CrewSchema, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    new_c = Crew(
        name=data.name,
        role=data.role,
        status=data.status,
        heart_rate=data.heartRate,
        blood_pressure=data.bloodPressure,
        oxygen_level=data.oxygenLevel,
        performance_score=data.performanceScore,
        bio=data.bio,
        avatar=data.avatar
    )
    db.add(new_c)
    db.commit()
    db.refresh(new_c)

    audit = AuditLog(username=current_user["username"], action="create_crew", details=f"Deployed astronaut: {data.name}")
    db.add(audit)
    db.commit()

    return {"success": True, "data": {"_id": str(new_c.id), "name": new_c.name}}

@router.put("/{member_id}")
async def update_crew(member_id: str, data: dict, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    c = db.query(Crew).filter(Crew.id == int(member_id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Crew member not found")
        
    if "name" in data: c.name = data["name"]
    if "role" in data: c.role = data["role"]
    if "status" in data: c.status = data["status"]
    if "heartRate" in data: c.heart_rate = int(data["heartRate"])
    if "oxygenLevel" in data: c.oxygen_level = int(data["oxygenLevel"])
    if "performanceScore" in data: c.performance_score = float(data["performanceScore"])
    if "assignments" in data: c.duty_assignments_json = json.dumps(data["assignments"])
    
    db.commit()
    return {"success": True, "data": {"_id": str(c.id), "name": c.name}}

@router.post("/{member_id}/assign")
async def add_duty_assignment(member_id: str, duty: DutySchema, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    c = db.query(Crew).filter(Crew.id == int(member_id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Crew member not found")
        
    assignments = json.loads(c.duty_assignments_json or '[]')
    assignments.append({"time": duty.time, "task": duty.task})
    c.duty_assignments_json = json.dumps(assignments)
    db.commit()
    
    return {"success": True, "assignments": assignments}

@router.delete("/{member_id}")
async def delete_crew(member_id: str, current_user: dict = Depends(RoleAuthorize("Admin")), db: Session = Depends(get_db_session)):
    c = db.query(Crew).filter(Crew.id == int(member_id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Crew member not found")
        
    db.delete(c)
    db.commit()
    return {"success": True, "message": "Crew member removed from deck Roster"}

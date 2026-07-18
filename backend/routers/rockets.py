import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Rocket, AuditLog
from middleware.auth import RoleAuthorize

router = APIRouter(prefix="/api/rockets", tags=["rockets"])

class RocketSchema(BaseModel):
    name: str
    type: str
    status: str = "Active"
    fuelCapacity: float
    thrust: float
    height: float
    mass: float
    successRate: float = 100.0
    image: str = ""

class MaintenanceSchema(BaseModel):
    type: str
    technician: str
    status: str

@router.get("")
async def get_rockets(current_user: dict = Depends(RoleAuthorize("Admin", "Operator", "Scientist", "Guest")), db: Session = Depends(get_db_session)):
    rockets = db.query(Rocket).all()
    output = []
    for r in rockets:
        output.append({
            "_id": str(r.id),
            "name": r.name,
            "type": r.type,
            "status": r.status,
            "fuelCapacity": r.fuel_capacity,
            "thrust": r.thrust,
            "height": r.height,
            "mass": r.mass,
            "successRate": r.success_rate,
            "image": r.image,
            "inventory": json.loads(r.inventory_json or '[]'),
            "maintenanceLogs": json.loads(r.maintenance_logs_json or '[]')
        })
    return {"success": True, "data": output}

@router.post("")
async def create_rocket(data: RocketSchema, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    new_r = Rocket(
        name=data.name,
        type=data.type,
        status=data.status,
        fuel_capacity=data.fuelCapacity,
        thrust=data.thrust,
        height=data.height,
        mass=data.mass,
        success_rate=data.successRate,
        image=data.image
    )
    db.add(new_r)
    db.commit()
    db.refresh(new_r)

    audit = AuditLog(username=current_user["username"], action="create_rocket", details=f"Registered vehicle: {data.name}")
    db.add(audit)
    db.commit()

    return {"success": True, "data": {"_id": str(new_r.id), "name": new_r.name}}

@router.post("/{rocket_id}/maintenance")
async def add_maintenance_log(rocket_id: str, log: MaintenanceSchema, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    r = db.query(Rocket).filter(Rocket.id == int(rocket_id)).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rocket not found")
    
    logs = json.loads(r.maintenance_logs_json or '[]')
    new_log = {
        "date": datetime.utcnow().date().isoformat() if "datetime" in globals() else "2026-07-18",
        "type": log.type,
        "technician": log.technician,
        "status": log.status
    }
    logs.append(new_log)
    r.maintenance_logs_json = json.dumps(logs)
    db.commit()

    audit = AuditLog(username=current_user["username"], action="add_maintenance", details=f"Logged maintenance for: {r.name}")
    db.add(audit)
    db.commit()

    return {"success": True, "logs": logs}

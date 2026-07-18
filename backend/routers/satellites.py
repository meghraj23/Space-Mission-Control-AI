from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Satellite, AuditLog
from middleware.auth import RoleAuthorize

router = APIRouter(prefix="/api/satellites", tags=["satellites"])

class SatelliteSchema(BaseModel):
    name: str
    designation: str
    status: str = "Operational"
    orbit: str = "Low Earth Orbit (LEO)"
    altitude: float = 400.0
    battery: float = 100.0
    signalStrength: float = 100.0

@router.get("")
async def get_satellites(current_user: dict = Depends(RoleAuthorize("Admin", "Operator", "Scientist", "Guest")), db: Session = Depends(get_db_session)):
    sats = db.query(Satellite).all()
    output = []
    for s in sats:
        output.append({
            "_id": str(s.id),
            "name": s.name,
            "designation": s.designation,
            "status": s.status,
            "orbit": s.orbit,
            "altitude": s.altitude,
            "battery": s.battery,
            "signalStrength": s.signal_strength,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "favorite": s.favorite
        })
    return {"success": True, "data": output}

@router.post("")
async def create_satellite(data: SatelliteSchema, current_user: dict = Depends(RoleAuthorize("Admin", "Operator", "Scientist")), db: Session = Depends(get_db_session)):
    new_s = Satellite(
        name=data.name,
        designation=data.designation,
        status=data.status,
        orbit=data.orbit,
        altitude=data.altitude,
        battery=data.battery,
        signal_strength=data.signalStrength,
        latitude=0.0,
        longitude=0.0
    )
    db.add(new_s)
    db.commit()
    db.refresh(new_s)

    audit = AuditLog(username=current_user["username"], action="create_satellite", details=f"Registered sat node: {data.name}")
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "data": {
            "_id": str(new_s.id),
            "name": new_s.name,
            "designation": new_s.designation
        }
    }

@router.put("/{sat_id}")
async def update_satellite(sat_id: str, data: dict, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    s = db.query(Satellite).filter(Satellite.id == int(sat_id)).first()
    if not s:
        raise HTTPException(status_code=404, detail="Satellite not found")
        
    if "name" in data: s.name = data["name"]
    if "status" in data: s.status = data["status"]
    if "orbit" in data: s.orbit = data["orbit"]
    if "altitude" in data: s.altitude = float(data["altitude"])
    if "battery" in data: s.battery = float(data["battery"])
    if "signalStrength" in data: s.signal_strength = float(data["signalStrength"])
    if "latitude" in data: s.latitude = float(data["latitude"])
    if "longitude" in data: s.longitude = float(data["longitude"])
    
    db.commit()
    return {"success": True, "data": {"_id": str(s.id), "name": s.name}}

@router.delete("/{sat_id}")
async def delete_satellite(sat_id: str, current_user: dict = Depends(RoleAuthorize("Admin")), db: Session = Depends(get_db_session)):
    s = db.query(Satellite).filter(Satellite.id == int(sat_id)).first()
    if not s:
        raise HTTPException(status_code=404, detail="Satellite not found")
    
    db.delete(s)
    db.commit()
    return {"success": True, "message": "Satellite decommissioned successfully"}

@router.post("/{sat_id}/favorite")
async def toggle_favorite(sat_id: str, current_user: dict = Depends(RoleAuthorize("Admin", "Operator")), db: Session = Depends(get_db_session)):
    s = db.query(Satellite).filter(Satellite.id == int(sat_id)).first()
    if not s:
        raise HTTPException(status_code=404, detail="Satellite not found")
    s.favorite = not s.favorite
    db.commit()
    return {"success": True, "favorite": s.favorite}

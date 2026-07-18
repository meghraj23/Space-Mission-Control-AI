from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Notification
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("")
async def get_notifications(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    alerts = db.query(Notification).order_by(Notification.timestamp.desc()).limit(100).all()
    output = []
    for a in alerts:
        output.append({
            "_id": str(a.id),
            "title": a.title,
            "message": a.message,
            "type": a.type,
            "read": a.read,
            "timestamp": a.timestamp.isoformat()
        })
    return {"success": True, "data": output}

@router.put("/{notif_id}/read")
async def read_notification(notif_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    a = db.query(Notification).filter(Notification.id == int(notif_id)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    a.read = True
    db.commit()
    
    return {
        "success": True,
        "data": {
            "_id": str(a.id),
            "title": a.title,
            "read": a.read
        }
    }

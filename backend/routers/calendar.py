from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import CalendarEvent
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

@router.get("")
async def get_calendar_events(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    events = db.query(CalendarEvent).all()
    output = []
    for e in events:
        output.append({
            "id": e.id,
            "title": e.title,
            "startDate": e.start_date.isoformat(),
            "endDate": e.end_date.isoformat(),
            "type": e.type,
            "description": e.description
        })
    return {"success": True, "data": output}

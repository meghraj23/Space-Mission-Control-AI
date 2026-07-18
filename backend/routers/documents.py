from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Document
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.get("")
async def get_documents(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    docs = db.query(Document).all()
    # Seed default docs if table is empty
    if not docs:
        default_docs = [
            Document(name="FlightPlan_LunarOne.pdf", type="flight_plan", size_bytes=1048576, summary="AI summary: Outlines booster profiles and descent matrices for Artemis South Pole landing."),
            Document(name="Raptor_Maintenance_Manifold.pdf", type="technical_spec", size_bytes=2457600, summary="AI summary: Specifications for RS-9 turbopump manifold clearances and helium check-valves.")
        ]
        db.add_all(default_docs)
        db.commit()
        docs = db.query(Document).all()

    output = []
    for d in docs:
        output.append({
            "id": d.id,
            "name": d.name,
            "type": d.type,
            "sizeBytes": d.size_bytes,
            "summary": d.summary,
            "createdAt": d.created_at.isoformat()
        })
    return {"success": True, "data": output}

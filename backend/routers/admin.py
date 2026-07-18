from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import AuditLog
from middleware.auth import RoleAuthorize
import json

router = APIRouter(prefix="/api/admin", tags=["admin"])

class WebhookSchema(BaseModel):
    url: str
    event: str # telemetry_alert, weather_alert, launch_completed

# Local memory store for mock webhooks configuration
webhooks_store = [
    {"url": "https://example.com/slack-webhook-placeholder", "event": "telemetry_alert"}
]

@router.get("/audits")
async def get_audit_logs(current_user: dict = Depends(RoleAuthorize("Admin")), db: Session = Depends(get_db_session)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    output = []
    for l in logs:
        output.append({
            "id": l.id,
            "username": l.username,
            "action": l.action,
            "details": l.details,
            "timestamp": l.timestamp.isoformat()
        })
    return {"success": True, "data": output}

@router.get("/webhooks")
async def get_webhooks(current_user: dict = Depends(RoleAuthorize("Admin"))):
    return {"success": True, "data": webhooks_store}

@router.post("/webhooks")
async def create_webhook(data: WebhookSchema, current_user: dict = Depends(RoleAuthorize("Admin"))):
    new_hook = {"url": data.url, "event": data.event}
    webhooks_store.append(new_hook)
    return {"success": True, "data": new_hook}

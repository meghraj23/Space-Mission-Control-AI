import os
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import User, AuditLog
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkey987654321")
ALGORITHM = "HS256"

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "Guest"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SettingsUpdate(BaseModel):
    refreshRate: int = 1000
    notifications: bool = True

def generate_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode = {"id": str(user_id), "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

@router.post("/register")
async def register(data: UserRegister, db: Session = Depends(get_db_session)):
    existing = db.query(User).filter((User.email == data.email) | (User.username == data.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = bcrypt.hash(data.password)
    new_user = User(
        username=data.username,
        email=data.email,
        password=hashed_password,
        role=data.role,
        profile_pic="",
        theme="dark",
        notifications_enabled=True,
        refresh_rate=1000
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log Audit
    audit = AuditLog(username=data.username, action="register", details=f"User registered with role: {data.role}")
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "data": {
            "_id": str(new_user.id),
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role,
            "token": generate_token(new_user.id)
        }
    }

@router.post("/login")
async def login(data: UserLogin, db: Session = Depends(get_db_session)):
    user = db.query(User).filter(User.email == data.email).first()
    if user and bcrypt.verify(data.password, user.password):
        # Update login history
        history = json.loads(user.login_history or '[]')
        history.append({"timestamp": datetime.utcnow().isoformat(), "ip": "127.0.0.1"})
        user.login_history = json.dumps(history[-15:])
        
        # Update device logs
        devices = json.loads(user.device_history or '[]')
        if not any(d.get("agent") == "Chrome/Win10" for d in devices):
            devices.append({"agent": "Chrome/Win10", "location": "US Operations Deck"})
        user.device_history = json.dumps(devices)
        
        db.commit()

        # Log Audit
        audit = AuditLog(username=user.username, action="login", details="Operator logged into terminal deck.")
        db.add(audit)
        db.commit()

        return {
            "success": True,
            "data": {
                "_id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "profilePic": user.profile_pic,
                "settings": {
                    "theme": user.theme,
                    "notifications": user.notifications_enabled,
                    "refreshRate": user.refresh_rate
                },
                "token": generate_token(user.id)
            }
        }
    raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": current_user
    }

@router.put("/settings")
async def update_settings(settings: SettingsUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    user_id = int(current_user["_id"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.refresh_rate = settings.refreshRate
    user.notifications_enabled = settings.notifications
    db.commit()
    
    return {
        "success": True,
        "data": {
            "theme": user.theme,
            "notifications": user.notifications_enabled,
            "refreshRate": user.refresh_rate
        }
    }

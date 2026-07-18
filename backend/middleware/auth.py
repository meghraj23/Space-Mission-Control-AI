import os
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import User

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkey987654321")
ALGORITHM = "HS256"

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db_session)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authorization credentials")
        
        # Query User from SQLAlchemy db Session
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user_dict = {
                "_id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "profilePic": user.profile_pic,
                "settings": {
                    "theme": user.theme,
                    "notifications": user.notifications_enabled,
                    "refreshRate": user.refresh_rate
                }
            }
            return user_dict
        
        raise HTTPException(status_code=401, detail="User not found")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token connection")

class RoleAuthorize:
    def __init__(self, *allowed_roles: str):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "Guest")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"User role '{user_role}' is not authorized to access this route"
            )
        return current_user

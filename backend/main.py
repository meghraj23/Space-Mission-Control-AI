import os
import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import config.db as db_config
from config.seed import seed_db
from services.telemetry_simulator import start_telemetry_simulation

# Router imports
from routers.auth import router as auth_router
from routers.missions import router as missions_router
from routers.rockets import router as rockets_router
from routers.satellites import router as satellites_router
from routers.crew import router as crew_router
from routers.telemetry import router as telemetry_router
from routers.notifications import router as notifications_router
from routers.ai import router as ai_router
from routers.weather import router as weather_router
from routers.archive import router as archive_router
from routers.calendar import router as calendar_router
from routers.news import router as news_router
from routers.documents import router as documents_router
from routers.explorer import router as explorer_router
from routers.reports import router as reports_router
from routers.admin import router as admin_router
from routers.monitoring import router as monitoring_router

app = FastAPI(
    title="Mission Control Space Command Center Core API",
    description="Advanced Python FastAPI SQL Command Server"
)

# 1. CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Socket.io ASGI wrapper setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='socket.io')

@sio.event
async def connect(sid, environ):
    print(f"[WebSocket] Operator Connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"[WebSocket] Operator Disconnected: {sid}")

# 3. Mount Routers
app.include_router(auth_router)
app.include_router(missions_router)
app.include_router(rockets_router)
app.include_router(satellites_router)
app.include_router(crew_router)
app.include_router(telemetry_router)
app.include_router(notifications_router)
app.include_router(ai_router)
app.include_router(weather_router)
app.include_router(archive_router)
app.include_router(calendar_router)
app.include_router(news_router)
app.include_router(documents_router)
app.include_router(explorer_router)
app.include_router(reports_router)
app.include_router(admin_router)
app.include_router(monitoring_router)

# 4. Startup Hook
@app.on_event("startup")
async def startup_event():
    # Initialize DB (attempt MySQL, failover to SQLite)
    db_config.init_db()
    
    # Seed DB with initial entities
    db = db_config.SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    
    # Start the real-time background telemetry loops
    start_telemetry_simulation(sio)

@app.get("/api/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "MySQL/SQLite failover operational"
    }

@app.get("/")
async def root():
    return {"message": "Mission Control Space Command Center Core FastAPI is operational."}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("main:socket_app", host="0.0.0.0", port=port, reload=True)

from fastapi import APIRouter, Depends
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/archive", tags=["archive"])

@router.get("")
async def get_mission_archive(current_user: dict = Depends(get_current_user)):
    # Historical launch registry records
    return {
        "success": True,
        "data": [
            {"id": "h1", "name": "Artemis I", "date": "2022-11-16", "rocket": "SLS Block 1", "destination": "Lunar Orbit", "status": "Completed", "details": "Unmanned lunar test flight of the Orion capsule."},
            {"id": "h2", "name": "Crew-7", "date": "2023-08-26", "rocket": "Falcon 9", "destination": "ISS", "status": "Completed", "details": "Commercial crew rotation deployment."},
            {"id": "h3", "name": "Psyche launch", "date": "2023-10-13", "rocket": "Falcon Heavy", "destination": "Psyche Asteroid belt", "status": "Completed", "details": "Deep space planetary science explorer launch."}
        ]
    }

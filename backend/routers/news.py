from fastapi import APIRouter, Depends
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/news", tags=["news"])

@router.get("")
async def get_space_news(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": [
            {"title": "Artemis III Crew Habitat Finalized", "source": "NASA Ames", "summary": "Lunar shelter prototypes undergo vacuum chamber seal evaluations in Houston.", "timestamp": "2026-07-18T10:00:00Z"},
            {"title": "SpaceX Starship Static Fire Complete", "source": "SpaceX Boca", "summary": "Super Heavy booster static fires 33 engines for 6 seconds on orbital mount.", "timestamp": "2026-07-17T18:30:00Z"},
            {"title": "Solar Flare raises polar auroras intensity", "source": "NOAA Space Weather", "summary": "Kp-5 geomagnetic storm results in auroras visible in northern US latitudes.", "timestamp": "2026-07-17T12:00:00Z"}
        ]
    }

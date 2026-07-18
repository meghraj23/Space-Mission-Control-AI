from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
import random

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("")
async def get_space_weather(current_user: dict = Depends(get_current_user)):
    # Solar indices, proton flux densities, coronal temperatures, magnetic indices
    return {
        "success": True,
        "solarWind": f"{round(random.uniform(380.0, 480.0), 1)} km/s",
        "protonFlux": f"{round(random.uniform(3.5, 6.0), 2)} MeV",
        "coronalTemp": "1.25M Kelvin",
        "kpIndex": f"Kp-{random.randint(2, 5)}",
        "kpStatus": "Minor Storm Warning" if random.randint(2, 5) >= 4 else "Nominal",
        "alerts": [
            {"title": "M-Class Flare Alert", "description": "Solar flare eruption observed at Active Region 3491. Spacecraft RF noise levels elevated."}
        ]
    }

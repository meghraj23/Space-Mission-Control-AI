from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import get_current_user
import random

router = APIRouter(prefix="/api/explorer", tags=["explorer"])

class RoverCommandSchema(BaseModel):
    command: str # forward, left, right, reverse, scan

@router.get("/planets")
async def get_planets(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": [
            {"name": "Mercury", "distance": "0.39 AU", "temp": "167°C", "gravity": "3.7 m/s²", "moons": 0},
            {"name": "Venus", "distance": "0.72 AU", "temp": "464°C", "gravity": "8.87 m/s²", "moons": 0},
            {"name": "Earth", "distance": "1.0 AU", "temp": "15°C", "gravity": "9.81 m/s²", "moons": 1},
            {"name": "Mars", "distance": "1.52 AU", "temp": "-65°C", "gravity": "3.71 m/s²", "moons": 2},
            {"name": "Jupiter", "distance": "5.2 AU", "temp": "-110°C", "gravity": "24.79 m/s²", "moons": 95}
        ]
    }

@router.post("/rover/command")
async def send_rover_command(cmd: RoverCommandSchema, current_user: dict = Depends(get_current_user)):
    # Rover command dashboard controls feedback
    directions = {
        "forward": "Rover moved forward 5 meters.",
        "left": "Rover yaw rotated left 15 degrees.",
        "right": "Rover yaw rotated right 15 degrees.",
        "reverse": "Rover backed up 2 meters.",
        "scan": "Scientific spectrometer scan completed. Detected silicon oxide peaks."
    }
    action = directions.get(cmd.command, "Invalid command payload.")
    return {
        "success": True,
        "action": action,
        "latency": f"{round(random.uniform(4.2, 14.5), 1)} minutes (Mars transmission lag)"
    }

import asyncio
import random
import json
from datetime import datetime
import config.db as db_config
from models.db_models import Mission, Satellite, Telemetry, Notification, Crew

simulation_task = None

async def telemetry_simulation_loop(sio):
    print("[Telemetry Simulator] Real-Time SQL Flight Vector Simulator started.")
    while True:
        db = None
        try:
            # Open local SQLAlchemy Session
            db = db_config.SessionLocal()
            if db is None:
                await asyncio.sleep(3)
                continue

            # 1. UPDATE ACTIVE MISSIONS
            active_missions = db.query(Mission).filter(Mission.status == 'Active').all()
            for m in active_missions:
                fuel = float(m.fuel)
                velocity = float(m.velocity)
                altitude = float(m.altitude)
                
                if fuel > 0.1:
                    fuel = max(0.0, fuel - 0.05)
                    velocity += random.randint(-5, 15)
                    altitude += round(velocity / 36000.0, 4)
                else:
                    fuel = 0.0
                    velocity = max(100.0, velocity - 100.0)
                    
                m.fuel = round(fuel, 2)
                m.velocity = int(velocity)
                m.altitude = round(altitude, 2)
                
                # Write time-series telemetry log slice
                t_slice = Telemetry(
                    mission_id=m.id,
                    timestamp=datetime.utcnow(),
                    velocity=m.velocity,
                    altitude=m.altitude,
                    pressure=round(max(0.0, 101.3 - (m.altitude / 1000.0)), 2),
                    temperature=round(-40.0 + random.random() * 10.0, 2),
                    fuel_level=m.fuel,
                    engine_status="Critical Fuel" if m.fuel < 10.0 else "Nominal",
                    crew_pulse=65 + random.randint(0, 20),
                    crew_o2=98 + random.randint(0, 1)
                )
                db.add(t_slice)
                
                # Broadcast Socket.io packet
                t_dict = {
                    "velocity": t_slice.velocity,
                    "altitude": t_slice.altitude,
                    "pressure": t_slice.pressure,
                    "temperature": t_slice.temperature,
                    "fuelLevel": t_slice.fuel_level,
                    "engineStatus": t_slice.engine_status,
                    "crewPulse": t_slice.crew_pulse,
                    "crewO2": t_slice.crew_o2,
                    "timestamp": t_slice.timestamp.isoformat()
                }
                await sio.emit("telemetry_update", {"missionId": str(m.id), "telemetry": t_dict})
                
                # Trigger low fuel warning notifications
                if 0.0 < m.fuel < 10.0:
                    alert = Notification(
                        title="Critical Fuel Warning",
                        message=f"Mission {m.name} fuel reserves below 10%. Emergency return vector required.",
                        type="danger",
                        read=False,
                        timestamp=datetime.utcnow()
                    )
                    db.add(alert)
                    db.commit() # Save to get ID
                    
                    alert_dict = {
                        "_id": str(alert.id),
                        "title": alert.title,
                        "message": alert.message,
                        "type": alert.type,
                        "read": alert.read,
                        "timestamp": alert.timestamp.isoformat()
                    }
                    await sio.emit("notification_alert", alert_dict)
            
            # 2. UPDATE SATELLITES (Position Drift and battery levels)
            satellites = db.query(Satellite).filter(Satellite.status == 'Operational').all()
            for sat in satellites:
                sat.latitude += (random.random() * 0.4 - 0.2)
                sat.longitude += (random.random() * 0.4 - 0.2)
                sat.battery = max(10.0, sat.battery - (random.random() * 0.1))
                
                # Wrap coordinates
                if sat.latitude > 90.0: sat.latitude = -90.0
                if sat.latitude < -90.0: sat.latitude = 90.0
                if sat.longitude > 180.0: sat.longitude = -180.0
                if sat.longitude < -180.0: sat.longitude = 180.0
                
                sat.latitude = round(sat.latitude, 4)
                sat.longitude = round(sat.longitude, 4)
                sat.battery = round(sat.battery, 1)
                
                await sio.emit("satellite_update", {
                    "_id": str(sat.id),
                    "latitude": sat.latitude,
                    "longitude": sat.longitude,
                    "battery": sat.battery
                })

            # 3. UPDATE CREW BIOMETRICS (Heartrate fluctuation)
            crew = db.query(Crew).filter(Crew.status == 'Active').all()
            for c in crew:
                c.heart_rate = 60 + random.randint(0, 25)
                c.oxygen_level = 97 + random.randint(0, 2)
                
                await sio.emit("crew_update", {
                    "_id": str(c.id),
                    "heartRate": c.heart_rate,
                    "oxygenLevel": c.oxygen_level
                })
            
            db.commit()
        except Exception as e:
            print(f"[Telemetry Simulator] Error in simulation tick: {str(e)}")
            if db:
                db.rollback()
        finally:
            if db:
                db.close()
                
        await asyncio.sleep(3)

def start_telemetry_simulation(sio):
    global simulation_task
    if simulation_task is None:
        loop = asyncio.get_event_loop()
        simulation_task = loop.create_task(telemetry_simulation_loop(sio))

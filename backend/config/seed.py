from sqlalchemy.orm import Session
from models.db_models import User, Rocket, Crew, Satellite, Mission, Notification, CalendarEvent
from passlib.hash import bcrypt
from datetime import datetime, timedelta

def seed_db(db: Session):
    # Check if User table is empty
    if db.query(User).count() > 0:
        print("[Seed] Database already populated. Skipping seeding.")
        return

    print("[Seed] Seeding default database metrics...")

    # 1. Users
    hashed_admin = bcrypt.hash("admin123")
    hashed_guest = bcrypt.hash("guest123")

    users = [
        User(username="admin", email="admin@missioncontrol.gov", password=hashed_admin, role="Admin",
             profile_pic="https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop"),
        User(username="operator", email="operator@missioncontrol.gov", password=hashed_guest, role="Operator",
             profile_pic="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"),
        User(username="scientist", email="scientist@missioncontrol.gov", password=hashed_guest, role="Scientist",
             profile_pic="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"),
        User(username="guest", email="guest@missioncontrol.gov", password=hashed_guest, role="Guest",
             profile_pic="")
    ]
    db.add_all(users)

    # 2. Rockets
    rockets = [
        Rocket(name="Starship-HLS", type="Heavy Lift Launch Vehicle", status="Active",
               fuel_capacity=4600000, thrust=74000, height=121, mass=5000000, success_rate=94.0,
               image="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=400&auto=format&fit=crop",
               inventory_json='[{"part": "Raptor Engine 9", "status": "Nominal", "hours": 120}, {"part": "Cryo Valve B", "status": "Nominal", "hours": 42}]',
               maintenance_logs_json='[{"date": "2026-07-10", "type": "Booster Static Fire Test", "technician": "Sarah Chen", "status": "Nominal"}]'),
        Rocket(name="Falcon Heavy", type="Partially Reusable Lift Vehicle", status="Active",
               fuel_capacity=411000, thrust=22819, height=70, mass=1420788, success_rate=99.0,
               image="https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=400&auto=format&fit=crop",
               inventory_json='[{"part": "Merlin 1D Core", "status": "Nominal", "hours": 450}]',
               maintenance_logs_json='[{"date": "2026-06-15", "type": "Landing Leg Refurbishment", "technician": "Alex Mercer", "status": "Nominal"}]'),
        Rocket(name="Artemis SLS", type="Super Heavy Lift Launch Vehicle", status="In Maintenance",
               fuel_capacity=3300000, thrust=41000, height=98, mass=2600000, success_rate=100.0,
               image="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400&auto=format&fit=crop",
               inventory_json='[{"part": "Core Stage RS-25", "status": "In Maintenance", "hours": 12}]',
               maintenance_logs_json='[{"date": "2026-07-14", "type": "Hydrogen Valve Leak Test", "technician": "Marcus Vance", "status": "Failed - Replaced"}]')
    ]
    db.add_all(rockets)

    # 3. Crew
    crew = [
        Crew(name="Commander Alex Mercer", role="Mission Commander", status="Active", heart_rate=68,
             blood_pressure="118/76", oxygen_level=99, performance_score=98.0,
             bio="Former Navy test pilot, veteran of two Space Shuttle flights and 180 days aboard the ISS.",
             avatar="https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=200&auto=format&fit=crop",
             duty_assignments_json='[{"time": "0800", "task": "Booster Checks"}, {"time": "1200", "task": "Crew EVA Guidance"}]'),
        Crew(name="Dr. Sarah Chen", role="Flight Systems Engineer", status="Active", heart_rate=74,
             blood_pressure="122/80", oxygen_level=98, performance_score=97.0,
             bio="PhD in Aerospace Robotics from MIT. Expert in satellite telemetry and autonomous orbital docking.",
             avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
             duty_assignments_json='[{"time": "0900", "task": "Telemetry Review"}, {"time": "1500", "task": "Docking Simulation"}]'),
        Crew(name="Dr. Elena Rostova", role="Astrobiologist", status="Training", heart_rate=71,
             blood_pressure="120/78", oxygen_level=99, performance_score=95.0,
             bio="Expert in extreme environments, focused on bio-regenerative life support systems for long missions.",
             avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
             duty_assignments_json='[{"time": "1000", "task": "Bio-Regenerative System Testing"}]'),
        Crew(name="Marcus Vance", role="Orbital Dynamics Specialist", status="Idle", heart_rate=65,
             blood_pressure="115/75", oxygen_level=99, performance_score=99.0,
             bio="Pioneered several orbital mechanics algorithms currently in use by deep space robotic probes.",
             avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
             duty_assignments_json='[{"time": "1100", "task": "Apogee Refinement Models"}]')
    ]
    db.add_all(crew)

    # 4. Satellites
    satellites = [
        Satellite(name="Orbiter ISS", designation="ISS-ZARYA-1998", status="Operational",
                  orbit="Low Earth Orbit (LEO)", altitude=418.0, battery=89.0, signal_strength=97.0,
                  latitude=-12.43, longitude=78.52, favorite=True),
        Satellite(name="Starlink-A120", designation="SL-A120-2024", status="Operational",
                  orbit="Low Earth Orbit (LEO)", altitude=550.0, battery=92.0, signal_strength=95.0,
                  latitude=34.05, longitude=-118.24),
        Satellite(name="Hubble Cosmic II", designation="HST-COSMIC-II", status="Degraded",
                  orbit="Low Earth Orbit (LEO)", altitude=535.0, battery=45.0, signal_strength=62.0,
                  latitude=48.85, longitude=2.35),
        Satellite(name="Galileo Nav-X", designation="GAL-NAVX-09", status="Operational",
                  orbit="Medium Earth Orbit (MEO)", altitude=23222.0, battery=97.0, signal_strength=99.0,
                  latitude=-33.86, longitude=151.20)
    ]
    db.add_all(satellites)

    # 5. Missions
    missions = [
        Mission(name="Artemis Lunar Base-1", status="Active", rocket="Starship-HLS",
                crew_json='["Commander Alex Mercer", "Dr. Sarah Chen"]',
                launch_date=datetime.utcnow(), destination="Moon South Pole",
                fuel=76.5, velocity=28400.0, altitude=350000.0, payload="Scientific sensors & shelter modules",
                description="Human deployment and cargo landing at Moon South Pole for setting up lunar habitats.",
                checklist_json='[{"item": "Avionics Power Lock", "done": true}, {"item": "Propellant Pressurization", "done": true}, {"item": "Gimbal Alignment", "done": false}]',
                timeline_json='[{"time": "T-10m", "event": "Booster Pressurization Go"}, {"time": "T-2m", "event": "Terminal Count Lock"}, {"time": "T-0", "event": "Ignition Sequence"}]',
                bookmarked=True),
        Mission(name="Mars Ares Pathfinder", status="Scheduled", rocket="Falcon Heavy",
                crew_json='["Dr. Elena Rostova", "Marcus Vance"]',
                launch_date=datetime.utcnow() + timedelta(days=30), destination="Mars Jezero Crater",
                fuel=100.0, velocity=0.0, altitude=0.0, payload="Autonomous Exploration Rover",
                description="Scientific research and rover deployment to survey geological formations on Mars.",
                checklist_json='[{"item": "Payload Integration Check", "done": true}, {"item": "Thermal Shield Scan", "done": false}]',
                timeline_json='[{"time": "T-0", "event": "Falcon Heavy Lift Ignition"}]')
    ]
    db.add_all(missions)

    # 6. Notifications
    notifications = [
        Notification(title="Solar Flare Alert",
                     message="Class M Solar flare activity detected. Alert level raised to warning. Radiation shield deployed.",
                     type="warning", read=False),
        Notification(title="Propulsion Diagnostics",
                     message="Starship-HLS booster engine test completed. All 33 Raptor engines nominal.",
                     type="info", read=False),
        Notification(title="Altitude Loss Warning",
                     message="Hubble Cosmic II orbital decay detected. Action required to adjust orbit altitude.",
                     type="danger", read=False)
    ]
    db.add_all(notifications)

    # 7. Calendar Events
    events = [
        CalendarEvent(title="Artemis Base-1 Launch Window", start_date=datetime.utcnow() - timedelta(hours=1),
                      end_date=datetime.utcnow() + timedelta(hours=2), type="launch", description="Launch T-0 ignition event"),
        CalendarEvent(title="Raptor Engine #9 Maintenance", start_date=datetime.utcnow() + timedelta(days=2),
                      end_date=datetime.utcnow() + timedelta(days=2, hours=4), type="maintenance", description="Replacing pressure sensor manifold"),
        CalendarEvent(title="Orbit Alignment maneuver: Hubble II", start_date=datetime.utcnow() + timedelta(days=5),
                      end_date=datetime.utcnow() + timedelta(days=5, hours=1), type="orbit_maneuver", description="Booster ignition sequence for apogee drift correction")
    ]
    db.add_all(events)

    db.commit()
    print("[Seed] Default database tables seeded successfully.")

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    role = Column(String(20), default='Guest') # Admin, Operator, Scientist, Guest
    profile_pic = Column(String(255), default='')
    theme = Column(String(10), default='dark')
    notifications_enabled = Column(Boolean, default=True)
    refresh_rate = Column(Integer, default=1000)
    login_history = Column(Text, default='[]') # JSON list of login times/IPs
    device_history = Column(Text, default='[]') # JSON list of devices used
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Mission(Base):
    __tablename__ = 'missions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    status = Column(String(20), default='Scheduled') # Active, Completed, Scheduled, Delayed
    rocket = Column(String(50), nullable=False)
    crew_json = Column(Text, default='[]') # JSON string list
    launch_date = Column(DateTime, nullable=False)
    destination = Column(String(100), nullable=False)
    fuel = Column(Float, default=100.0)
    velocity = Column(Float, default=0.0)
    altitude = Column(Float, default=0.0)
    payload = Column(String(150), default='Scientific Sensors')
    description = Column(Text, default='')
    checklist_json = Column(Text, default='[]') # Launch checklist items
    timeline_json = Column(Text, default='[]') # AI generated flight timeline
    bookmarked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Rocket(Base):
    __tablename__ = 'rockets'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    type = Column(String(50), nullable=False)
    status = Column(String(20), default='Active') # Active, In Maintenance, Retired
    fuel_capacity = Column(Float, nullable=False)
    thrust = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    mass = Column(Float, nullable=False)
    success_rate = Column(Float, default=100.0)
    image = Column(String(255), default='')
    inventory_json = Column(Text, default='[]') # Rocket parts inventory
    maintenance_logs_json = Column(Text, default='[]') # Maintenance ticks
    created_at = Column(DateTime, default=datetime.utcnow)

class Satellite(Base):
    __tablename__ = 'satellites'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    designation = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default='Operational') # Operational, Inactive, Degraded
    orbit = Column(String(50), default='Low Earth Orbit (LEO)')
    altitude = Column(Float, default=400.0)
    battery = Column(Float, default=100.0)
    signal_strength = Column(Float, default=100.0)
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Telemetry(Base):
    __tablename__ = 'telemetry'
    id = Column(Integer, primary_key=True, autoincrement=True)
    mission_id = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    velocity = Column(Float, nullable=False)
    altitude = Column(Float, nullable=False)
    pressure = Column(Float, default=0.0)
    temperature = Column(Float, default=0.0)
    fuel_level = Column(Float, nullable=False)
    engine_status = Column(String(50), default='Nominal')
    crew_pulse = Column(Integer, default=72)
    crew_o2 = Column(Integer, default=99)

class Crew(Base):
    __tablename__ = 'crew'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    role = Column(String(50), nullable=False)
    status = Column(String(20), default='Idle') # Active, Idle, Training
    heart_rate = Column(Integer, default=72)
    blood_pressure = Column(String(20), default='120/80')
    oxygen_level = Column(Integer, default=99)
    performance_score = Column(Float, default=98.0)
    bio = Column(Text, default='')
    avatar = Column(String(255), default='')
    duty_assignments_json = Column(Text, default='[]') # Current schedules/logs
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(20), default='info') # info, warning, danger
    read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, default='')
    timestamp = Column(DateTime, default=datetime.utcnow)

class BackupRecord(Base):
    __tablename__ = 'backups'
    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(100), nullable=False)
    size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class CalendarEvent(Base):
    __tablename__ = 'calendar_events'
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    type = Column(String(20), default='launch') # launch, maintenance, crew_meeting, orbit_maneuver
    description = Column(Text, default='')
    created_at = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), default='flight_plan') # flight_plan, technical_spec, crew_manifest, medical_report
    size_bytes = Column(Integer, default=0)
    filepath = Column(String(255), default='')
    summary = Column(Text, default='') # AI summarized content
    created_at = Column(DateTime, default=datetime.utcnow)

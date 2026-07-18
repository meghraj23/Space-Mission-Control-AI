import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.db_models import Base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/mission_control")
sqlite_fallback_url = "sqlite:///mission_control.db"

engine = None
SessionLocal = None
is_sqlite_fallback = False

def init_db():
    global engine, SessionLocal, is_sqlite_fallback
    try:
        # 1. Attempt MySQL connection
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        # Check connection
        with engine.connect() as conn:
            pass
        print(f"[Database] Connected to MySQL database successfully.")
        is_sqlite_fallback = False
    except Exception as e:
        print(f"[Database] MySQL connection failed: {str(e)}")
        print(f"[Database] WARNING: Falling back to local SQLite database: {sqlite_fallback_url}")
        engine = create_engine(sqlite_fallback_url, connect_args={"check_same_thread": False})
        is_sqlite_fallback = True

    # Initialize tables
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return is_sqlite_fallback

# Dependency injector for routers
def get_db_session():
    if SessionLocal is None:
        init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

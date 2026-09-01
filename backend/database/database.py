from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base, Session

url = "sqlite:///./PSI.db"

engine = create_engine(
    url=url,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()

    try:
        yield db          # Give the session to FastAPI
    finally:
        db.close()  
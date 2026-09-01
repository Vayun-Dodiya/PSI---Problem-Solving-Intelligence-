from sqlalchemy import Column, Integer, String
from database import Base

# --- # - API Structure -------------------------------------------------------------------------------------------------------------------
#   {
#     "prompt": "OP",
#     "language": "string",
#     "code": "string",
#     "created_at": "31-07-2026, 19:58:51",
#     "mode": 1,
#     "id":1
#   }


class PSI(Base):
    __tablename__ = "PSI"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prompt = Column(String(500), nullable=True)
    language = Column(String(50), nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(String(20), nullable=False)
    mode = Column(String(50), nullable=False)
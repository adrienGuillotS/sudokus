from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Sudoku(Base):
    __tablename__ = "sudokus"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, nullable=False)
    date = Column(String, index=True, nullable=False)
    grid = Column(JSON, nullable=False)
    solution = Column(JSON, nullable=False)
    difficulty = Column(String, default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Integer, default=0)

from sqlalchemy.orm import Session
from app.models.sudoku import Sudoku
from app.schemas.sudoku import SudokuCreate
from typing import Optional, List
from datetime import datetime

def get_sudoku_by_device_and_date(db: Session, device_id: str, date: str) -> Optional[Sudoku]:
    return db.query(Sudoku).filter(
        Sudoku.device_id == device_id,
        Sudoku.date == date
    ).first()

def create_sudoku(db: Session, sudoku_data: dict) -> Sudoku:
    db_sudoku = Sudoku(**sudoku_data)
    db.add(db_sudoku)
    db.commit()
    db.refresh(db_sudoku)
    return db_sudoku

def update_sudoku_completion(db: Session, sudoku_id: int, completed: int, completion_time: int) -> Optional[Sudoku]:
    db_sudoku = db.query(Sudoku).filter(Sudoku.id == sudoku_id).first()
    if db_sudoku:
        db_sudoku.completed = completed
        db_sudoku.completion_time = completion_time
        db_sudoku.session_active = False
        db.commit()
        db.refresh(db_sudoku)
    return db_sudoku

def start_session(db: Session, sudoku_id: int) -> Optional[Sudoku]:
    db_sudoku = db.query(Sudoku).filter(Sudoku.id == sudoku_id).first()
    if db_sudoku and not db_sudoku.session_started:
        db_sudoku.session_started = datetime.utcnow()
        db_sudoku.session_active = True
        db.commit()
        db.refresh(db_sudoku)
    return db_sudoku

def get_sudokus_by_device(db: Session, device_id: str, skip: int = 0, limit: int = 10) -> List[Sudoku]:
    return db.query(Sudoku).filter(Sudoku.device_id == device_id).offset(skip).limit(limit).all()

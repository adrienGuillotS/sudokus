from sqlalchemy.orm import Session
from app.models.sudoku import Sudoku
from app.schemas.sudoku import SudokuCreate
from typing import Optional, List

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

def update_sudoku_completion(db: Session, sudoku_id: int, completed: int, elapsed_time: int) -> Optional[Sudoku]:
    db_sudoku = db.query(Sudoku).filter(Sudoku.id == sudoku_id).first()
    if db_sudoku:
        db_sudoku.completed = completed
        db_sudoku.elapsed_time = elapsed_time
        db.commit()
        db.refresh(db_sudoku)
    return db_sudoku

def update_elapsed_time(db: Session, sudoku_id: int, elapsed_time: int) -> Optional[Sudoku]:
    db_sudoku = db.query(Sudoku).filter(Sudoku.id == sudoku_id).first()
    if db_sudoku:
        db_sudoku.elapsed_time = elapsed_time
        db.commit()
        db.refresh(db_sudoku)
    return db_sudoku

def update_user_grid(db: Session, sudoku_id: int, user_grid: list, elapsed_time: int, notes: list = None) -> Optional[Sudoku]:
    db_sudoku = db.query(Sudoku).filter(Sudoku.id == sudoku_id).first()
    if db_sudoku:
        db_sudoku.user_grid = user_grid
        db_sudoku.elapsed_time = elapsed_time
        if notes is not None:
            db_sudoku.notes = notes
        db.commit()
        db.refresh(db_sudoku)
    return db_sudoku

def get_sudokus_by_device(db: Session, device_id: str, skip: int = 0, limit: int = 10) -> List[Sudoku]:
    return db.query(Sudoku).filter(Sudoku.device_id == device_id).offset(skip).limit(limit).all()

def get_ranking_for_date(db: Session, date: str, elapsed_time: int) -> dict:
    completed_sudokus = db.query(Sudoku).filter(
        Sudoku.date == date,
        Sudoku.completed == 1,
        Sudoku.elapsed_time > 0
    ).all()
    
    if not completed_sudokus:
        return {"rank": 1, "total": 1, "percentile": 100}
    
    times = [s.elapsed_time for s in completed_sudokus]
    times.sort()
    
    total = len(times)
    better_count = sum(1 for t in times if t < elapsed_time)
    rank = better_count + 1
    percentile = 100 - (better_count / total * 100)
    
    return {
        "rank": rank,
        "total": total + 1,
        "percentile": round(percentile, 1)
    }

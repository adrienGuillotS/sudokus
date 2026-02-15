from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.schemas.sudoku import SudokuCreate, SudokuResponse, SudokuCheck
from app.crud import sudoku as crud
from app.services.sudoku_generator import SudokuGenerator
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/sudoku", tags=["sudoku"])

@router.post("/generate", response_model=SudokuResponse)
def generate_sudoku(sudoku_create: SudokuCreate, db: Session = Depends(get_db)):
    existing = crud.get_sudoku_by_device_and_date(db, sudoku_create.device_id, sudoku_create.date)
    
    if existing:
        return existing
    
    puzzle, solution = SudokuGenerator.generate(
        sudoku_create.device_id,
        sudoku_create.date,
        sudoku_create.difficulty
    )
    
    sudoku_data = {
        "device_id": sudoku_create.device_id,
        "date": sudoku_create.date,
        "grid": puzzle,
        "solution": solution,
        "difficulty": sudoku_create.difficulty,
        "session_started": datetime.utcnow(),
        "session_active": True
    }
    
    return crud.create_sudoku(db, sudoku_data)

@router.get("/daily/{device_id}", response_model=SudokuResponse)
def get_daily_sudoku(device_id: str, difficulty: str = "medium", db: Session = Depends(get_db)):
    today = datetime.now().strftime("%Y-%m-%d")
    
    existing = crud.get_sudoku_by_device_and_date(db, device_id, today)
    if existing:
        if not existing.session_active and existing.completed == 0:
            raise HTTPException(
                status_code=403, 
                detail="Session expired. You can only attempt this puzzle once."
            )
        return existing
    
    puzzle, solution = SudokuGenerator.generate(device_id, today, difficulty)
    
    sudoku_data = {
        "device_id": device_id,
        "date": today,
        "grid": puzzle,
        "solution": solution,
        "difficulty": difficulty,
        "session_started": datetime.utcnow(),
        "session_active": True
    }
    
    return crud.create_sudoku(db, sudoku_data)

@router.post("/check")
def check_sudoku(sudoku_check: SudokuCheck, db: Session = Depends(get_db)):
    existing = crud.get_sudoku_by_device_and_date(db, sudoku_check.device_id, sudoku_check.date)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Sudoku not found")
    
    if not existing.session_active:
        raise HTTPException(status_code=403, detail="Session is no longer active")
    
    is_correct = SudokuGenerator.check_solution(sudoku_check.grid, existing.solution)
    
    if is_correct:
        if existing.session_started:
            elapsed_seconds = int((datetime.utcnow() - existing.session_started).total_seconds())
        else:
            elapsed_seconds = 0
        crud.update_sudoku_completion(db, existing.id, 1, elapsed_seconds)
    
    return {
        "correct": is_correct,
        "message": "Congratulations! You solved it!" if is_correct else "Not quite right, keep trying!"
    }

@router.get("/history/{device_id}", response_model=List[SudokuResponse])
def get_history(device_id: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_sudokus_by_device(db, device_id, skip, limit)

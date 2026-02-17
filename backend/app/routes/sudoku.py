from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.schemas.sudoku import SudokuCreate, SudokuResponse, SudokuCheck
from pydantic import BaseModel
from app.crud import sudoku as crud
from app.services.sudoku_generator import SudokuGenerator
from typing import List, Optional
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
        "difficulty": sudoku_create.difficulty
    }
    
    return crud.create_sudoku(db, sudoku_data)

@router.get("/daily/{device_id}", response_model=SudokuResponse)
def get_daily_sudoku(device_id: str, difficulty: str = "easy", db: Session = Depends(get_db)):
    today = datetime.now().strftime("%Y-%m-%d")
    
    existing = crud.get_sudoku_by_device_and_date(db, device_id, today)
    if existing:
        return existing
    
    puzzle, solution = SudokuGenerator.generate(device_id, today, difficulty)
    
    sudoku_data = {
        "device_id": device_id,
        "date": today,
        "grid": puzzle,
        "solution": solution,
        "difficulty": difficulty,
        "user_grid": puzzle,
        "notes": [[[] for _ in range(9)] for _ in range(9)],
        "elapsed_time": 0
    }
    
    return crud.create_sudoku(db, sudoku_data)

class UpdateTimeRequest(BaseModel):
    device_id: str
    date: str
    elapsed_time: int

class UpdateGridRequest(BaseModel):
    device_id: str
    date: str
    user_grid: List[List[int]]
    elapsed_time: int
    notes: Optional[List[List[List[int]]]] = None

@router.post("/update-time")
def update_time(request: UpdateTimeRequest, db: Session = Depends(get_db)):
    existing = crud.get_sudoku_by_device_and_date(db, request.device_id, request.date)
    if not existing:
        puzzle, solution = SudokuGenerator.generate(request.device_id, request.date, "easy")
        sudoku_data = {
            "device_id": request.device_id,
            "date": request.date,
            "grid": puzzle,
            "solution": solution,
            "difficulty": "easy",
            "user_grid": puzzle,
            "notes": [[[] for _ in range(9)] for _ in range(9)],
            "elapsed_time": request.elapsed_time
        }
        crud.create_sudoku(db, sudoku_data)
    else:
        crud.update_elapsed_time(db, existing.id, request.elapsed_time)
    return {"success": True}

@router.post("/update-grid")
def update_grid(request: UpdateGridRequest, db: Session = Depends(get_db)):
    existing = crud.get_sudoku_by_device_and_date(db, request.device_id, request.date)
    if not existing:
        puzzle, solution = SudokuGenerator.generate(request.device_id, request.date, "easy")
        sudoku_data = {
            "device_id": request.device_id,
            "date": request.date,
            "grid": puzzle,
            "solution": solution,
            "difficulty": "easy",
            "user_grid": request.user_grid,
            "notes": request.notes or [[[] for _ in range(9)] for _ in range(9)],
            "elapsed_time": request.elapsed_time
        }
        result = crud.create_sudoku(db, sudoku_data)
    else:
        result = crud.update_user_grid(db, existing.id, request.user_grid, request.elapsed_time, request.notes)
        print(f"[UPDATE-GRID] Updated sudoku, saved elapsed_time: {result.elapsed_time}")
    return {"success": True}

@router.post("/check")
def check_sudoku(sudoku_check: SudokuCheck, db: Session = Depends(get_db)):
    existing = crud.get_sudoku_by_device_and_date(db, sudoku_check.device_id, sudoku_check.date)
    
    
    if not existing:
        raise HTTPException(status_code=404, detail="Sudoku not found")
    
    is_correct = SudokuGenerator.check_solution(sudoku_check.grid, existing.solution)
    
    response = {
        "correct": is_correct,
        "message": "Congratulations! You solved it!" if is_correct else "Not quite right, keep trying!"
    }
    
    if is_correct:
        crud.update_sudoku_completion(db, existing.id, 1, existing.elapsed_time)
        ranking = crud.get_ranking_for_date(db, sudoku_check.date, existing.elapsed_time)
        response["elapsed_time"] = existing.elapsed_time
        response["ranking"] = ranking
    
    return response

@router.get("/history/{device_id}", response_model=List[SudokuResponse])
def get_history(device_id: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_sudokus_by_device(db, device_id, skip, limit)

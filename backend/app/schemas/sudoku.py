from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SudokuBase(BaseModel):
    device_id: str
    date: str
    difficulty: Optional[str] = "medium"

class SudokuCreate(SudokuBase):
    pass

class SudokuResponse(SudokuBase):
    id: int
    grid: List[List[int]]
    solution: List[List[int]]
    completed: int
    created_at: datetime
    elapsed_time: int = 0
    user_grid: Optional[List[List[int]]] = None
    notes: Optional[List[List[List[int]]]] = None
    
    class Config:
        from_attributes = True

class SudokuGrid(BaseModel):
    grid: List[List[int]]

class SudokuCheck(BaseModel):
    device_id: str
    date: str
    grid: List[List[int]]

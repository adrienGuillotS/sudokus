import random
from typing import List, Tuple
import hashlib
from datetime import datetime

class SudokuGenerator:
    
    @staticmethod
    def generate_seed(device_id: str, date: str) -> int:
        combined = f"{device_id}_{date}"
        hash_object = hashlib.sha256(combined.encode())
        return int(hash_object.hexdigest(), 16) % (10 ** 8)
    
    @staticmethod
    def is_valid(grid: List[List[int]], row: int, col: int, num: int) -> bool:
        for x in range(9):
            if grid[row][x] == num or grid[x][col] == num:
                return False
        
        start_row, start_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(3):
            for j in range(3):
                if grid[start_row + i][start_col + j] == num:
                    return False
        return True
    
    @staticmethod
    def solve(grid: List[List[int]]) -> bool:
        for i in range(9):
            for j in range(9):
                if grid[i][j] == 0:
                    for num in range(1, 10):
                        if SudokuGenerator.is_valid(grid, i, j, num):
                            grid[i][j] = num
                            if SudokuGenerator.solve(grid):
                                return True
                            grid[i][j] = 0
                    return False
        return True
    
    @staticmethod
    def generate_complete_grid(seed: int) -> List[List[int]]:
        random.seed(seed)
        grid = [[0 for _ in range(9)] for _ in range(9)]
        
        numbers = list(range(1, 10))
        random.shuffle(numbers)
        for i in range(9):
            grid[0][i] = numbers[i]
        
        SudokuGenerator.solve(grid)
        return grid
    
    @staticmethod
    def remove_numbers(grid: List[List[int]], difficulty: str = "easy") -> List[List[int]]:
        difficulty_map = {
            "easy": 15,
            "medium": 45,
            "hard": 55
        }
        
        cells_to_remove = difficulty_map.get(difficulty, 45)
        puzzle = [row[:] for row in grid]
        
        positions = [(i, j) for i in range(9) for j in range(9)]
        random.shuffle(positions)
        
        removed = 0
        for row, col in positions:
            if removed >= cells_to_remove:
                break
            puzzle[row][col] = 0
            removed += 1
        
        return puzzle
    
    @staticmethod
    def generate(device_id: str, date: str, difficulty: str = "easy") -> Tuple[List[List[int]], List[List[int]]]:
        seed = SudokuGenerator.generate_seed(device_id, date)
        solution = SudokuGenerator.generate_complete_grid(seed)
        puzzle = SudokuGenerator.remove_numbers(solution, difficulty)
        return puzzle, solution
    
    @staticmethod
    def check_solution(user_grid: List[List[int]], solution: List[List[int]]) -> bool:
        return user_grid == solution

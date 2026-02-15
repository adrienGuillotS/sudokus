from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import engine
from app.models.sudoku import Base
from app.routes import sudoku

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sudoku API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sudoku.router)

@app.get("/")
def root():
    return {"message": "Sudoku API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

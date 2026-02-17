from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.models.database import engine
from app.models.sudoku import Base
from app.routes import sudoku
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sudoku API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sudoku.router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Serve static frontend files if they exist
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    @app.get("/")
    def serve_frontend():
        return FileResponse("static/index.html")
    
    @app.get("/{full_path:path}")
    def serve_frontend_routes(full_path: str):
        file_path = f"static/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("static/index.html")
else:
    @app.get("/")
    def root():
        return {"message": "Sudoku API is running"}

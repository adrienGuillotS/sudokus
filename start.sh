#!/bin/bash
set -e

echo "🚀 Starting Sudoku App..."

# Change to backend directory
cd backend

# Run database migrations (create tables)
echo "📊 Creating database tables..."
python -c "from app.models.database import engine; from app.models.sudoku import Base; Base.metadata.create_all(bind=engine)"

# Start the server
echo "🌐 Starting server on port ${PORT:-8000}..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

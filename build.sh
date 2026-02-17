#!/bin/bash
set -e

echo "🔨 Building Sudoku App..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Move back to root
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -r backend/requirements.txt

# Copy frontend build to backend static folder
echo "📁 Copying frontend build to backend..."
rm -rf backend/static
cp -r frontend/dist backend/static

echo "✅ Build complete!"

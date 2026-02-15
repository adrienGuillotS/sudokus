# Daily Sudoku Generator

A full-stack web application that generates unique Sudoku puzzles daily for each device. Built with React (frontend) and FastAPI (backend).



## Project Structure

```
sudokus/
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py        # FastAPI app entry point
│   │   ├── models/        # SQLAlchemy models
│   │   │   ├── database.py
│   │   │   └── sudoku.py
│   │   ├── schemas/       # Pydantic schemas
│   │   │   └── sudoku.py
│   │   ├── crud/          # Database operations
│   │   │   └── sudoku.py
│   │   ├── services/      # Business logic
│   │   │   └── sudoku_generator.py
│   │   └── routes/        # API endpoints
│   │       └── sudoku.py
│   ├── tests/
│   ├── .env
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .gitignore
│
├── frontend/              # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── SudokuGrid.jsx
│   │   │   ├── NumberPad.jsx
│   │   │   └── Controls.jsx
│   │   ├── pages/         # Pages
│   │   │   └── SudokuPage.jsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useKeyboard.js
│   │   ├── context/       # Context API
│   │   │   └── SudokuContext.jsx
│   │   ├── services/      # API calls
│   │   │   └── api.js
│   │   ├── utils/         # Helpers
│   │   │   └── deviceId.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env
│   └── .gitignore
│
├── docker-compose.yml
└── README.md
```

## Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **Context API**: State management

## Installation & Setup

### Option 1: Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd sudokus
```

2. **Run with Docker Compose**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```
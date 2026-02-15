import { useState } from 'react'
import { SudokuProvider } from './context/SudokuContext'
import SudokuPage from './pages/SudokuPage'
import './App.css'

function App() {
  return (
    <SudokuProvider>
      <div className="App">
        <SudokuPage />
      </div>
    </SudokuProvider>
  )
}

export default App

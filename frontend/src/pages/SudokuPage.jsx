import { useState } from 'react'
import { useSudoku } from '../context/SudokuContext'
import { useKeyboard } from '../hooks/useKeyboard'
import SudokuGrid from '../components/SudokuGrid'
import NumberPad from '../components/NumberPad'
import Controls from '../components/Controls'
import './SudokuPage.css'

const SudokuPage = () => {
  const {
    loading,
    selectedCell,
    setSelectedCell,
    updateCell,
    checkSolution,
    isCompleted,
    elapsedTime,
    completionTime,
    sessionExpired,
    error
  } = useSudoku()

  const [message, setMessage] = useState('')

  const handleNumberInput = (num) => {
    if (selectedCell) {
      updateCell(selectedCell.row, selectedCell.col, num)
    }
  }

  const handleDelete = () => {
    if (selectedCell) {
      updateCell(selectedCell.row, selectedCell.col, 0)
    }
  }

  const handleArrowKey = (key) => {
    if (!selectedCell) return
    
    const { row, col } = selectedCell
    let newRow = row
    let newCol = col

    switch (key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1)
        break
      case 'ArrowDown':
        newRow = Math.min(8, row + 1)
        break
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1)
        break
      case 'ArrowRight':
        newCol = Math.min(8, col + 1)
        break
    }

    if (newRow !== row || newCol !== col) {
      setSelectedCell({ row: newRow, col: newCol })
    }
  }

  useKeyboard(selectedCell, handleNumberInput, handleDelete, handleArrowKey)

  const handleVerify = async () => {
    const result = await checkSolution()
    setMessage(result.message)
    setTimeout(() => setMessage(''), 4000)
  }

  if (loading) {
    return (
      <div className="sudoku-page">
        <div className="loading">Loading your daily Sudoku...</div>
      </div>
    )
  }

  if (sessionExpired) {
    return (
      <div className="sudoku-page">
        <div className="sudoku-container">
          <h1 className="title">Daily Sudoku</h1>
          <div className="session-expired">
            <h2>⏰ Session Expired</h2>
            <p>{error || "Your session has expired. You can only attempt each puzzle once."}</p>
            <p>Come back tomorrow for a new puzzle!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sudoku-page">
      <div className="sudoku-container">
        <h1 className="title">Daily Sudoku</h1>
        
        {message && !isCompleted && (
          <div className="message error">
            {message}
          </div>
        )}

        <SudokuGrid />
        
        <NumberPad
          onNumberClick={handleNumberInput}
          onDelete={handleDelete}
          disabled={!selectedCell || isCompleted}
        />

        <Controls
          onVerify={handleVerify}
          disabled={loading}
          isCompleted={isCompleted}
          elapsedTime={elapsedTime}
          completionTime={completionTime}
        />

        <div className="instructions">
          <p>Click a cell and use the number pad or keyboard (1-9) to fill it.</p>
          <p>Use arrow keys to navigate between cells.</p>
        </div>
      </div>
    </div>
  )
}

export default SudokuPage

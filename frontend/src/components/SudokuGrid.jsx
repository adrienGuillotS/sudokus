import { useSudoku } from '../context/SudokuContext'
import './SudokuGrid.css'

const SudokuGrid = () => {
  const { sudoku, userGrid, selectedCell, setSelectedCell, isCompleted } = useSudoku()

  if (!sudoku || !userGrid) return null

  const handleCellClick = (row, col) => {
    if (!isCompleted) {
      setSelectedCell({ row, col })
    }
  }

  const isSelected = (row, col) => {
    return selectedCell && selectedCell.row === row && selectedCell.col === col
  }

  const isInSameRow = (row) => {
    return selectedCell && selectedCell.row === row
  }

  const isInSameCol = (col) => {
    return selectedCell && selectedCell.col === col
  }

  const isSameNumber = (cell) => {
    if (!selectedCell || cell === 0) return false
    const selectedValue = userGrid[selectedCell.row][selectedCell.col]
    return selectedValue !== 0 && cell === selectedValue
  }

  return (
    <div className="sudoku-grid">
      {userGrid.map((row, rowIndex) => (
        <div key={rowIndex} className="sudoku-row">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`sudoku-cell 
                ${sudoku.grid[rowIndex][colIndex] !== 0 ? 'fixed' : 'editable'}
                ${isSelected(rowIndex, colIndex) ? 'selected' : ''}
                ${isInSameRow(rowIndex) || isInSameCol(colIndex) ? 'highlighted' : ''}
                ${isSameNumber(cell) ? 'same-number' : ''}
                ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? 'border-bottom' : ''}
                ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? 'border-right' : ''}
                ${isCompleted ? 'completed' : ''}
              `}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell !== 0 ? cell : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default SudokuGrid

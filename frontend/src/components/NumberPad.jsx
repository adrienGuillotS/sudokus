import { useSudoku } from '../context/SudokuContext'
import './NumberPad.css'

const NumberPad = ({ onNumberClick, onDelete, disabled }) => {
  const { noteMode, toggleNoteMode, countNumberUsage } = useSudoku()
  return (
    <div className="number-pad">
      <div className="number-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const count = countNumberUsage(num)
          const isComplete = count >= 9
          return (
            <button
              key={num}
              className={`number-button ${isComplete ? 'complete' : ''} ${noteMode ? 'note-mode' : ''}`}
              onClick={() => onNumberClick(num)}
              disabled={disabled || isComplete}
            >
              {num}
              {/* {count > 0 && <span className="count">{count}/9</span>} */}
            </button>
          )
        })}
      </div>
      <div className="action-buttons">
        <button 
          className={`note-button ${noteMode ? 'active' : ''}`}
          onClick={toggleNoteMode}
          disabled={disabled}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          {noteMode ? 'Notes' : 'Notes'}
        </button>
        <button className="delete-button" onClick={onDelete} disabled={disabled}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}

export default NumberPad

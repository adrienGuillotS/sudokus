import './NumberPad.css'

const NumberPad = ({ onNumberClick, onDelete, disabled }) => {
  return (
    <div className="number-pad">
      <div className="number-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className="number-button"
            onClick={() => onNumberClick(num)}
            disabled={disabled}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        className="delete-button"
        onClick={onDelete}
        disabled={disabled}
      >
        Delete
      </button>
    </div>
  )
}

export default NumberPad

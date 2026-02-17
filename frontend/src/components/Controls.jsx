import './Controls.css'

const Controls = ({ onVerify, disabled, isCompleted, elapsedTime, completionTime, timerOnly, buttonOnly }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (timerOnly) {
    return (
      <div className="timer">
        <span className="timer-label">Time:</span>
        <span className="timer-value">{formatTime(elapsedTime)}</span>
      </div>
    )
  }

  if (buttonOnly) {
    return (
      <button 
        className="verify-button"
        onClick={onVerify}
        disabled={disabled || isCompleted}
      >
        Verify My Sudoku
      </button>
    )
  }

  return (
    <div className="controls">
      <div className="timer">
        <span className="timer-label">Time:</span>
        <span className="timer-value">{formatTime(elapsedTime)}</span>
      </div>
      
      <button 
        className="verify-button"
        onClick={onVerify}
        disabled={disabled || isCompleted}
      >
        Verify My Sudoku
      </button>

      {isCompleted && completionTime && (
        <div className="completion-message">
          ✅ Completed in {formatTime(completionTime)}!
        </div>
      )}
    </div>
  )
}

export default Controls

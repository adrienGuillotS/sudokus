import { useState, useEffect } from 'react'
import { useSudoku } from '../context/SudokuContext'
import { useKeyboard } from '../hooks/useKeyboard'
import SudokuGrid from '../components/SudokuGrid'
import NumberPad from '../components/NumberPad'
import Controls from '../components/Controls'
import ResultModal from '../components/ResultModal'
import './SudokuPage.css'

const SudokuPage = () => {
  const {
    loading,
    selectedCell,
    setSelectedCell,
    updateCell,
    deleteCell,
    checkSolution,
    isCompleted,
    elapsedTime,
    completionTime
  } = useSudoku()

  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({ isSuccess: false, elapsedTime: 0, ranking: null })
  const [challengeData, setChallengeData] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const challengeTime = params.get('challenge')
    const timeStr = params.get('time')
    const rank = params.get('rank')
    
    if (challengeTime && timeStr) {
      setChallengeData({
        time: parseInt(challengeTime),
        timeStr: timeStr,
        rank: rank ? parseFloat(rank) : null
      })
    }
  }, [])

  const handleNumberInput = (num) => {
    if (selectedCell) {
      updateCell(selectedCell.row, selectedCell.col, num)
    }
  }

  const handleDelete = () => {
    if (selectedCell) {
      deleteCell(selectedCell.row, selectedCell.col)
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
    
    if (result.incomplete) {
      setModalData({ isSuccess: false, isIncomplete: true })
      setShowModal(true)
    } else if (result.correct) {
      setModalData({
        isSuccess: true,
        elapsedTime: result.elapsed_time,
        ranking: result.ranking
      })
      setShowModal(true)
    } else {
      setModalData({ isSuccess: false, isIncomplete: false })
      setShowModal(true)
    }
  }

  const handleShare = () => {
    const { elapsedTime, ranking } = modalData
    const mins = Math.floor(elapsedTime / 60)
    const secs = elapsedTime % 60
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
    
    const shareUrl = `${window.location.origin}?challenge=${elapsedTime}&time=${timeStr}${
      ranking ? `&rank=${ranking.percentile}` : ''
    }`
    
    navigator.clipboard.writeText(shareUrl)
    const rankMsg = ranking ? `Rank #${ranking.rank} (Top ${(100 - ranking.percentile).toFixed(0)}%)` : ''
    const shareText = `I completed today's Sudoku in ${timeStr}! ${rankMsg}\n\nCan you beat my time? ${shareUrl}`
    
    if (navigator.share) {
      navigator.share({
        title: 'My Sudoku Time',
        text: shareText
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Link copied to clipboard!')
    }
  }

  const handleTryAgain = () => {
    setShowModal(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="sudoku-page">
        <div className="loading">Loading your daily Sudoku...</div>
      </div>
    )
  }

  return (
    <div className="sudoku-page">
      <div className="sudoku-container">
        {challengeData && (
          <div className="challenge-banner">
            <div className="challenge-icon">🎯</div>
            <div className="challenge-text">
              <h3>Challenge from a Friend!</h3>
              <p>They completed it in <strong>{challengeData.timeStr}</strong></p>
              {challengeData.rank && (
                <p className="challenge-rank">Top {(100 - challengeData.rank).toFixed(0)}% of players</p>
              )}
            </div>
            <div className="challenge-cta">
              <strong>Can you do better?</strong>
            </div>
          </div>
        )}
        
        <div className="game-area">
          <div className="grid-section">
            <div className="header">
              <h1 className="title">Daily Sudoku</h1>
              <p className="subtitle">Challenge your friends. A new sudoku every day.</p>
            </div>
            <SudokuGrid />
            <div className="desktop-controls">
              <Controls
                onVerify={handleVerify}
                disabled={loading}
                isCompleted={isCompleted}
                elapsedTime={elapsedTime}
                completionTime={completionTime}
              />
            </div>
          </div>
          
          <div className="controls-section">
            <NumberPad
              onNumberClick={handleNumberInput}
              onDelete={handleDelete}
              disabled={!selectedCell || isCompleted}
            />
            <div className="mobile-controls">
              <Controls
                onVerify={handleVerify}
                disabled={loading}
                isCompleted={isCompleted}
                elapsedTime={elapsedTime}
                completionTime={completionTime}
                buttonOnly={true}
              />
              <Controls
                elapsedTime={elapsedTime}
                completionTime={completionTime}
                timerOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      <ResultModal
        isOpen={showModal}
        isSuccess={modalData.isSuccess}
        isIncomplete={modalData.isIncomplete}
        elapsedTime={modalData.elapsedTime}
        ranking={modalData.ranking}
        onClose={handleCloseModal}
        onShare={handleShare}
        onTryAgain={handleTryAgain}
      />
    </div>
  )
}

export default SudokuPage

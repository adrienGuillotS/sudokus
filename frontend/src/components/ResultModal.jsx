import React, { useState } from 'react'
import './ResultModal.css'

const ResultModal = ({ isOpen, isSuccess, isIncomplete, elapsedTime, ranking, onClose, onShare, onTryAgain }) => {
  const [linkCopied, setLinkCopied] = useState(false)
  
  if (!isOpen) return null
  
  const handleShare = () => {
    onShare()
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRankingMessage = (percentile) => {
    if (percentile >= 95) return "TOP 5%"
    if (percentile >= 90) return "TOP 10%"
    if (percentile >= 75) return "TOP 25%"
    if (percentile >= 50) return "TOP 50%"
    return "Great job!"
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <>
            <div className="success-icon">
              <div className="trophy-emoji">🏆</div>
            </div>
            <h2 className="modal-title">🎉 Congratulations! 🎉</h2>
            <div className="completion-time">
              <span className="time-label">Your Time:</span>
              <span className="time-value">{formatTime(elapsedTime)}</span>
            </div>
            {ranking && (
              <div className="ranking-info">
                <div className="ranking-badge">{getRankingMessage(ranking.percentile)}</div>
                <p className="ranking-details">
                  Rank #{ranking.rank} out of {ranking.total} players today
                </p>
                <p className="percentile">Better than {(100 - ranking.percentile).toFixed(1)}% of players</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-share" onClick={handleShare}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                {linkCopied ? 'Link Copied!' : 'Share with Friends'}
              </button>
              <button className="btn-close" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : isIncomplete ? (
          <>
            <div className="warning-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="modal-title">Attention!</h2>
            <p className="error-message">
             You haven't filled all the cells yet. Keep going!
            </p>
            <div className="modal-actions">
              <button className="btn-try-again" onClick={onTryAgain}>
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="modal-title">Not Quite Right!</h2>
            <p className="error-message">
              Some numbers are incorrect. Keep trying, you can do it!
            </p>
            <div className="modal-actions">
              <button className="btn-try-again" onClick={onTryAgain}>
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ResultModal

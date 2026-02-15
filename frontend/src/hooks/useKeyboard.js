import { useEffect } from 'react'

export const useKeyboard = (selectedCell, onNumberInput, onDelete, onArrowKey) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedCell) return

      if (e.key >= '1' && e.key <= '9') {
        onNumberInput(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        onDelete()
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        onArrowKey(e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCell, onNumberInput, onDelete, onArrowKey])
}

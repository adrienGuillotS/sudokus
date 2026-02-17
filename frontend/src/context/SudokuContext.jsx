import { createContext, useContext, useState, useEffect } from 'react'
import { sudokuAPI } from '../services/api'
import { getDeviceId, getTodayDate } from '../utils/deviceId'

const SudokuContext = createContext()

export const useSudoku = () => {
  const context = useContext(SudokuContext)
  if (!context) {
    throw new Error('useSudoku must be used within a SudokuProvider')
  }
  return context
}

export const SudokuProvider = ({ children }) => {
  const [deviceId] = useState(getDeviceId())
  const [currentDate] = useState(getTodayDate())
  const [sudoku, setSudoku] = useState(null)
  const [userGrid, setUserGrid] = useState(null)
  const [notes, setNotes] = useState(null)
  const [noteMode, setNoteMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [completionTime, setCompletionTime] = useState(null)

  useEffect(() => {
    loadDailySudoku()
  }, [])

  useEffect(() => {
    if (!isCompleted && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isCompleted, startTime])

  useEffect(() => {
    if (!isCompleted && elapsedTime > 0) {
      const saveInterval = setInterval(async () => {
        try {
          await sudokuAPI.updateElapsedTime(deviceId, currentDate, elapsedTime)
        } catch (error) {
          console.error('Error saving elapsed time:', error)
        }
      }, 5000)
      return () => clearInterval(saveInterval)
    }
  }, [isCompleted, elapsedTime, deviceId, currentDate])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isCompleted && elapsedTime > 0 && userGrid) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const data = JSON.stringify({
          device_id: deviceId,
          date: currentDate,
          user_grid: userGrid,
          elapsed_time: elapsedTime,
          notes: notes
        })
        const blob = new Blob([data], { type: 'application/json' })
        navigator.sendBeacon(`${apiUrl}/api/sudoku/update-grid`, blob)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isCompleted, elapsedTime, deviceId, currentDate, userGrid])

  const loadDailySudoku = async () => {
    try {
      setLoading(true)
      const data = await sudokuAPI.getDailySudoku(deviceId, 'medium')
    
      setSudoku(data)
      
      if (data.user_grid && Array.isArray(data.user_grid) && data.user_grid.length === 9) {
        setUserGrid(data.user_grid)
      } else {
        setUserGrid(data.grid.map(row => [...row]))
      }
      
      if (data.notes && Array.isArray(data.notes) && data.notes.length === 9) {
        setNotes(data.notes)
      } else {
        setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => [])))
      }
      setIsCompleted(data.completed === 1)
      if (data.completed !== 1) {
        setElapsedTime(data.elapsed_time || 0)
        setStartTime(Date.now() - (data.elapsed_time || 0) * 1000)
      } else {
        setCompletionTime(data.elapsed_time)
      }
    } catch (error) {
      console.error('Error loading sudoku:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCell = (row, col, value) => {
    if (sudoku.grid[row][col] !== 0) return
    
    if (noteMode) {
      const newNotes = notes.map(r => r.map(c => [...c]))
      const cellNotes = newNotes[row][col]
      const noteIndex = cellNotes.indexOf(value)
      
      if (noteIndex > -1) {
        cellNotes.splice(noteIndex, 1)
      } else if (value > 0) {
        cellNotes.push(value)
        cellNotes.sort()
      }
      
      setNotes(newNotes)
      
      sudokuAPI.updateUserGrid(deviceId, currentDate, userGrid, elapsedTime, newNotes).catch(error => {
        console.error('Error saving notes:', error)
      })
    } else {
      const newGrid = userGrid.map(r => [...r])
      newGrid[row][col] = value
      
      if (value > 0) {
        const newNotes = notes.map(r => r.map(c => [...c]))
        newNotes[row][col] = []
        setNotes(newNotes)
      }
      
      setUserGrid(newGrid)
      
      sudokuAPI.updateUserGrid(deviceId, currentDate, newGrid, elapsedTime, notes).catch(error => {
        console.error('Error saving user grid:', error)
      })
    }
  }

  const deleteCell = (row, col) => {
    if (!selectedCell || sudoku.grid[row][col] !== 0) return
    
    if (noteMode) {
      const newNotes = notes.map(r => r.map(c => [...c]))
      const cellNotes = newNotes[row][col]
      
      if (cellNotes.length > 0) {
        cellNotes.pop()
        setNotes(newNotes)
        
        sudokuAPI.updateUserGrid(deviceId, currentDate, userGrid, elapsedTime, newNotes).catch(error => {
          console.error('Error saving notes:', error)
        })
      }
    } else {
      const newGrid = userGrid.map(r => [...r])
      newGrid[row][col] = 0
      setUserGrid(newGrid)
      
      sudokuAPI.updateUserGrid(deviceId, currentDate, newGrid, elapsedTime, notes).catch(error => {
        console.error('Error saving user grid:', error)
      })
    }
  }

  const toggleNoteMode = () => {
    setNoteMode(!noteMode)
  }

  const countNumberUsage = (num) => {
    if (!userGrid || !sudoku) return 0
    let count = 0
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (userGrid[i][j] === num || sudoku.grid[i][j] === num) {
          count++
        }
      }
    }
    return count
  }

  const checkSolution = async () => {
    try {
      const hasEmptyCells = userGrid.some(row => row.some(cell => cell === 0))
      
      if (hasEmptyCells) {
        return { 
          correct: false, 
          incomplete: true,
          message: 'Attention! You haven\'t filled all the cells yet.' 
        }
      }
      
      const result = await sudokuAPI.checkSolution(deviceId, currentDate, userGrid)
      if (result.correct) {
        setIsCompleted(true)
        setCompletionTime(elapsedTime)
      }
      return result
    } catch (error) {
      console.error('Error checking solution:', error)
      return { correct: false, message: 'Error checking solution' }
    }
  }

  const value = {
    deviceId,
    currentDate,
    sudoku,
    userGrid,
    notes,
    noteMode,
    loading,
    selectedCell,
    isCompleted,
    elapsedTime,
    completionTime,
    setSelectedCell,
    updateCell,
    deleteCell,
    checkSolution,
    toggleNoteMode,
    countNumberUsage
  }

  return <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>
}

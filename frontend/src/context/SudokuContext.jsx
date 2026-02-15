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
  const [loading, setLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [completionTime, setCompletionTime] = useState(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDailySudoku()
  }, [])

  useEffect(() => {
    if (!isCompleted && sudoku && sudoku.session_started) {
      const interval = setInterval(() => {
        const sessionStart = new Date(sudoku.session_started).getTime()
        const now = Date.now()
        setElapsedTime(Math.floor((now - sessionStart) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isCompleted, sudoku])

  const loadDailySudoku = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sudokuAPI.getDailySudoku(deviceId, 'medium')
      setSudoku(data)
      setUserGrid(data.grid.map(row => [...row]))
      setIsCompleted(data.completed === 1)
      
      if (data.completed === 1 && data.completion_time) {
        setCompletionTime(data.completion_time)
      }
      
      if (!data.session_active && data.completed === 0) {
        setSessionExpired(true)
      }
    } catch (error) {
      console.error('Error loading sudoku:', error)
      if (error.response && error.response.status === 403) {
        setSessionExpired(true)
        setError(error.response.data.detail)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateCell = (row, col, value) => {
    if (sudoku.grid[row][col] !== 0) return
    
    const newGrid = userGrid.map(r => [...r])
    newGrid[row][col] = value
    setUserGrid(newGrid)
  }

  const checkSolution = async () => {
    try {
      const result = await sudokuAPI.checkSolution(deviceId, currentDate, userGrid)
      if (result.correct) {
        setIsCompleted(true)
        const data = await sudokuAPI.getDailySudoku(deviceId, 'medium')
        if (data.completion_time) {
          setCompletionTime(data.completion_time)
        }
      }
      return result
    } catch (error) {
      console.error('Error checking solution:', error)
      if (error.response && error.response.status === 403) {
        setSessionExpired(true)
        return { correct: false, message: error.response.data.detail }
      }
      return { correct: false, message: 'Error checking solution' }
    }
  }

  const value = {
    deviceId,
    currentDate,
    sudoku,
    userGrid,
    loading,
    selectedCell,
    isCompleted,
    elapsedTime,
    completionTime,
    sessionExpired,
    error,
    setSelectedCell,
    updateCell,
    checkSolution
  }

  return <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>
}

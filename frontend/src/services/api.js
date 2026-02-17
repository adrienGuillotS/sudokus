import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sudokuAPI = {
  getDailySudoku: async (deviceId, difficulty = 'medium') => {
    const response = await api.get(`/api/sudoku/daily/${deviceId}?difficulty=${difficulty}`)
    return response.data
  },

  checkSolution: async (deviceId, date, grid) => {
    const response = await api.post('/api/sudoku/check', {
      device_id: deviceId,
      date,
      grid
    })
    return response.data
  },

  updateElapsedTime: async (deviceId, date, elapsedTime) => {
    const response = await api.post('/api/sudoku/update-time', {
      device_id: deviceId,
      date,
      elapsed_time: elapsedTime
    })
    return response.data
  },

  updateUserGrid: async (deviceId, date, userGrid, elapsedTime, notes = null) => {
    const response = await api.post('/api/sudoku/update-grid', {
      device_id: deviceId,
      date,
      user_grid: userGrid,
      elapsed_time: elapsedTime,
      notes: notes
    })
    return response.data
  },

  getHistory: async (deviceId, skip = 0, limit = 10) => {
    const response = await api.get(`/api/sudoku/history/${deviceId}?skip=${skip}&limit=${limit}`)
    return response.data
  },

  generateSudoku: async (deviceId, date, difficulty = 'medium') => {
    const response = await api.post('/api/sudoku/generate', {
      device_id: deviceId,
      date,
      difficulty
    })
    return response.data
  }
}

export default api

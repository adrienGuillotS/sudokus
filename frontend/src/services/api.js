import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sudokuAPI = {
  getDailySudoku: async (deviceId, difficulty = 'medium') => {
    const response = await api.get(`/api/sudoku/daily/${deviceId}`, {
      params: { difficulty }
    })
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

  getHistory: async (deviceId, skip = 0, limit = 10) => {
    const response = await api.get(`/api/sudoku/history/${deviceId}`, {
      params: { skip, limit }
    })
    return response.data
  }
}

export default api

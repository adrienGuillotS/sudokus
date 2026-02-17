export const getDeviceId = () => {
  let deviceId = localStorage.getItem('sudoku_device_id')
  
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem('sudoku_device_id', deviceId)
  }
  
  return deviceId
}

const generateDeviceId = () => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomStr}`
}

export const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

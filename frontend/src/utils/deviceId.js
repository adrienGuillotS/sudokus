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
  return today.toISOString().split('T')[0]
}

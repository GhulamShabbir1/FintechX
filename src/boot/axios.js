// src/boot/axios.js
import axios from 'axios'

// Create axios instance with ONLY the base domain
const api = axios.create({
  baseURL: 'https://56d461267821.ngrok-free.app',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Optional: automatically attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

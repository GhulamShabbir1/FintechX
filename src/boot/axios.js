// src/boot/axios.js
import axios from 'axios'

// Prefer environment-configured API base; fallback to previous local IP for dev
const baseURL = import.meta?.env?.VITE_API_BASE || process.env?.VITE_API_BASE || 'http://192.168.12.204:8000'

const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

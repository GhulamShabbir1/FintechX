// src/boot/axios.js
import axios from 'axios'

// Create axios instance with ONLY the base domain
const api = axios.create({
  baseURL: ' http://192.168.12.72:8000/',
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


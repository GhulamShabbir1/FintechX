// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'http://13.51.167.136/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable CORS credentials
})

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$api = api
})

export { api }
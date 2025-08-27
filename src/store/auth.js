import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = () => !!token.value
  const isAdmin = () => user.value?.role === 'admin'
  const isMerchant = () => user.value?.role === 'merchant'

  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    // Set token in axios headers
    if (newToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }

  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (userData) => {
    loading.value = true
    try {
      const { data } = await api.post('/api/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        role: userData.role || 'merchant'
      })
      
      if (data?.token) {
        setToken(data.token)
      }
      if (data?.user) {
        setUser(data.user)
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      const { data } = await api.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      })
      
      if (data?.token) {
        setToken(data.token)
      }
      if (data?.user) {
        setUser(data.user)
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/api/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local data regardless of API success
      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const getProfile = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/api/profile')
      setUser(data.user || data)
      return data
    } finally {
      loading.value = false
    }
  }

  const loadStoredData = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      setToken(storedToken)
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }

  // Initialize store
  loadStoredData()

  return {
    // State
    user,
    token,
    loading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isMerchant,
    
    // Actions
    register,
    login,
    logout,
    getProfile,
    setToken,
    setUser,
    loadStoredData
  }
})
// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useAuthStore = defineStore('auth', () => {
  // ---------------- State ----------------
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  // ---------------- Getters ----------------
  const isAuthenticated = () => !!token.value
  const isAdmin = () => user.value?.role === 'admin'
  const isMerchant = () => user.value?.role === 'merchant'

  // ---------------- Helpers ----------------
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const setUser = (userData) => {
    if (userData) {
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
      if (userData?.role) {
        localStorage.setItem('role', String(userData.role).toLowerCase())
      }
    } else {
      user.value = null
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }
  }

  // ---------------- API Actions ----------------
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

      if (data?.token) setToken(data.token)

      if (data?.user) {
        setUser(data.user)
        console.log('👤 User data set from register:', data.user)
      } else {
        const fallbackUser = {
          email: userData.email,
          role: 'merchant',
          name: userData.name || userData.email.split('@')[0]
        }
        setUser(fallbackUser)
        console.log('👤 Fallback user set from register:', fallbackUser)
      }

      return { success: true, ...data, user: user.value }
    } catch (error) {
      console.error('❌ Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed'
      }
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      console.log('🔑 Attempting login with:', credentials.email)

      const { data } = await api.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      })

      console.log('✅ Login response:', data)

      if (data?.token) setToken(data.token)

      if (data?.user) {
        setUser(data.user)
        console.log('👤 User data set from login:', data.user)
      } else {
        const fallbackUser = {
          email: credentials.email,
          role: 'merchant',
          name: data?.name || credentials.email.split('@')[0]
        }
        setUser(fallbackUser)
        console.log('👤 Fallback user set from login:', fallbackUser)
      }

      if (!user.value) {
        throw new Error('Failed to retrieve user information after login')
      }

      return { success: true, ...data, user: user.value }
    } catch (error) {
      console.error('❌ Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      }
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
      console.warn('⚠️ Logout API error (ignored):', error)
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  // ---------------- Local Init ----------------
  const loadStoredData = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) setToken(storedToken)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        console.log('💾 Stored user data loaded:', parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }

  loadStoredData()

  // ---------------- Expose Store ----------------
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
    setToken,
    setUser,
    loadStoredData
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = () => !!token.value
  const isAdmin = () => user.value?.role === 'admin'
  const isMerchant = () => user.value?.role === 'merchant'

  // Actions
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
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = null
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
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      console.error('Registration error:', err.response?.data)
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    error.value = null
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
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    error.value = null
    try {
      if (token.value) {
        const currentToken = token.value;
        api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        await api.post('/api/auth/logout');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        console.warn('Logout endpoint not found (404), proceeding with client-side cleanup');
        error.value = 'Logout completed (client-side)';
      } else {
        error.value = err.response?.data?.message || 'Logout failed';
        console.error('Logout error:', err);
      }
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  const getProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/api/profile')
      setUser(data.user || data)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      throw err
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
      } catch (err) {
        console.error('Error parsing stored user:', err)
        localStorage.removeItem('user')
      }
    }
  }

  // Alias for backward compatibility
  const loadToken = loadStoredData

  return {
    // State
    user,
    token,
    loading,
    error,
    
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
    loadStoredData,
    loadToken // backward compatibility
  }
})
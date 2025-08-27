// src/store/auth.js
import { defineStore } from 'pinia'
import api from '../boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),

  actions: {
    setToken(token) {
      this.token = token
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
    },

    setUser(user) {
      this.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        if (user.role) localStorage.setItem('role', String(user.role).toLowerCase())
      } else {
        localStorage.removeItem('user')
        localStorage.removeItem('role')
      }
    },

    loadToken() {
      const token = localStorage.getItem('token')
      if (token) this.token = token
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          this.user = JSON.parse(userStr)
        } catch {
          this.user = null
          localStorage.removeItem('user')
          localStorage.removeItem('role')
        }
      }
    },

    async register(payload) {
      const { data } = await api.post('/api/auth/register', payload)
      if (data?.token) this.setToken(data.token)
      if (data?.user) this.setUser(data.user)
      return data
    },

    async login(payload) {
      const { data } = await api.post('/api/auth/login', payload)
      if (data?.token) this.setToken(data.token)
      if (data?.user) this.setUser(data.user)
      // Fallback: fetch profile if user not returned in login response
      if (!data?.user) {
        try {
          const profile = await this.getProfile()
          return { ...data, user: profile }
        } catch {
          // ignore and return original data; caller can handle missing user
        }
      }
      return data
    },

    async getProfile() {
      // Try multiple common profile endpoints
      const candidates = ['/api/auth/profile', '/api/users/me', '/api/me', '/api/profile']
      let lastError
      for (const url of candidates) {
        try {
          const { data } = await api.get(url)
          const user = data?.user || data
          if (user) {
            this.setUser(user)
            return user
          }
        } catch (e) {
          lastError = e
        }
      }
      throw lastError || new Error('Unable to fetch profile')
    },

    logout() {
      this.setUser(null)
      this.setToken(null)
    },
  },
})


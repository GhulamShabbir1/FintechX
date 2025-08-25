// src/store/auth.js
import { defineStore } from 'pinia'
import api from 'src/boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),

  actions: {
    async register(payload) {
      try {
        // POST /api/users/register
        const { data } = await api.post('/api/users/register', payload)

        this.user = data.user
        this.token = data.token
        localStorage.setItem('token', data.token)

        return data
      } catch (error) {
        console.error('Register error:', error)
        throw error.response?.data || { message: 'Register failed' }
      }
    },

    async login(payload) {
      try {
        // POST /api/users/login
        const { data } = await api.post('/api/users/login', payload)

        this.user = data.user
        this.token = data.token
        localStorage.setItem('token', data.token)

        return data
      } catch (error) {
        console.error('Login error:', error)
        throw error.response?.data || { message: 'Login failed' }
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})

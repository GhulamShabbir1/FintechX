// src/store/auth.js
import { defineStore } from 'pinia'

import api from 'src/boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,

import api from '../boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),

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

    setToken(token) {
      this.token = token
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
    },
    setUser(user) {
      this.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        if (user.role) {
          localStorage.setItem('role', String(user.role).toLowerCase())
        }
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
        try { this.user = JSON.parse(userStr) }
        catch {
          this.user = null
          localStorage.removeItem('user')
          localStorage.removeItem('role')
        }
      }
    },
    async register(payload) {
      const { data } = await api.post('/api/auth/register', payload)
      return data
    },
    async login(payload) {
      const { data } = await api.post('/api/auth/login', payload)
      this.setUser(data.user || null)
      this.setToken(data.token || null)
      return data

    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})

      this.setUser(null)
      this.setToken(null)
    }
  }
})


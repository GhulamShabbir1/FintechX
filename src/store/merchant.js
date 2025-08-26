import { defineStore } from 'pinia'
import api from '../boot/axios'

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    profile: null,
    status: 'Pending',
    businesses: [],
    currentBusinessId: null
  }),
  getters: {
    currentBusiness(state) {
      return state.businesses.find(b => b.id === state.currentBusinessId) || null
    }
  },
  actions: {
    async register(formData, onUploadProgress) {
      const { data } = await api.post('/api/merchants/register', formData, { onUploadProgress })
      this.profile = data
      this.status = data?.status || 'Pending'
      return data
    },
    async fetchById(id) {
      const { data } = await api.get(`/api/merchants/${id}`)
      this.profile = data
      this.status = data?.status || this.status
      return data
    },
    async update(id, payload) {
      const { data } = await api.patch(`/api/merchants/${id}`, payload)
      this.profile = data
      this.status = data?.status || this.status
      return data
    },
    async fetchBusinesses(merchantId) {
      const { data } = await api.get(`/api/merchants/${merchantId}/businesses`)
      this.businesses = Array.isArray(data) ? data : []
      if (!this.currentBusinessId && this.businesses.length) {
        this.currentBusinessId = this.businesses[0].id
      }
      return this.businesses
    },
    async addBusiness(merchantId, payload, onUploadProgress) {
      const form = payload instanceof FormData ? payload : new FormData()
      if (!(payload instanceof FormData)) {
        Object.entries(payload || {}).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach(val => form.append(`${k}[]`, val))
          else if (v !== undefined && v !== null) form.append(k, v)
        })
      }
      const { data } = await api.post(`/api/merchants/${merchantId}/businesses`, form, { onUploadProgress })
      if (data) {
        this.businesses.unshift(data)
        this.currentBusinessId = data.id
      }
      return data
    },
    selectBusiness(id) {
      this.currentBusinessId = id
    }
  }
})
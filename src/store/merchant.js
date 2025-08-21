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
      const response = await api.post('/merchants/register', formData, { onUploadProgress })
      this.profile = response.data
      this.status = response.data?.status || 'Pending'
      return response.data
    },
    async fetchById(id) {
      const response = await api.get(`/merchants/${id}`)
      this.profile = response.data
      this.status = response.data?.status || this.status
      return response.data
    },
    async update(id, payload) {
      const response = await api.patch(`/merchants/${id}` , payload)
      this.profile = response.data
      this.status = response.data?.status || this.status
      return response.data
    },

    // Multi-business
    async fetchBusinesses(merchantId) {
      const { data } = await api.get(`/merchants/${merchantId}/businesses`)
      this.businesses = Array.isArray(data) ? data : []
      if (!this.currentBusinessId && this.businesses.length) {
        this.currentBusinessId = this.businesses[0].id
      }
      return this.businesses
    },
    async addBusiness(merchantId, payload, onUploadProgress) {
      // payload can be plain object or FormData
      const form = payload instanceof FormData ? payload : new FormData()
      if (!(payload instanceof FormData)) {
        Object.entries(payload || {}).forEach(([k,v]) => {
          if (Array.isArray(v)) v.forEach(val => form.append(`${k}[]`, val))
          else if (v !== undefined && v !== null) form.append(k, v)
        })
      }
      const { data } = await api.post(`/merchants/${merchantId}/businesses`, form, { onUploadProgress })
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
import { defineStore } from 'pinia'
import api from '../boot/axios'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    lastCheckout: null,
    lastStatus: null
  }),
  actions: {
    async checkout(payload) {
      const { data } = await api.post('/api/payments/checkout', payload)
      this.lastCheckout = data
      return data
    },
    async status(id) {
      const { data } = await api.get(`/api/payments/status/${id}`)
      this.lastStatus = data
      return data
    },
    async webhook(payload) {
      const { data } = await api.post('/api/payments/webhook', payload)
      return data
    }
  }
})
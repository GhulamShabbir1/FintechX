import { defineStore } from 'pinia'
import api from '../boot/axios'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    items: [],
    pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
    filters: { q: '', status: '', from: '', to: '' }
  }),
  actions: {
    async list(params = {}) {
      const query = { ...this.filters, ...params }
      const { data } = await api.get('/api/transactions', { params: query })
      this.items = Array.isArray(data) ? data : (data?.items || [])
      if (data?.pagination) this.pagination = data.pagination
      return this.items
    },
    async getById(id) {
      const { data } = await api.get(`/api/transactions/${id}`)
      return data
    },
    async refund(id, payload) {
      const { data } = await api.post(`/api/transactions/${id}/refund`, payload)
      return data
    },
    async downloadCsv(params = {}) {
      const { data } = await api.get('/api/transactions', { params: { ...params, format: 'csv' }, responseType: 'blob' })
      return data
    }
  }
})
import { defineStore } from 'pinia'
import api from '../boot/axios'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    systemHealth: null,
    alerts: [],
    recentMerchants: [],
    merchants: []
  }),
  actions: {
    async fetchSystemHealth() {
      const { data } = await api.get('/api/admin/system/health')
      this.systemHealth = data
      return data
    },
    async fetchAlertsRecent() {
      const { data } = await api.get('/api/admin/alerts/recent')
      this.alerts = data
      return data
    },
    async fetchMerchantsRecent() {
      const { data } = await api.get('/api/admin/merchants/recent')
      this.recentMerchants = data
      return data
    },
    async listMerchants(params = {}) {
      const { data } = await api.get('/api/admin/merchants', { params })
      this.merchants = data?.merchants || data || []
      return this.merchants
    },
    async approveMerchant(id) {
      const { data } = await api.patch(`/api/admin/merchants/${id}/approve`)
      return data
    },
    async rejectMerchant(id) {
      const { data } = await api.patch(`/api/admin/merchants/${id}/reject`)
      return data
    },
    async deleteMerchant(id) {
      const { data } = await api.delete(`/api/admin/merchants/${id}`)
      return data
    },
    async export(kind) {
      const { data } = await api.get(`/api/admin/export/${kind}`, { responseType: 'blob' })
      return data
    }
  }
})
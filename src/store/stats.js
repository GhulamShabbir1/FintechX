import { defineStore } from 'pinia'
import api from '../boot/axios'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    revenue: [],
    methods: [],
    transactions: [],
    checkoutTime: { labels: [], values: [] },
    geography: { labels: [], values: [] },
    amountsHistogram: { bins: [], counts: [] }
  }),
  actions: {
    async loadAll(params = {}) {
      const [revenue, methods, transactions, checkout, geography, histogram] = await Promise.all([
        api.get('/api/stats/revenue', { params }),
        api.get('/api/stats/methods', { params }),
        api.get('/api/stats/transactions', { params }),
        api.get('/api/stats/checkout-time', { params }),
        api.get('/api/stats/geography', { params }),
        api.get('/api/stats/amounts-histogram', { params }).catch(() => ({ data: { bins: [], counts: [] } }))
      ])
      this.revenue = revenue.data
      this.methods = methods.data
      this.transactions = transactions.data
      this.checkoutTime = { labels: checkout.data.labels || [], values: checkout.data.values || [] }
      this.geography = { labels: geography.data.labels || [], values: geography.data.values || [] }
      this.amountsHistogram = { bins: histogram.data.bins || [], counts: histogram.data.counts || [] }
    }
  }
})
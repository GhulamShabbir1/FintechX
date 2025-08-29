import { defineStore } from 'pinia'
import api from '../boot/axios'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    // datasets
    revenue: [],
    methods: [],
    transactions: [],
    checkoutTime: { labels: [], values: [] },
    geography: { labels: [], values: [] },
    amountsHistogram: { bins: [], counts: [] },

    // meta
    loading: false,
    error: null,
    lastLoadedAt: null,
    lastParamsKey: ''
  }),
  getters: {
    hasData: (state) =>
      (state.revenue?.length || 0) > 0 ||
      (state.methods?.length || 0) > 0 ||
      (state.transactions?.length || 0) > 0,
  },
  actions: {
    paramsKey(params = {}) {
      try {
        return JSON.stringify(params || {})
      } catch {
        return ''
      }
    },

    async loadRevenue(params = {}) {
      const { data } = await api.get('/api/stats/revenue', { params })
      this.revenue = data?.data ?? data ?? []
    },

    async loadMethods(params = {}) {
      const { data } = await api.get('/api/stats/methods', { params })
      this.methods = data?.data ?? data ?? []
    },

    async loadTransactions(params = {}) {
      const { data } = await api.get('/api/stats/transactions', { params })
      this.transactions = data?.data ?? data ?? []
    },

    async loadCheckoutTime(params = {}) {
      const { data } = await api.get('/api/stats/checkout-time', { params })
      this.checkoutTime = { labels: data?.labels || [], values: data?.data || data?.values || [] }
    },

    async loadGeography(params = {}) {
      const { data } = await api.get('/api/stats/geography', { params })
      this.geography = { labels: data?.labels || [], values: data?.data || data?.values || [] }
    },

    async loadHistogram(params = {}) {
      try {
        const { data } = await api.get('/api/stats/amounts-histogram', { params })
        this.amountsHistogram = { bins: data?.bins || [], counts: data?.counts || [] }
      } catch {
        this.amountsHistogram = { bins: [], counts: [] }
      }
    },

    async loadAll(params = {}) {
      const key = this.paramsKey(params)
      if (this.loading) return
      this.loading = true
      this.error = null
      try {
        await Promise.all([
          this.loadRevenue(params),
          this.loadMethods(params),
          this.loadTransactions(params),
          this.loadCheckoutTime(params),
          this.loadGeography(params),
          this.loadHistogram(params)
        ])
        this.lastParamsKey = key
        this.lastLoadedAt = Date.now()
      } catch (e) {
        this.error = e
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.revenue = []
      this.methods = []
      this.transactions = []
      this.checkoutTime = { labels: [], values: [] }
      this.geography = { labels: [], values: [] }
      this.amountsHistogram = { bins: [], counts: [] }
      this.error = null
      this.lastLoadedAt = null
      this.lastParamsKey = ''
    }
  }
})
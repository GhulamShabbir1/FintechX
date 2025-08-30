import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../boot/axios'

export const useStatsStore = defineStore('stats', () => {
  // State
  const stats = ref({
    revenue: null,
    methods: null,
    checkoutTime: null,
    geography: null,
    customers: null
  })

  const loading = ref(false)
  const error = ref(null)

  // Computed stats getter
  const getComputedStats = () => {
    return {
      total_revenue: stats.value.revenue?.total || 0,
      transactions: stats.value.revenue?.count || 0,
      success_rate: stats.value.checkoutTime?.success_rate || 0,
      customers: stats.value.customers?.total || 0
    }
  }

  // Actions
  const loadRevenueStats = async () => {
    try {
      const { data } = await api.get('/merchant/stats/revenue')
      stats.value.revenue = data
      return data
    } catch (err) {
      console.error('Error loading revenue stats:', err)
      throw err
    }
  }

  const loadMethodsStats = async () => {
    try {
      const { data } = await api.get('/merchant/stats/methods')
      stats.value.methods = data
      return data
    } catch (err) {
      console.error('Error loading methods stats:', err)
      throw err
    }
  }

  const loadCheckoutTimeStats = async () => {
    try {
      const { data } = await api.get('/merchant/stats/checkout-time')
      stats.value.checkoutTime = data
      return data
    } catch (err) {
      console.error('Error loading checkout time stats:', err)
      throw err
    }
  }

  const loadGeographyStats = async () => {
    try {
      const { data } = await api.get('/merchant/stats/geography')
      stats.value.geography = data
      return data
    } catch (err) {
      console.error('Error loading geography stats:', err)
      throw err
    }
  }

  const loadCustomersStats = async () => {
    try {
      const { data } = await api.get('/merchant/stats/customers')
      stats.value.customers = data
      return data
    } catch (err) {
      console.error('Error loading customers stats:', err)
      throw err
    }
  }

  const loadAllStats = async () => {
    loading.value = true
    error.value = null

    try {
      await Promise.allSettled([
        loadRevenueStats(),
        loadMethodsStats(),
        loadCheckoutTimeStats(),
        loadGeographyStats(),
        loadCustomersStats()
      ])
    } catch (err) {
      error.value = err.message
      console.error('Error loading all stats:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    getComputedStats,
    loadRevenueStats,
    loadMethodsStats,
    loadCheckoutTimeStats,
    loadGeographyStats,
    loadCustomersStats,
    loadAllStats
  }
})
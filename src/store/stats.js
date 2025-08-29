import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useStatsStore = defineStore('stats', () => {
  // State
  const revenueData = ref([])
  const methodsData = ref([])
  const trendsData = ref([])
  const checkoutTimeData = ref([])
  const geographyData = ref([])
  const customersData = ref([])
  const loading = ref(false)
  const filters = ref({
    dateRange: '30d',
    merchantId: null,
    startDate: null,
    endDate: null
  })

  // Getters
  const getTotalRevenue = () => {
    return revenueData.value.reduce((sum, item) => sum + (item.revenue || 0), 0)
  }

  const getSuccessRate = () => {
    if (trendsData.value.length === 0) return 0
    const total = trendsData.value.reduce((sum, item) => sum + (item.transactions || 0), 0)
    const successful = trendsData.value.reduce((sum, item) => sum + (item.successful_transactions || 0), 0)
    return total > 0 ? Math.round((successful / total) * 100) : 0
  }

  const getAverageCheckoutTime = () => {
    if (checkoutTimeData.value.length === 0) return 0
    const total = checkoutTimeData.value.reduce((sum, time) => sum + time, 0)
    return Math.round(total / checkoutTimeData.value.length * 10) / 10
  }

  // Actions
  const loadRevenueStats = async () => {
    try {
      const response = await api.get('/api/stats/revenue', { params: filters.value })
      
      if (response.data.success) {
        revenueData.value = response.data.data || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading revenue stats:', error)
      throw error
    }
  }

  const loadMethodsStats = async () => {
    try {
      const response = await api.get('/api/stats/methods', { params: filters.value })
      
      if (response.data.success) {
        methodsData.value = response.data.data || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading methods stats:', error)
      throw error
    }
  }

  const loadTrendsStats = async () => {
    try {
      const response = await api.get('/api/stats/transactions', { params: filters.value })
      
      if (response.data.success) {
        trendsData.value = response.data.data || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading trends stats:', error)
      throw error
    }
  }

  const loadCheckoutTimeStats = async () => {
    try {
      const response = await api.get('/api/stats/checkout-time', { params: filters.value })
      
      if (response.data.success) {
        const data = response.data.data || {}
        checkoutTimeData.value = data.values || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading checkout time stats:', error)
      throw error
    }
  }

  const loadGeographyStats = async () => {
    try {
      const response = await api.get('/api/stats/geography', { params: filters.value })
      
      if (response.data.success) {
        const data = response.data.data || {}
        geographyData.value = data.values || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading geography stats:', error)
      throw error
    }
  }

  const loadCustomersStats = async () => {
    try {
      const response = await api.get('/api/stats/customers', { params: filters.value })
      
      if (response.data.success) {
        const data = response.data.data || {}
        customersData.value = data.values || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading customers stats:', error)
      throw error
    }
  }

  const loadAllStats = async () => {
    try {
      loading.value = true
      
      await Promise.all([
        loadRevenueStats(),
        loadMethodsStats(),
        loadTrendsStats(),
        loadCheckoutTimeStats(),
        loadGeographyStats(),
        loadCustomersStats()
      ])
      
    } catch (error) {
      console.error('Error loading all stats:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const exportStats = async (format = 'csv') => {
    try {
      const response = await api.get('/api/stats/export', {
        params: { ...filters.value, format },
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `stats-${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Error exporting stats:', error)
      throw error
    }
  }

  return {
    // State
    revenueData,
    methodsData,
    trendsData,
    checkoutTimeData,
    geographyData,
    customersData,
    loading,
    filters,
    
    // Getters
    getTotalRevenue,
    getSuccessRate,
    getAverageCheckoutTime,
    
    // Actions
    loadRevenueStats,
    loadMethodsStats,
    loadTrendsStats,
    loadCheckoutTimeStats,
    loadGeographyStats,
    loadCustomersStats,
    loadAllStats,
    updateFilters,
    exportStats
  }
})
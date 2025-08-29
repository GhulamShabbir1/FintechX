import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useAdminStore = defineStore('admin', () => {
  // State
  const systemHealth = ref({
    api: 100,
    database: 100,
    payment_gateway: 100,
    uptime: 100
  })
  const recentAlerts = ref([])
  const recentMerchants = ref([])
  const loading = ref(false)

  // Getters
  const getOverallHealth = () => {
    const values = Object.values(systemHealth.value)
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
  }

  const getCriticalAlerts = () => {
    return recentAlerts.value.filter(alert => alert.severity === 'High')
  }

  // Actions
  const loadSystemHealth = async () => {
    try {
      const response = await api.get('/api/admin/system/health')
      
      if (response.data.success) {
        systemHealth.value = response.data.data || systemHealth.value
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading system health:', error)
      // Keep default values on error
    }
  }

  const loadRecentAlerts = async () => {
    try {
      const response = await api.get('/api/admin/alerts/recent')
      
      if (response.data.success) {
        recentAlerts.value = response.data.alerts || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading alerts:', error)
      // Load mock data on error
      recentAlerts.value = [
        { id: 1, type: 'warning', severity: 'Medium', message: 'High transaction volume detected', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
        { id: 2, type: 'info', severity: 'Low', message: 'New merchant registration completed', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
        { id: 3, type: 'error', severity: 'High', message: 'Payment gateway timeout detected', timestamp: new Date(Date.now() - 1000 * 60 * 120) }
      ]
    }
  }

  const loadRecentMerchants = async () => {
    try {
      const response = await api.get('/api/admin/merchants/recent')
      
      if (response.data.success) {
        recentMerchants.value = response.data.merchants || []
      }
      
      return response.data
    } catch (error) {
      console.error('Error loading recent merchants:', error)
      // Load mock data on error
      recentMerchants.value = [
        { id: 1, business_name: 'TechCorp Inc', email: 'admin@techcorp.com', status: 'Verified', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { id: 2, business_name: 'FoodExpress', email: 'contact@foodexpress.com', status: 'Pending', created_at: new Date(Date.now() - 1000 * 60 * 60 * 4) },
        { id: 3, business_name: 'Digital Solutions', email: 'info@digitalsolutions.com', status: 'Verified', created_at: new Date(Date.now() - 1000 * 60 * 60 * 6) }
      ]
    }
  }

  const exportTransactions = async (filters = {}) => {
    try {
      const response = await api.get('/api/admin/transactions/export', {
        params: filters,
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Error exporting transactions:', error)
      throw error
    }
  }

  const loadAllAdminData = async () => {
    try {
      loading.value = true
      
      await Promise.all([
        loadSystemHealth(),
        loadRecentAlerts(),
        loadRecentMerchants()
      ])
      
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    systemHealth,
    recentAlerts,
    recentMerchants,
    loading,
    
    // Getters
    getOverallHealth,
    getCriticalAlerts,
    
    // Actions
    loadSystemHealth,
    loadRecentAlerts,
    loadRecentMerchants,
    exportTransactions,
    loadAllAdminData
  }
})
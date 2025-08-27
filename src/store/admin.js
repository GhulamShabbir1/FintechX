// /workspace/src/store/admin.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useAdminStore = defineStore('admin', () => {
  // State
  const merchants = ref([])
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const approveMerchant = async (merchantId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await api.post(`/api/admin/approve-merchant/${merchantId}`)
      
      // Update local merchants list if needed
      const merchantIndex = merchants.value.findIndex(m => m.id === merchantId)
      if (merchantIndex !== -1) {
        merchants.value[merchantIndex].approved = true
        merchants.value[merchantIndex].status = 'approved'
      }
      
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to approve merchant'
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchMerchants = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      const { data } = await api.get('/api/admin/merchants', {
        params: params.toString() ? `?${params.toString()}` : ''
      })
      
      merchants.value = data.merchants || data || []
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to fetch merchants'
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchTransactions = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      const { data } = await api.get('/api/admin/transactions', {
        params: params.toString() ? `?${params.toString()}` : ''
      })
      
      transactions.value = data.transactions || data || []
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to fetch transactions'
      throw error
    } finally {
      loading.value = false
    }
  }

  const exportTransactionsCsv = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      const response = await api.get('/api/admin/transactions/export', {
        params: params.toString() ? `?${params.toString()}` : '',
        responseType: 'blob'
      })
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to export transactions'
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    merchants,
    transactions,
    loading,
    error,
    
    // Actions
    approveMerchant,
    fetchMerchants,
    fetchTransactions,
    exportTransactionsCsv
  }
})
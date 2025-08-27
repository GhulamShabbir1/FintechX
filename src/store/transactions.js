// /workspace/src/store/transactions.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useTransactionsStore = defineStore('transactions', () => {
  // State
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  })

  // Actions
  const fetchForMerchant = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      const { data } = await api.get('/api/merchant/transactions', {
        params: params.toString() ? `?${params.toString()}` : ''
      })
      
      if (data.transactions) {
        transactions.value = data.transactions
        if (data.pagination) {
          pagination.value = data.pagination
        }
      } else {
        transactions.value = Array.isArray(data) ? data : []
      }
      
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to fetch transactions'
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchForAdmin = async (filters = {}) => {
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
      
      if (data.transactions) {
        transactions.value = data.transactions
        if (data.pagination) {
          pagination.value = data.pagination
        }
      } else {
        transactions.value = Array.isArray(data) ? data : []
      }
      
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to fetch transactions'
      throw error
    } finally {
      loading.value = false
    }
  }

  const getTransactionById = async (transactionId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await api.get(`/api/transactions/${transactionId}`)
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to fetch transaction'
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateTransaction = async (transactionId, updateData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await api.put(`/api/transactions/${transactionId}`, updateData)
      
      // Update local transaction if it exists
      const index = transactions.value.findIndex(t => t.id === transactionId)
      if (index !== -1) {
        transactions.value[index] = { ...transactions.value[index], ...data }
      }
      
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to update transaction'
      throw error
    } finally {
      loading.value = false
    }
  }

  const clearTransactions = () => {
    transactions.value = []
    pagination.value = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0
    }
  }

  return {
    // State
    transactions,
    loading,
    error,
    pagination,
    
    // Actions
    fetchForMerchant,
    fetchForAdmin,
    getTransactionById,
    updateTransaction,
    clearTransactions
  }
})
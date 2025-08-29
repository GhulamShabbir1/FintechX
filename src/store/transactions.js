import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../boot/axios'

export const useTransactionsStore = defineStore('transactions', () => {
  // State
  const transactions = ref([])
  const currentTransaction = ref(null)
  const loading = ref(false)
  const filters = ref({
    search: '',
    status: '',
    dateRange: null,
    amountRange: null,
    paymentMethod: '',
    merchantId: null
  })
  const pagination = ref({
    page: 1,
    rowsPerPage: 20,
    total: 0
  })

  // Getters
  const filteredTransactions = computed(() => {
    let filtered = transactions.value

    // Search filter
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.transaction_id?.toLowerCase().includes(search) ||
        t.customer_name?.toLowerCase().includes(search) ||
        t.customer_email?.toLowerCase().includes(search) ||
        t.merchant_name?.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (filters.value.status) {
      filtered = filtered.filter(t => t.status === filters.value.status)
    }

    // Payment method filter
    if (filters.value.paymentMethod) {
      filtered = filtered.filter(t => t.payment_method === filters.value.paymentMethod)
    }

    // Merchant filter
    if (filters.value.merchantId) {
      filtered = filtered.filter(t => t.merchant_id === filters.value.merchantId)
    }

    // Date range filter
    if (filters.value.dateRange) {
      const { from, to } = filters.value.dateRange
      filtered = filtered.filter(t => {
        const date = new Date(t.created_at)
        return (!from || date >= from) && (!to || date <= to)
      })
    }

    // Amount range filter
    if (filters.value.amountRange) {
      const { min, max } = filters.value.amountRange
      filtered = filtered.filter(t => {
        const amount = parseFloat(t.amount)
        return (!min || amount >= min) && (!max || amount <= max)
      })
    }

    return filtered
  })

  const paginatedTransactions = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
    const end = start + pagination.value.rowsPerPage
    return filteredTransactions.value.slice(start, end)
  })

  const transactionStats = computed(() => {
    const total = transactions.value.length
    const completed = transactions.value.filter(t => t.status === 'completed').length
    const pending = transactions.value.filter(t => t.status === 'pending').length
    const failed = transactions.value.filter(t => t.status === 'failed').length
    const totalAmount = transactions.value.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      pending,
      failed,
      totalAmount,
      successRate
    }
  })

  // Actions
  const loadTransactions = async (params = {}) => {
    try {
      loading.value = true
      
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        ...filters.value,
        ...params
      }

      // Remove null/undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key]
        }
      })

      const response = await api.get('/api/merchant/transactions', { params: queryParams })
      
      if (response.data.success) {
        transactions.value = response.data.transactions || []
        pagination.value.total = response.data.total || transactions.value.length
        
        // Update pagination if total changed
        if (response.data.total && response.data.total !== pagination.value.total) {
          pagination.value.total = response.data.total
        }
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to load transactions:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load transactions' 
      }
    } finally {
      loading.value = false
    }
  }

  const loadTransactionById = async (transactionId) => {
    try {
      loading.value = true
      const response = await api.get(`/api/transactions/${transactionId}`)
      
      if (response.data.success) {
        currentTransaction.value = response.data.transaction
        return { success: true, data: response.data }
      }
      
      return { success: false, error: 'Transaction not found' }
    } catch (error) {
      console.error('Failed to load transaction:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to load transaction' 
      }
    } finally {
      loading.value = false
    }
  }

  const createTransaction = async (transactionData) => {
    try {
      loading.value = true
      const response = await api.post('/api/payments/checkout', transactionData)
      
      if (response.data.success) {
        // Add to transactions list
        transactions.value.unshift(response.data.transaction)
        pagination.value.total += 1
        
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Failed to create transaction' }
    } catch (error) {
      console.error('Failed to create transaction:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create transaction' 
      }
    } finally {
      loading.value = false
    }
  }

  const updateTransaction = async (transactionId, updateData) => {
    try {
      loading.value = true
      const response = await api.put(`/api/transactions/${transactionId}`, updateData)
      
      if (response.data.success) {
        // Update in transactions list
        const index = transactions.value.findIndex(t => t.id === transactionId)
        if (index !== -1) {
          transactions.value[index] = { ...transactions.value[index], ...updateData }
        }
        
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Failed to update transaction' }
    } catch (error) {
      console.error('Failed to update transaction:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update transaction' 
      }
    } finally {
      loading.value = false
    }
  }

  const refundTransaction = async (transactionId, refundData) => {
    try {
      loading.value = true
      const response = await api.post(`/api/transactions/${transactionId}/refund`, refundData)
      
      if (response.data.success) {
        // Update transaction status
        const index = transactions.value.findIndex(t => t.id === transactionId)
        if (index !== -1) {
          transactions.value[index].status = 'refunded'
          transactions.value[index].refund_amount = refundData.amount
          transactions.value[index].refund_reason = refundData.reason
        }
        
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Failed to refund transaction' }
    } catch (error) {
      console.error('Failed to refund transaction:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to refund transaction' 
      }
    } finally {
      loading.value = false
    }
  }

  const cancelTransaction = async (transactionId, reason) => {
    try {
      loading.value = true
      const response = await api.post(`/api/transactions/${transactionId}/cancel`, { reason })
      
      if (response.data.success) {
        // Update transaction status
        const index = transactions.value.findIndex(t => t.id === transactionId)
        if (index !== -1) {
          transactions.value[index].status = 'cancelled'
          transactions.value[index].cancellation_reason = reason
        }
        
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Failed to cancel transaction' }
    } catch (error) {
      console.error('Failed to cancel transaction:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel transaction' 
      }
    } finally {
      loading.value = false
    }
  }

  const exportTransactions = async (format = 'csv') => {
    try {
      loading.value = true
      
      const queryParams = {
        format,
        ...filters.value
      }

      const response = await api.get('/api/merchant/transactions/export', { 
        params: queryParams,
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to export transactions:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export transactions' 
      }
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // Reset to first page
  }

  const updatePagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      dateRange: null,
      amountRange: null,
      paymentMethod: '',
      merchantId: null
    }
    pagination.value.page = 1
  }

  const refreshTransactions = () => {
    return loadTransactions()
  }

  return {
    // State
    transactions,
    currentTransaction,
    loading,
    filters,
    pagination,
    
    // Getters
    filteredTransactions,
    paginatedTransactions,
    transactionStats,
    
    // Actions
    loadTransactions,
    loadTransactionById,
    createTransaction,
    updateTransaction,
    refundTransaction,
    cancelTransaction,
    exportTransactions,
    updateFilters,
    updatePagination,
    clearFilters,
    refreshTransactions
  }
})
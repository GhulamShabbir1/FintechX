// /workspace/src/store/merchant.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const useMerchantStore = defineStore('merchant', () => {
  // State
  const businessInfo = ref(null)
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const registerBusiness = async (businessData) => {
    try {
      loading.value = true
      error.value = null
      
      // Handle multipart form data for logo upload
      const formData = new FormData()
      formData.append('business_name', businessData.business_name)
      formData.append('bank_account_name', businessData.bank_account_name)
      formData.append('bank_account_number', businessData.bank_account_number)
      formData.append('bank_ifsc_swift', businessData.bank_ifsc_swift)
      
      // Add logo if provided
      if (businessData.logo && businessData.logo instanceof File) {
        formData.append('logo', businessData.logo)
      }
      
      // Add payout preferences
      if (businessData.payout_preferences && Array.isArray(businessData.payout_preferences)) {
        businessData.payout_preferences.forEach((preference, index) => {
          formData.append(`payout_preferences[${index}]`, preference)
        })
      }
      
      const { data } = await api.post('/api/merchant/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      businessInfo.value = data
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Business registration failed'
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
      
      const { data } = await api.get('/api/merchant/transactions', {
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

  const updateBusiness = async (businessData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await api.put('/api/merchant/update', businessData)
      
      businessInfo.value = data
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to update business'
      throw error
    } finally {
      loading.value = false
    }
  }

  const getBusinessInfo = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await api.get('/api/merchant/business')
      businessInfo.value = data
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to fetch business info'
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    businessInfo,
    transactions,
    loading,
    error,
    
    // Actions
    registerBusiness,
    fetchTransactions,
    updateBusiness,
    getBusinessInfo
  }
})
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../boot/axios'

export const useMerchantsStore = defineStore('merchants', () => {
  // State
  const merchants = ref([])
  const currentMerchant = ref(null)
  const loading = ref(false)
  const pendingApprovals = ref([])

  // Getters
  const getMerchantById = (id) => merchants.value.find(m => m.id === id)
  const getPendingCount = () => pendingApprovals.value.length
  const getApprovedMerchants = () => merchants.value.filter(m => m.status === 'verified')

  // Actions
  const loadMerchants = async (filters = {}) => {
    try {
      loading.value = true
      const response = await api.get('/api/admin/merchants', { params: filters })

      if (response.data.success) {
        merchants.value = response.data.merchants || []
      }

      return response.data
    } catch (error) {
      console.error('Error loading merchants:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const loadPendingApprovals = async () => {
    try {
      const response = await api.get('/api/admin/merchants', {
        params: { status: 'pending' }
      })

      if (response.data.success) {
        pendingApprovals.value = response.data.merchants || []
      }

      return response.data
    } catch (error) {
      console.error('Error loading pending approvals:', error)
      throw error
    }
  }

  const approveMerchant = async (merchantId) => {
    try {
      const response = await api.post(`/api/admin/approve-merchant/${merchantId}`)

      if (response.data.success) {
        // Update local state
        const merchant = merchants.value.find(m => m.id === merchantId)
        if (merchant) {
          merchant.status = 'verified'
        }

        // Remove from pending
        pendingApprovals.value = pendingApprovals.value.filter(m => m.id !== merchantId)
      }

      return response.data
    } catch (error) {
      console.error('Error approving merchant:', error)
      throw error
    }
  }

  const rejectMerchant = async (merchantId, reason) => {
    try {
      const response = await api.post(`/api/admin/reject-merchant/${merchantId}`, { reason })

      if (response.data.success) {
        // Update local state
        const merchant = merchants.value.find(m => m.id === merchantId)
        if (merchant) {
          merchant.status = 'rejected'
        }

        // Remove from pending
        pendingApprovals.value = pendingApprovals.value.filter(m => m.id !== merchantId)
      }

      return response.data
    } catch (error) {
      console.error('Error rejecting merchant:', error)
      throw error
    }
  }

  const updateMerchant = async (merchantId, data) => {
    try {
      const response = await api.patch(`/api/merchants/${merchantId}`, data)

      if (response.data.success) {
        // Update local state
        const merchant = merchants.value.find(m => m.id === merchantId)
        if (merchant) {
          Object.assign(merchant, response.data.merchant)
        }
      }

      return response.data
    } catch (error) {
      console.error('Error updating merchant:', error)
      throw error
    }
  }

  const registerBusiness = async (businessData) => {
    try {
      loading.value = true

      const formData = new FormData()
      Object.keys(businessData).forEach(key => {
        if (businessData[key] !== null && businessData[key] !== undefined) {
          if (key === 'payout_preferences' && Array.isArray(businessData[key])) {
            businessData[key].forEach((pref, index) => {
              formData.append(`payout_preferences[${index}]`, pref)
            })
          } else {
            formData.append(key, businessData[key])
          }
        }
      })

      const response = await api.post('/api/merchant/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        currentMerchant.value = response.data.merchant
      }

      return response.data
    } catch (error) {
      console.error('Error registering business:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getMerchantProfile = async () => {
    try {
      loading.value = true
      const response = await api.get('/merchant/profile')
      currentMerchant.value = response.data
      return { success: true, merchant: response.data }
    } catch (err) {
      console.error('Error loading merchant profile:', err)
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    merchants,
    currentMerchant,
    loading,
    pendingApprovals,

    // Getters
    getMerchantById,
    getPendingCount,
    getApprovedMerchants,

    // Actions
    loadMerchants,
    loadPendingApprovals,
    approveMerchant,
    rejectMerchant,
    updateMerchant,
    registerBusiness,
    getMerchantProfile
  }
})
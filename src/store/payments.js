// /workspace/src/store/payments.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../boot/axios'

export const usePaymentsStore = defineStore('payments', () => {
  // State
  const checkoutSession = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const checkout = async (paymentData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await api.post('/api/payments/checkout', {
        merchant_id: paymentData.merchant_id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'usd',
        method: paymentData.method || 'card',
        customer: paymentData.customer,
        cart: paymentData.cart,
        return_url_success: paymentData.return_url_success,
        return_url_failure: paymentData.return_url_failure
      })
      
      checkoutSession.value = data
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Checkout failed'
      throw error
    } finally {
      loading.value = false
    }
  }

  const getPaymentStatus = async (paymentId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await api.get(`/api/payments/status/${paymentId}`)
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Failed to get payment status'
      throw error
    } finally {
      loading.value = false
    }
  }

  const refundPayment = async (paymentId, amount = null) => {
    try {
      loading.value = true
      error.value = null
      
      const payload = {}
      if (amount !== null) {
        payload.amount = amount
      }
      
      const { data } = await api.post(`/api/payments/refund/${paymentId}`, payload)
      return data
    } catch (error) {
      error.value = error.response?.data?.message || 'Refund failed'
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    checkoutSession,
    loading,
    error,
    
    // Actions
    checkout,
    getPaymentStatus,
    refundPayment
  }
})
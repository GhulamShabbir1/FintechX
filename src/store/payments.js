import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../boot/axios'

export const usePaymentsStore = defineStore('payments', () => {
  // State
  const payments = ref([])
  const currentPayment = ref(null)
  const loading = ref(false)
  const processing = ref(false)
  const checkoutSession = ref(null)

  // Getters
  const paymentStats = computed(() => {
    const total = payments.value.length
    const successful = payments.value.filter(p => p.status === 'completed').length
    const pending = payments.value.filter(p => p.status === 'pending').length
    const failed = payments.value.filter(p => p.status === 'failed').length
    const totalAmount = payments.value.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0

    return {
      total,
      successful,
      pending,
      failed,
      totalAmount,
      successRate
    }
  })

  // Actions
  const processCheckout = async (checkoutData) => {
    try {
      processing.value = true
      
      const response = await api.post('/api/payments/checkout', {
        ...checkoutData,
        return_url: window.location.origin + '/payment/success',
        cancel_url: window.location.origin + '/payment/cancelled'
      })
      
      if (response.data.success) {
        checkoutSession.value = response.data.session
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Checkout failed' }
    } catch (error) {
      console.error('Checkout failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Checkout failed' 
      }
    } finally {
      processing.value = false
    }
  }

  const getPaymentStatus = async (paymentId) => {
    try {
      loading.value = true
      const response = await api.get(`/api/payments/${paymentId}/status`)
      
      if (response.data.success) {
        currentPayment.value = response.data.payment
        return { success: true, data: response.data }
      }
      
      return { success: false, error: 'Payment not found' }
    } catch (error) {
      console.error('Failed to get payment status:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get payment status' 
      }
    } finally {
      loading.value = false
    }
  }

  const confirmPayment = async (paymentId, confirmationData) => {
    try {
      processing.value = true
      const response = await api.post(`/api/payments/${paymentId}/confirm`, confirmationData)
      
      if (response.data.success) {
        currentPayment.value = response.data.payment
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Payment confirmation failed' }
    } catch (error) {
      console.error('Payment confirmation failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Payment confirmation failed' 
      }
    } finally {
      processing.value = false
    }
  }

  const capturePayment = async (paymentId, captureData) => {
    try {
      processing.value = true
      const response = await api.post(`/api/payments/${paymentId}/capture`, captureData)
      
      if (response.data.success) {
        currentPayment.value = response.data.payment
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Payment capture failed' }
    } catch (error) {
      console.error('Payment capture failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Payment capture failed' 
      }
    } finally {
      processing.value = false
    }
  }

  const voidPayment = async (paymentId, reason) => {
    try {
      processing.value = true
      const response = await api.post(`/api/payments/${paymentId}/void`, { reason })
      
      if (response.data.success) {
        currentPayment.value = response.data.payment
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Payment void failed' }
    } catch (error) {
      console.error('Payment void failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Payment void failed' 
      }
    } finally {
      processing.value = false
    }
  }

  const processWebhook = async (webhookData) => {
    try {
      const response = await api.post('/api/payments/webhook', webhookData)
      
      if (response.data.success) {
        // Update local payment data if needed
        return { success: true, data: response.data }
      }
      
      return { success: false, error: 'Webhook processing failed' }
    } catch (error) {
      console.error('Webhook processing failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Webhook processing failed' 
      }
    }
  }

  const getPaymentMethods = async () => {
    try {
      loading.value = true
      const response = await api.get('/api/payments/methods')
      
      if (response.data.success) {
        return { success: true, data: response.data.methods }
      }
      
      return { success: false, error: 'Failed to get payment methods' }
    } catch (error) {
      console.error('Failed to get payment methods:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get payment methods' 
      }
    } finally {
      loading.value = false
    }
  }

  const validatePayment = async (paymentData) => {
    try {
      const response = await api.post('/api/payments/validate', paymentData)
      
      if (response.data.success) {
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.data.message || 'Payment validation failed' }
    } catch (error) {
      console.error('Payment validation failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Payment validation failed' 
      }
    }
  }

  const getPaymentHistory = async (params = {}) => {
    try {
      loading.value = true
      const response = await api.get('/api/payments/history', { params })
      
      if (response.data.success) {
        payments.value = response.data.payments || []
        return { success: true, data: response.data }
      }
      
      return { success: false, error: 'Failed to get payment history' }
    } catch (error) {
      console.error('Failed to get payment history:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get payment history' 
      }
    } finally {
      loading.value = false
    }
  }

  const clearCheckoutSession = () => {
    checkoutSession.value = null
  }

  const clearCurrentPayment = () => {
    currentPayment.value = null
  }

  return {
    // State
    payments,
    currentPayment,
    loading,
    processing,
    checkoutSession,
    
    // Getters
    paymentStats,
    
    // Actions
    processCheckout,
    getPaymentStatus,
    confirmPayment,
    capturePayment,
    voidPayment,
    processWebhook,
    getPaymentMethods,
    validatePayment,
    getPaymentHistory,
    clearCheckoutSession,
    clearCurrentPayment
  }
})
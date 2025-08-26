<template>
  <div class="checkout-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <q-spinner-dots size="50px" color="lime" />
        <div class="loading-text">Loading merchant information...</div>
        <div class="loading-subtext">Preparing your checkout experience</div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <q-card class="error-card glass-card">
        <q-card-section class="text-center">
          <div class="error-icon">
            <q-icon name="error" size="64px" color="negative" />
          </div>
          <div class="text-h5 text-negative q-mt-md">Checkout Unavailable</div>
          <div class="text-subtitle1 q-mt-sm text-grey-6">
            {{ errorMessage }}
          </div>
          <q-btn
            label="Try Again"
            class="btn-primary q-mt-lg"
            @click="retryLoading"
            :loading="retrying"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Payment Processing Modal -->
    <q-dialog v-model="showProcessingModal" persistent>
      <q-card class="processing-modal glass-card">
        <q-card-section class="text-center">
          <div class="text-h6 q-mb-md">Processing Payment</div>
          <div class="processing-steps">
            <div class="step" :class="{ active: processingStep >= 1 }">
              <q-icon name="credit_card" size="20px" />
              <span>Validating payment details...</span>
            </div>
            <div class="step" :class="{ active: processingStep >= 2 }">
              <q-icon name="security" size="20px" />
              <span>Securing transaction...</span>
            </div>
            <div class="step" :class="{ active: processingStep >= 3 }">
              <q-icon name="check_circle" size="20px" />
              <span>Finalizing payment...</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Error Details Modal -->
    <q-dialog v-model="showErrorModal">
      <q-card class="error-modal glass-card">
        <q-card-section>
          <div class="text-h6 text-negative q-mb-md">Payment Failed</div>
          <div class="text-body2 q-mb-md">{{ errorDetails?.message || 'An error occurred during payment processing.' }}</div>
          <div v-if="errorDetails?.code" class="error-code q-mb-md">
            Error Code: {{ errorDetails.code }}
          </div>
          <div class="text-caption text-grey-6">
            Please check your payment details and try again. If the problem persists, contact your bank or card issuer.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="grey" v-close-popup />
          <q-btn label="Try Again" color="lime" @click="retryPayment" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Main content -->
    <div v-else class="checkout-content">
      <q-card class="glass-card elevated-hover animate-fade-in">
        <!-- Merchant Branding Header -->
        <q-card-section class="merchant-header">
          <div class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-avatar size="48px" class="merchant-avatar">
                <img 
                  :src="branding.logo_url || placeholderLogo" 
                  :alt="branding.name || 'Merchant'"
                  @error="handleImageError"
                />
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-h6 text-lime">{{ branding.name || 'FinteckX Store' }}</div>
              <div class="text-caption text-grey-5">Secure Payment Portal</div>
            </div>
            <div class="col-auto">
              <q-chip color="green" text-color="white" icon="security" size="sm" class="security-chip">
                SSL Secured
              </q-chip>
            </div>
          </div>
        </q-card-section>
        
        <q-separator class="divider-animate" />
        
        <!-- Payment Amount Display -->
        <q-card-section class="payment-amount">
          <div class="text-center">
            <div class="amount-display">
              <span class="currency">{{ currency }}</span>
              <span class="amount">{{ formatAmount(amount) }}</span>
            </div>
            <div class="text-caption text-grey-6" v-if="description">{{ description }}</div>
            <div v-if="processingFee > 0" class="processing-fee text-caption text-grey-6">
              Processing fee: {{ currency }}{{ processingFee }}
            </div>
          </div>
        </q-card-section>

        <!-- Payment Status Display -->
        <div v-if="paymentStatus" class="payment-status-section">
          <PaymentStatus 
            :status="paymentStatus" 
            :transaction="currentTransaction"
            @retry="clearPaymentStatus"
          />
        </div>

        <!-- Checkout Form -->
        <div v-else class="checkout-form-section">
          <CheckoutForm
            :merchant-id="merchantId"
            :amount="amount"
            :currency="currency"
            :description="description"
            :merchant-name="branding.name || 'Merchant'"
            :merchant-logo="branding.logo_url"
            :payment-methods="availablePaymentMethods"
            :customer-info="customerInfo"
            @payment-success="handlePaymentSuccess"
            @payment-failed="handlePaymentFailed"
            @payment-processing="handlePaymentProcessing"
            @validation-error="handleValidationError"
          />
        </div>

        <!-- Trust indicators -->
        <q-card-section class="trust-indicators">
          <div class="trust-item">
            <q-icon name="security" size="16px" color="lime" />
            <span class="text-caption">SSL Encrypted</span>
          </div>
          <div class="trust-item">
            <q-icon name="verified_user" size="16px" color="lime" />
            <span class="text-caption">PCI Compliant</span>
          </div>
          <div class="trust-item">
            <q-icon name="payment" size="16px" color="lime" />
            <span class="text-caption">Secure Payment</span>
          </div>
        </q-card-section>

        <!-- Additional Info -->
        <q-card-section class="info-section">
          <div class="info-card glass-card">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="info-item">
                  <q-icon name="schedule" size="16px" color="lime" />
                  <span class="text-caption">Instant Processing</span>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="info-item">
                  <q-icon name="support_agent" size="16px" color="lime" />
                  <span class="text-caption">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'
import CheckoutForm from '../payments/CheckoutForm.vue'
import PaymentStatus from '../payments/PaymentStatus.vue'
import MerchantBranding from '../merchants/MerchantBranding.vue'

// Props
const props = defineProps({
  merchantId: {
    type: String,
    default: ''
  },
  amount: {
    type: [Number, String],
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    default: ''
  }
})

// Composables
const route = useRoute()
const $q = useQuasar()

// Reactive data
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const errorDetails = ref(null)
const retrying = ref(false)
const merchant = ref(null)
const branding = ref({})
const availablePaymentMethods = ref([])
const customerInfo = ref({})
const paymentStatus = ref(null)
const currentTransaction = ref(null)
const showProcessingModal = ref(false)
const showErrorModal = ref(false)
const processingStep = ref(0)

// Computed
const placeholderLogo = computed(() => {
  return 'https://placehold.co/80x80/121018/bdf000?text=M'
})

const processingFee = computed(() => {
  const amount = Number(props.amount)
  if (amount <= 0) return 0
  return Math.max(0.30, amount * 0.029) // 2.9% + $0.30
})

// Methods
const handleImageError = (event) => {
  event.target.src = placeholderLogo.value
}

const retryLoading = async () => {
  retrying.value = true
  await initializeCheckout()
  retrying.value = false
}

const initializeCheckout = async () => {
  loading.value = true
  error.value = false
  errorMessage.value = ''
  errorDetails.value = null
  
  try {
    const id = props.merchantId || route.params.merchantId || route.query.merchantId
    if (!id) {
      throw new Error('Merchant ID is required')
    }

    // Fetch merchant information
    const merchantResponse = await api.get(`/api/merchants/${id}`)
    merchant.value = merchantResponse.data
    
    // Fetch merchant branding
    const brandingResponse = await api.get(`/api/merchants/${id}/branding`)
    branding.value = brandingResponse.data
    
    // Fetch available payment methods
    const methodsResponse = await api.get(`/api/merchants/${id}/payment-methods`)
    availablePaymentMethods.value = methodsResponse.data
    
    // Validate checkout parameters
    if (!validateCheckoutParams()) {
      throw new Error('Invalid checkout parameters')
    }
    
    // Add slight delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300))
    
  } catch (err) {
    console.error('Failed to initialize checkout:', err)
    handleError(err)
  } finally {
    loading.value = false
  }
}

const validateCheckoutParams = () => {
  const amount = Number(props.amount || route.query.amount)
  if (!amount || amount <= 0) {
    errorMessage.value = 'Invalid payment amount'
    return false
  }
  
  if (amount > 10000) {
    errorMessage.value = 'Payment amount exceeds maximum limit'
    return false
  }
  
  return true
}

const handleError = (err) => {
  error.value = true
  
  if (err.response?.status === 404) {
    errorMessage.value = 'Merchant not found. Please check the URL and try again.'
  } else if (err.response?.status === 400) {
    errorMessage.value = 'Invalid checkout parameters. Please check the amount and try again.'
  } else if (err.response?.status === 403) {
    errorMessage.value = 'Access denied. This merchant is not available for checkout.'
  } else if (err.response?.status >= 500) {
    errorMessage.value = 'Service temporarily unavailable. Please try again later.'
  } else {
    errorMessage.value = 'Unable to load checkout. Please check your connection and try again.'
  }
}

const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2)
}

const handlePaymentSuccess = (transaction) => {
  paymentStatus.value = 'success'
  currentTransaction.value = transaction
  showProcessingModal.value = false
  processingStep.value = 0
  
  // Redirect to merchant return URL if available
  if (merchant.value?.return_url) {
    setTimeout(() => {
      window.location.href = merchant.value.return_url
    }, 3000)
  }
  
  $q.notify({
    type: 'positive',
    message: 'Payment successful!',
    position: 'top'
  })
}

const handlePaymentFailed = (error) => {
  errorDetails.value = error
  showProcessingModal.value = false
  showErrorModal.value = true
  processingStep.value = 0
  
  $q.notify({
    type: 'negative',
    message: 'Payment failed. Please try again.',
    position: 'top'
  })
}

const handlePaymentProcessing = () => {
  showProcessingModal.value = true
  processingStep.value = 1
  
  // Simulate processing steps
  setTimeout(() => {
    if (processingStep.value === 1) {
      processingStep.value = 2
    }
  }, 1000)
  
  setTimeout(() => {
    if (processingStep.value === 2) {
      processingStep.value = 3
    }
  }, 2000)
}

const handleValidationError = (errors) => {
  $q.notify({
    type: 'warning',
    message: 'Please check your payment details',
    position: 'top'
  })
}

const retryPayment = async () => {
  showErrorModal.value = false
  errorDetails.value = null
  
  $q.notify({
    type: 'info',
    message: 'Please try your payment again',
    position: 'top'
  })
}

const clearPaymentStatus = () => {
  paymentStatus.value = null
  currentTransaction.value = null
}

// Webhook handling for payment status updates
const handleWebhookUpdate = (data) => {
  if (data.merchantId === props.merchantId && data.transactionId === currentTransaction.value?.id) {
    currentTransaction.value = data.transaction
    
    if (data.status === 'completed') {
      handlePaymentSuccess(data.transaction)
    } else if (data.status === 'failed') {
      handlePaymentFailed({ message: 'Payment was declined', code: 'DECLINED' })
    }
  }
}

// Lifecycle
onMounted(() => {
  initializeCheckout()
  
  // Listen for webhook updates
  window.addEventListener('message', (event) => {
    if (event.data.type === 'PAYMENT_WEBHOOK') {
      handleWebhookUpdate(event.data.payload)
    }
  })
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('message', handleWebhookUpdate)
})

// Watchers
watch(() => props.merchantId, (newId) => {
  if (newId && newId !== route.params.merchantId) {
    initializeCheckout()
  }
})

watch(() => props.amount, (newAmount) => {
  if (newAmount && newAmount !== Number(route.query.amount || 0)) {
    // Refresh checkout if amount changes
    initializeCheckout()
  }
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-content {
  text-align: center;
}

.loading-text {
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  margin-top: 16px;
}

.loading-subtext {
  color: #9e9e9e;
  font-size: 14px;
  margin-top: 8px;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-card {
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(10px);
  max-width: 400px;
}

.error-icon {
  margin-bottom: 16px;
}

.checkout-content {
  max-width: 520px;
}

.glass-card {
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(189, 240, 0.1);
}

.elevated-hover {
  transition: all 0.3s ease;
}

.elevated-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.merchant-header {
  padding: 24px;
}

.merchant-avatar {
  border: 2px solid rgba(189, 240, 0.3);
}

.security-chip {
  font-size: 12px;
}

.payment-amount {
  background: rgba(189, 240, 0.05);
  border-bottom: 1px solid rgba(189, 240, 0.1);
}

.amount-display {
  margin-bottom: 8px;
}

.currency {
  font-size: 24px;
  color: #bdf000;
  font-weight: 600;
}

.amount {
  font-size: 48px;
  color: #ffffff;
  font-weight: 700;
  margin-left: 8px;
}

.processing-fee {
  margin-top: 8px;
  color: #9e9e9e;
}

.checkout-form-section {
  padding: 24px;
}

.trust-indicators {
  display: flex;
  justify-content: space-around;
  padding: 16px 24px;
  border-top: 1px solid rgba(189, 240, 0.1);
  background: rgba(189, 240, 0.05);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9e9e9e;
  font-size: 12px;
}

.payment-status-section {
  margin-top: 24px;
}

.info-section {
  margin-top: 24px;
}

.info-card {
  background: rgba(18, 18, 18, 0.6);
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9e9e9e;
  font-size: 12px;
}

.processing-modal {
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  min-width: 400px;
}

.processing-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #9e9e9e;
  transition: all 0.3s ease;
}

.step.active {
  background: rgba(189, 240, 0.1);
  color: #bdf000;
}

.step span {
  font-size: 14px;
  font-weight: 500;
}

.error-modal {
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  min-width: 400px;
}

.error-code {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .checkout-content {
    max-width: 100%;
    padding: 0 16px;
  }
  
  .checkout-form-section {
    padding: 20px;
  }
  
  .trust-indicators {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .processing-modal,
  .error-modal {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .checkout-form-section {
    padding: 16px;
  }
  
  .loading-text {
    font-size: 16px;
  }
  
  .loading-subtext {
    font-size: 12px;
  }
}
</style>
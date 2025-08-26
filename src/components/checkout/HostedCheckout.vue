<template>
  <q-page class="q-pa-md checkout-page">
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
          <div class="text-h5 text-negative q-mt-md">{{ error.title || 'Checkout Unavailable' }}</div>
          <div class="text-subtitle1 q-mt-sm text-grey-6">
            {{ error.message }}
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

    <!-- Main content -->
    <div v-else class="q-mx-auto checkout-content" style="max-width: 520px;">
      <!-- Merchant Branding Header -->
      <MerchantBranding 
        :merchant="merchant"
        :branding="branding"
        class="q-mb-md"
      />

      <!-- Checkout Form Card -->
      <q-card class="glass-card elevated-hover animate-fade-in">
        <q-card-section class="checkout-form-section">
          <CheckoutForm
            :merchant-id="merchantId"
            :amount="amount"
            :currency="currency"
            :description="description"
            :merchant-name="merchant?.business_name || 'Merchant'"
            :merchant-logo="branding.logo_url"
            :payment-methods="availablePaymentMethods"
            :customer-info="customerInfo"
            @payment-success="handlePaymentSuccess"
            @payment-failed="handlePaymentFailed"
            @payment-processing="handlePaymentProcessing"
          />
        </q-card-section>
        
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
            <q-icon name="lock" size="16px" color="lime" />
            <span class="text-caption">Secure Payment</span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Payment Status Display -->
      <div v-if="paymentStatus" class="payment-status-section q-mt-md">
        <PaymentStatus 
          :status="paymentStatus"
          :transaction="currentTransaction"
          :merchant="merchant"
          @retry="retryPayment"
          @close="clearPaymentStatus"
        />
      </div>

      <!-- Additional Information -->
      <div class="info-section q-mt-lg">
        <q-card class="info-card glass-card">
          <q-card-section>
            <div class="row items-center q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="info-item">
                  <q-icon name="schedule" color="lime" size="20px" />
                  <span class="text-caption q-ml-sm">Estimated processing time: 2-3 minutes</span>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="info-item">
                  <q-icon name="support_agent" color="lime" size="20px" />
                  <span class="text-caption q-ml-sm">24/7 Customer Support</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Payment Processing Modal -->
    <q-dialog v-model="showProcessingModal" persistent>
      <q-card class="processing-modal glass-card">
        <q-card-section class="text-center">
          <q-spinner-dots size="50px" color="lime" />
          <div class="text-h6 q-mt-md">Processing Payment</div>
          <div class="text-subtitle2 q-mt-sm text-grey-6">
            Please wait while we process your payment...
          </div>
          <div class="processing-steps q-mt-md">
            <div class="step" :class="{ active: processingStep >= 1 }">
              <q-icon name="credit_card" size="20px" />
              <span>Validating payment method</span>
            </div>
            <div class="step" :class="{ active: processingStep >= 2 }">
              <q-icon name="security" size="20px" />
              <span>Processing securely</span>
            </div>
            <div class="step" :class="{ active: processingStep >= 3 }">
              <q-icon name="check_circle" size="20px" />
              <span>Confirming transaction</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Error Modal -->
    <q-dialog v-model="showErrorModal">
      <q-card class="error-modal glass-card">
        <q-card-section class="text-center">
          <q-icon name="error" size="64px" color="negative" />
          <div class="text-h6 q-mt-md text-negative">Payment Failed</div>
          <div class="text-subtitle2 q-mt-sm text-grey-6">
            {{ errorDetails?.message || 'An error occurred while processing your payment.' }}
          </div>
          <div v-if="errorDetails?.code" class="error-code q-mt-sm">
            Error Code: {{ errorDetails.code }}
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            label="Try Again"
            color="lime"
            @click="retryPayment"
            :loading="retrying"
          />
          <q-btn
            label="Close"
            flat
            color="grey"
            @click="showErrorModal = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'
import MerchantBranding from './MerchantBranding.vue'
import CheckoutForm from '../payments/CheckoutForm.vue'
import PaymentStatus from '../payments/PaymentStatus.vue'

// Props
const props = defineProps({
  merchantId: {
    type: String,
    required: true
  },
  amount: {
    type: [Number, String],
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    default: ''
  },
  customerEmail: {
    type: String,
    default: ''
  },
  returnUrl: {
    type: String,
    default: ''
  },
  cancelUrl: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'checkout-loaded',
  'payment-success',
  'payment-failed',
  'payment-cancelled'
])

// Composables
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(true)
const retrying = ref(false)
const error = ref(null)
const merchant = ref(null)
const branding = ref({})
const availablePaymentMethods = ref([])
const customerInfo = ref({})
const paymentStatus = ref(null)
const currentTransaction = ref(null)
const showProcessingModal = ref(false)
const showErrorModal = ref(false)
const processingStep = ref(0)
const errorDetails = ref(null)

// Computed
const merchantId = computed(() => {
  return props.merchantId || route.params.merchantId || route.query.merchantId
})

const amount = computed(() => {
  return Number(props.amount || route.query.amount || 0)
})

const currency = computed(() => {
  return props.currency || route.query.currency || 'USD'
})

const description = computed(() => {
  return props.description || route.query.description || 'Payment'
})

// Methods
const initializeCheckout = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch merchant information
    const merchantResponse = await api.get(`/api/merchants/${merchantId.value}`)
    merchant.value = merchantResponse.data
    
    // Fetch merchant branding
    const brandingResponse = await api.get(`/api/merchants/${merchantId.value}/branding`)
    branding.value = brandingResponse.data
    
    // Fetch available payment methods
    const methodsResponse = await api.get(`/api/merchants/${merchantId.value}/payment-methods`)
    availablePaymentMethods.value = methodsResponse.data
    
    // Initialize customer info
    customerInfo.value = {
      email: props.customerEmail || route.query.email || '',
      name: route.query.name || '',
      phone: route.query.phone || ''
    }
    
    // Validate checkout parameters
    validateCheckoutParams()
    
    emit('checkout-loaded', {
      merchant: merchant.value,
      branding: branding.value,
      amount: amount.value,
      currency: currency.value
    })
    
  } catch (err) {
    console.error('Failed to initialize checkout:', err)
    handleError(err)
  } finally {
    loading.value = false
  }
}

const validateCheckoutParams = () => {
  if (!merchantId.value) {
    throw new Error('Merchant ID is required')
  }
  
  if (!amount.value || amount.value <= 0) {
    throw new Error('Invalid amount')
  }
  
  if (!merchant.value) {
    throw new Error('Merchant not found')
  }
  
  if (merchant.value.status !== 'verified') {
    throw new Error('Merchant account is not verified')
  }
}

const handleError = (err) => {
  const errorResponse = err.response?.data
  
  if (errorResponse?.code === 'MERCHANT_NOT_FOUND') {
    error.value = {
      title: 'Merchant Not Found',
      message: 'The merchant you are trying to pay is not available.'
    }
  } else if (errorResponse?.code === 'MERCHANT_SUSPENDED') {
    error.value = {
      title: 'Merchant Suspended',
      message: 'This merchant account has been suspended. Please contact support.'
    }
  } else if (errorResponse?.code === 'INVALID_AMOUNT') {
    error.value = {
      title: 'Invalid Amount',
      message: 'The payment amount is invalid or below the minimum threshold.'
    }
  } else if (err.code === 'NETWORK_ERROR') {
    error.value = {
      title: 'Connection Error',
      message: 'Unable to connect to the payment service. Please check your internet connection.'
    }
  } else {
    error.value = {
      title: 'Checkout Error',
      message: errorResponse?.message || 'An unexpected error occurred. Please try again.'
    }
  }
}

const retryLoading = async () => {
  retrying.value = true
  error.value = null
  await initializeCheckout()
  retrying.value = false
}

const handlePaymentSuccess = (transaction) => {
  currentTransaction.value = transaction
  paymentStatus.value = 'success'
  showProcessingModal.value = false
  processingStep.value = 0
  
  // Redirect to success page or merchant return URL
  if (props.returnUrl) {
    window.location.href = props.returnUrl
  } else if (route.query.returnUrl) {
    window.location.href = route.query.returnUrl
  }
  
  emit('payment-success', transaction)
  
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
  
  emit('payment-failed', error)
  
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

const retryPayment = async () => {
  showErrorModal.value = false
  errorDetails.value = null
  
  // Reset payment form
  // This would typically involve resetting the CheckoutForm component
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
  if (data.merchantId === merchantId.value && data.transactionId === currentTransaction.value?.id) {
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

// Watchers
watch(() => props.merchantId, (newId) => {
  if (newId && newId !== merchantId.value) {
    initializeCheckout()
  }
})

watch(() => props.amount, (newAmount) => {
  if (newAmount && newAmount !== amount.value) {
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
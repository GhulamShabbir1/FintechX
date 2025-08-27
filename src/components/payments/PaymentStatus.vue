<template>
  <div class="payment-status-page">
    <!-- Success State -->
    <div v-if="status === 'success'" class="status-container success">
      <div class="status-content">
        <div class="status-icon">
          <q-icon name="check_circle" size="80px" color="green" />
        </div>
        <h1 class="status-title">Payment Successful!</h1>
        <p class="status-subtitle">Your transaction has been processed successfully</p>
        
        <!-- Transaction Details -->
        <div class="transaction-details">
          <div class="detail-card">
            <div class="detail-header">
              <q-icon name="receipt" color="lime" />
              <span>Transaction Details</span>
            </div>
            <div class="detail-content">
              <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <span class="value">{{ transactionId }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="value">{{ formatCurrency(amount) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{{ formatDate(transactionDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span class="value">{{ paymentMethod }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <q-chip color="green" text-color="white" label="Completed" size="sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Merchant Information -->
        <div class="merchant-info" v-if="merchantData">
          <div class="merchant-card">
            <div class="merchant-header">
              <q-avatar size="40px" square class="merchant-logo">
                <img :src="merchantData.logo_url || placeholderLogo" :alt="merchantData.business_name" />
              </q-avatar>
              <div class="merchant-details">
                <h4 class="merchant-name">{{ merchantData.business_name }}</h4>
                <p class="merchant-email">{{ merchantData.email }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            color="lime"
            icon="download"
            label="Download Receipt"
            @click="downloadReceipt"
            class="action-btn"
          />
          <q-btn
            outline
            color="lime"
            icon="print"
            label="Print Receipt"
            @click="printReceipt"
            class="action-btn"
          />
          <q-btn
            flat
            color="lime"
            icon="email"
            label="Email Receipt"
            @click="emailReceipt"
            class="action-btn"
          />
        </div>

        <!-- Return Links -->
        <div class="return-links">
          <q-btn
            color="primary"
            icon="home"
            label="Return to Merchant"
            @click="returnToMerchant"
            class="return-btn"
          />
          <q-btn
            flat
            color="white"
            icon="close"
            label="Close"
            @click="closeWindow"
            class="close-btn"
          />
        </div>
      </div>
    </div>

    <!-- Failure State -->
    <div v-else-if="status === 'failed'" class="status-container failure">
      <div class="status-content">
        <div class="status-icon">
          <q-icon name="error" size="80px" color="red" />
        </div>
        <h1 class="status-title">Payment Failed</h1>
        <p class="status-subtitle">{{ errorMessage || 'Your transaction could not be processed' }}</p>
        
        <!-- Error Details -->
        <div class="error-details">
          <div class="error-card">
            <div class="error-header">
              <q-icon name="info" color="orange" />
              <span>Error Information</span>
            </div>
            <div class="error-content">
              <div class="error-row">
                <span class="label">Error Code:</span>
                <span class="value">{{ errorCode || 'PAYMENT_FAILED' }}</span>
              </div>
              <div class="error-row">
                <span class="label">Transaction ID:</span>
                <span class="value">{{ transactionId || 'N/A' }}</span>
              </div>
              <div class="error-row">
                <span class="label">Date:</span>
                <span class="value">{{ formatDate(new Date()) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Suggested Actions -->
        <div class="suggested-actions">
          <h4>What you can do:</h4>
          <ul class="action-list">
            <li>Check your payment method details</li>
            <li>Ensure you have sufficient funds</li>
            <li>Try using a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            color="lime"
            icon="refresh"
            label="Try Again"
            @click="retryPayment"
            class="action-btn"
          />
          <q-btn
            outline
            color="lime"
            icon="support_agent"
            label="Contact Support"
            @click="contactSupport"
            class="action-btn"
          />
        </div>

        <!-- Return Links -->
        <div class="return-links">
          <q-btn
            color="primary"
            icon="arrow_back"
            label="Back to Checkout"
            @click="backToCheckout"
            class="return-btn"
          />
          <q-btn
            flat
            color="white"
            icon="close"
            label="Close"
            @click="closeWindow"
            class="close-btn"
          />
        </div>
      </div>
    </div>

    <!-- Pending State -->
    <div v-else-if="status === 'pending'" class="status-container pending">
      <div class="status-content">
        <div class="status-icon">
          <q-spinner-dots size="80px" color="orange" />
        </div>
        <h1 class="status-title">Payment Processing</h1>
        <p class="status-subtitle">Your payment is being processed. Please wait...</p>
        
        <!-- Processing Details -->
        <div class="processing-details">
          <div class="processing-card">
            <div class="processing-header">
              <q-icon name="hourglass_empty" color="orange" />
              <span>Processing Information</span>
            </div>
            <div class="processing-content">
              <div class="processing-row">
                <span class="label">Transaction ID:</span>
                <span class="value">{{ transactionId || 'Generating...' }}</span>
              </div>
              <div class="processing-row">
                <span class="label">Status:</span>
                <q-chip color="orange" text-color="white" label="Processing" size="sm" />
              </div>
              <div class="processing-row">
                <span class="label">Started:</span>
                <span class="value">{{ formatDate(new Date()) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-info">
            <span>Processing Progress</span>
            <span>{{ progressPercentage }}%</span>
          </div>
          <q-linear-progress 
            :value="progressPercentage / 100" 
            color="orange" 
            size="md"
            class="progress-bar"
          />
        </div>

        <!-- Estimated Time -->
        <div class="estimated-time">
          <q-icon name="schedule" color="orange" />
          <span>Estimated completion time: {{ estimatedTime }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            outline
            color="orange"
            icon="refresh"
            label="Refresh Status"
            @click="refreshStatus"
            class="action-btn"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="status-container loading">
      <div class="status-content">
        <q-spinner-dots size="80px" color="lime" />
        <h1 class="status-title">Loading Payment Status</h1>
        <p class="status-subtitle">Please wait while we retrieve your payment information...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import api from '../../boot/axios'

const route = useRoute()
const router = useRouter()

// Reactive data
const status = ref('')
const transactionId = ref('')
const amount = ref(0)
const paymentMethod = ref('')
const transactionDate = ref(new Date())
const merchantData = ref(null)
const errorMessage = ref('')
const errorCode = ref('')
const progressPercentage = ref(0)
const estimatedTime = ref('2-3 minutes')

// Constants
const placeholderLogo = 'https://dummyimage.com/200x200/121018/bdf000.png&text=Logo'

// Methods
const loadPaymentStatus = async () => {
  try {
    const paymentId = route.params.id
    if (!paymentId) {
      throw new Error('Payment ID not found')
    }

    // Load payment status from API
    const response = await api.get(`/api/payments/status/${paymentId}`)
    const paymentData = response.data

    // Update component state
    status.value = paymentData.status
    transactionId.value = paymentData.id
    amount.value = paymentData.amount
    paymentMethod.value = paymentData.method
    transactionDate.value = new Date(paymentData.created_at)
    merchantData.value = paymentData.merchant
    errorMessage.value = paymentData.error_message
    errorCode.value = paymentData.error_code

    // If pending, start progress simulation
    if (status.value === 'pending') {
      simulateProgress()
    }

  } catch {
    status.value = 'failed'
    errorMessage.value = 'Failed to load payment status'
  }
}

const simulateProgress = () => {
  const interval = setInterval(() => {
    if (progressPercentage.value < 90) {
      progressPercentage.value += Math.random() * 15
    } else {
      clearInterval(interval)
      // Simulate completion after a delay
      setTimeout(() => {
        status.value = 'success'
        progressPercentage.value = 100
      }, 2000)
    }
  }, 1000)
}

const downloadReceipt = async () => {
  try {
    const response = await api.get(`/api/payments/${transactionId.value}/receipt`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${transactionId.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    Notify.create({
      type: 'positive',
      message: 'Receipt downloaded successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Error downloading receipt:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to download receipt',
      position: 'top'
    })
  }
}

const printReceipt = () => {
  window.print()
}

const emailReceipt = async () => {
  try {
    await api.post(`/api/payments/${transactionId.value}/email-receipt`)
    Notify.create({
      type: 'positive',
      message: 'Receipt sent to your email',
      position: 'top'
    })
  } catch (error) {
    console.error('Error emailing receipt:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to send receipt',
      position: 'top'
    })
  }
}

const returnToMerchant = () => {
  if (merchantData.value?.return_url) {
    window.location.href = merchantData.value.return_url
  } else {
    router.push('/')
  }
}

const closeWindow = () => {
  window.close()
}

const retryPayment = () => {
  if (merchantData.value?.checkout_url) {
    window.location.href = merchantData.value.checkout_url
  } else {
    router.push('/checkout')
  }
}

const contactSupport = () => {
  // Implement support contact logic
  const supportEmail = merchantData.value?.support_email || 'support@finteckx.com'
  const supportPhone = merchantData.value?.support_phone || '+1-800-123-4567'
  
  Notify.create({
    type: 'info',
    message: `Contact support at ${supportEmail} or ${supportPhone}`,
    position: 'top',
    timeout: 5000
  })
}

const backToCheckout = () => {
  if (merchantData.value?.checkout_url) {
    window.location.href = merchantData.value.checkout_url
  } else {
    router.push('/checkout')
  }
}

const refreshStatus = async () => {
  await loadPaymentStatus()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadPaymentStatus()
})
</script>

<style scoped>
.payment-status-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  color: #ffffff;
  padding: 24px;
}

.status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.status-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.status-icon {
  margin-bottom: 24px;
}

.status-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.status-subtitle {
  font-size: 1.2rem;
  color: #cfcfcf;
  margin-bottom: 32px;
}

/* Transaction Details */
.transaction-details {
  margin-bottom: 32px;
}

.detail-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #bdf000;
  font-weight: 600;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #cfcfcf;
  font-weight: 500;
}

.detail-row .value {
  color: #ffffff;
  font-weight: 600;
}

/* Merchant Information */
.merchant-info {
  margin-bottom: 32px;
}

.merchant-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: inline-block;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.merchant-logo {
  border: 2px solid rgba(189, 240, 0.3);
}

.merchant-name {
  margin: 0 0 4px 0;
  color: #bdf000;
  font-size: 1.1rem;
}

.merchant-email {
  margin: 0;
  color: #cfcfcf;
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 160px;
}

/* Return Links */
.return-links {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.return-btn, .close-btn {
  min-width: 160px;
}

/* Error Details */
.error-details {
  margin-bottom: 32px;
}

.error-card {
  background: rgba(244, 67, 54, 0.1);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(244, 67, 54, 0.2);
  text-align: left;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #f44336;
  font-weight: 600;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(244, 67, 54, 0.2);
}

.error-row:last-child {
  border-bottom: none;
}

.error-row .label {
  color: #cfcfcf;
  font-weight: 500;
}

.error-row .value {
  color: #ffffff;
  font-weight: 600;
}

/* Suggested Actions */
.suggested-actions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.suggested-actions h4 {
  margin: 0 0 16px 0;
  color: #bdf000;
}

.action-list {
  margin: 0;
  padding-left: 20px;
  color: #cfcfcf;
}

.action-list li {
  margin-bottom: 8px;
}

/* Processing Details */
.processing-details {
  margin-bottom: 32px;
}

.processing-card {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 152, 0, 0.2);
  text-align: left;
}

.processing-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #ff9800;
  font-weight: 600;
}

.processing-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.processing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 152, 0, 0.2);
}

.processing-row:last-child {
  border-bottom: none;
}

.processing-row .label {
  color: #cfcfcf;
  font-weight: 500;
}

.processing-row .value {
  color: #ffffff;
  font-weight: 600;
}

/* Progress Section */
.progress-section {
  margin-bottom: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #cfcfcf;
  font-weight: 500;
}

.progress-bar {
  border-radius: 8px;
}

/* Estimated Time */
.estimated-time {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  color: #ff9800;
  font-weight: 500;
  margin-bottom: 32px;
}

/* Success State */
.success .status-title {
  color: #4caf50;
}

/* Failure State */
.failure .status-title {
  color: #f44336;
}

/* Pending State */
.pending .status-title {
  color: #ff9800;
}

/* Loading State */
.loading .status-title {
  color: #bdf000;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-status-page {
    padding: 16px;
  }
  
  .status-title {
    font-size: 2rem;
  }
  
  .status-subtitle {
    font-size: 1rem;
  }
  
  .action-buttons, .return-links {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn, .return-btn, .close-btn {
    min-width: 200px;
  }
  
  .detail-card, .error-card, .processing-card {
    padding: 16px;
  }
  
  .detail-row, .error-row, .processing-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
<template>
  <q-page class="q-pa-md flex flex-center payment-status-page">
    <q-card class="payment-status-card lime-glow">
      <q-card-section class="status-icon-section">
        <div class="icon-container">
          <q-icon
            :name="statusIcon"
            :color="statusColor"
            size="80px"
            class="status-icon"
          />
          <div class="icon-ring" :class="statusColor"></div>
          <div class="icon-particles" v-if="isSuccess">
            <div class="particle" v-for="n in 12" :key="n" :style="getParticleStyle(n)"></div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="status-message-section">
        <div class="text-h5 text-center status-title" :class="`text-${statusColor}`">{{ statusTitle }}</div>
        <div class="text-subtitle1 text-center text-grey-5 q-mt-sm status-message">{{ statusMessage }}</div>
      </q-card-section>

      <q-card-section v-if="isSuccess" class="payment-details-section">
        <div class="detail-item" v-for="(detail, index) in successDetails" :key="detail.label" :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="detail-label">
            <q-icon :name="detail.icon" size="sm" class="q-mr-sm" />
            {{ detail.label }}:
          </div>
          <div class="detail-value" :class="detail.valueClass">{{ detail.value }}</div>
        </div>
      </q-card-section>

      <q-card-section v-else-if="isFailed" class="error-details-section">
        <div class="detail-item" v-for="(detail, index) in errorDetails" :key="detail.label" :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="detail-label">
            <q-icon :name="detail.icon" size="sm" class="q-mr-sm" />
            {{ detail.label }}:
          </div>
          <div class="detail-value" :class="detail.valueClass">{{ detail.value }}</div>
        </div>
      </q-card-section>

      <q-card-section v-else-if="isPending" class="pending-details-section">
        <div class="text-center">
          <q-spinner-dots color="orange" size="40px" class="q-mb-md" />
          <div class="text-body1">Processing your payment...</div>
          <div class="text-caption text-grey-5">This may take a few moments</div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md action-buttons">
        <q-btn
          v-if="isSuccess"
          label="Back to Merchant"
          class="btn-gradient"
          @click="goToMerchant"
          icon="store"
        />
        <q-btn
          v-else-if="isFailed"
          label="Try Again"
          class="btn-gradient"
          @click="tryAgain"
          icon="refresh"
        />
        <q-btn
          v-else-if="isPending"
          label="Check Status"
          class="btn-gradient"
          @click="checkStatus"
          icon="refresh"
          :loading="checking"
        />
        <q-btn
          flat
          label="Go to Home"
          class="q-ml-sm btn-outline-light"
          @click="goToHome"
          icon="home"
        />
      </q-card-actions>

      <q-card-section class="security-badges">
        <div class="security-item" v-for="(badge, index) in securityBadges" :key="badge.text" :style="{ animationDelay: `${index * 0.2}s` }">
          <q-icon :name="badge.icon" :color="badge.color" size="sm" />
          <span>{{ badge.text }}</span>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="isSuccess" class="confetti-container">
      <div class="confetti" v-for="n in 50" :key="n" :style="getConfettiStyle(n)"></div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import api from '../../boot/axios'

// Props
const props = defineProps({
  paymentId: {
    type: String,
    default: null
  }
})

const route = useRoute()
const router = useRouter()

// Reactive data
const checking = ref(false)
const paymentData = ref(null)
const loading = ref(false)

// Get payment status from multiple sources
const paymentStatus = computed(() => {
  if (paymentData.value?.status) {
    return paymentData.value.status
  }
  return route.query.status || 'pending'
})

const transactionId = computed(() => {
  if (paymentData.value?.transaction_id) {
    return paymentData.value.transaction_id
  }
  if (props.paymentId && props.paymentId !== 'failed') {
    return props.paymentId
  }
  return route.query.transaction_id || 'N/A'
})

const amount = computed(() => {
  if (paymentData.value?.amount) {
    return paymentData.value.amount
  }
  return parseFloat(route.query.amount) || 0
})

const errorMessage = computed(() => {
  if (paymentData.value?.error_message) {
    return paymentData.value.error_message
  }
  return route.query.error || 'Payment could not be completed.'
})

const merchantId = computed(() => {
  if (paymentData.value?.merchant_id) {
    return paymentData.value.merchant_id
  }
  return route.query.merchantId || route.query.merchant_id || null
})

const merchantName = computed(() => {
  if (paymentData.value?.merchant_name) {
    return paymentData.value.merchant_name
  }
  return route.query.merchantName || route.query.merchant_name || 'Unknown Merchant'
})

const transactionDate = computed(() => {
  if (paymentData.value?.created_at) {
    return new Date(paymentData.value.created_at).toLocaleDateString()
  }
  return new Date().toLocaleDateString()
})

const currency = ref('$')

// Status computed properties
const isSuccess = computed(() => paymentStatus.value === 'success' || paymentStatus.value === 'completed')
const isFailed = computed(() => paymentStatus.value === 'failed' || paymentStatus.value === 'error')
const isPending = computed(() => paymentStatus.value === 'pending' || paymentStatus.value === 'processing')

const statusIcon = computed(() => {
  if (isSuccess.value) return 'check_circle'
  if (isFailed.value) return 'cancel'
  if (isPending.value) return 'schedule'
  return 'help_outline'
})

const statusColor = computed(() => {
  if (isSuccess.value) return 'green'
  if (isFailed.value) return 'red'
  if (isPending.value) return 'orange'
  return 'grey'
})

const statusTitle = computed(() => {
  if (isSuccess.value) return 'Payment Successful!'
  if (isFailed.value) return 'Payment Failed'
  if (isPending.value) return 'Payment Processing'
  return 'Payment Status Unknown'
})

const statusMessage = computed(() => {
  if (isSuccess.value) return 'Your transaction has been completed successfully.'
  if (isFailed.value) return 'There was an issue processing your payment.'
  if (isPending.value) return 'Your payment is being processed. Please wait...'
  return 'We could not determine the status of your payment.'
})


const successDetails = computed(() => [
  { label: 'Transaction ID', value: transactionId.value || 'N/A', icon: 'receipt', valueClass: '' },
  { label: 'Amount Paid', value: `${currency.value}${formatAmount(amount.value)}`, icon: 'attach_money', valueClass: 'text-lime' },
  { label: 'Merchant', value: merchantName.value || 'N/A', icon: 'store', valueClass: '' },
  { label: 'Date', value: transactionDate.value, icon: 'event', valueClass: '' }
])

const errorDetails = computed(() => [
  { label: 'Error', value: errorMessage.value || 'Unknown error', icon: 'error', valueClass: 'text-red' },
  { label: 'Transaction ID', value: transactionId.value || 'N/A', icon: 'receipt', valueClass: '' },
  { label: 'Next Steps', value: 'Please try again or contact support if the problem persists.', icon: 'support_agent', valueClass: 'text-grey-5' }
])

const securityBadges = computed(() => [
  { icon: 'security', color: 'green', text: 'SSL Encrypted' },
  { icon: 'verified_user', color: 'blue', text: 'PCI Compliant' },
  { icon: 'lock', color: 'lime', text: '256-bit Encryption' }
])


// Methods
const formatAmount = (val) => {
  if (!val) return '0.00'
  return (val / 100).toFixed(2)
}

const fetchPaymentDetails = async () => {
  if (!props.paymentId || props.paymentId === 'failed') {
    return
  }

  try {
    loading.value = true
    const response = await api.get(`/api/payments/status/${props.paymentId}`)
    paymentData.value = response.data
    
    // Update currency if provided
    if (response.data.currency) {
      currency.value = getCurrencySymbol(response.data.currency)

    }
  } catch (error) {
    console.error('Failed to fetch payment details:', error)
    // Don't show error notification as we have fallback data from query params
  } finally {
    loading.value = false
  }
}

const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  }
  return symbols[currencyCode] || '$'
}

const checkStatus = async () => {
  if (!props.paymentId || props.paymentId === 'failed') {
    return
  }

  try {
    checking.value = true
    await fetchPaymentDetails()
    
    if (paymentData.value?.status === 'completed' || paymentData.value?.status === 'success') {
      Notify.create({
        type: 'positive',
        message: 'Payment completed successfully!',
        position: 'top'
      })
    } else if (paymentData.value?.status === 'failed' || paymentData.value?.status === 'error') {
      Notify.create({
        type: 'negative',
        message: 'Payment failed. Please try again.',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Failed to check payment status:', error)
    Notify.create({
      type: 'negative',
      message: 'Unable to check payment status. Please try again.',
      position: 'top'
    })
  } finally {
    checking.value = false
  }
}

const goToMerchant = () => {

  const returnUrl = route.query.returnUrl || route.query.return_url
  if (returnUrl) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => { 
      window.location.href = returnUrl 
    }, 500)

  } else {
    router.push('/')
  }
}

const tryAgain = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => {

    const checkoutParams = {
      merchantId: merchantId.value,
      amount: amount.value
    }
    
    const returnUrl = route.query.returnUrl || route.query.return_url
    if (returnUrl) {
      checkoutParams.returnUrl = returnUrl
    }
    
    router.push({ 
      name: 'checkout', 
      query: checkoutParams
    })

  }, 500)
}

const goToHome = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })

  setTimeout(() => { 
    router.push('/') 
  }, 500)

}

const getParticleStyle = (index) => {
  const angle = (index / 12) * Math.PI * 2
  const distance = 60

  return { 
    transform: `rotate(${angle}rad) translate(${distance}px) rotate(-${angle}rad)`, 
    animationDelay: `${index * 0.1}s` 
  }

}
const getConfettiStyle = (index) => {
  const colors = ['#bdf000', '#4caf50', '#2196f3', '#ff9800', '#e91e63']
  const shapes = ['circle', 'rectangle', 'triangle']
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    backgroundColor: colors[index % colors.length],
    width: `${5 + Math.random() * 10}px`,
    height: `${5 + Math.random() * 10}px`,
    borderRadius: shapes[index % shapes.length] === 'circle' ? '50%' : '2px'
  }
}

// Watchers
watch(() => props.paymentId, (newId) => {
  if (newId && newId !== 'failed') {
    fetchPaymentDetails()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.documentElement.style.scrollBehavior = 'smooth'

  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  // Auto-refresh for pending payments
  if (isPending.value && props.paymentId && props.paymentId !== 'failed') {
    const interval = setInterval(() => {
      if (!isPending.value) {
        clearInterval(interval)
        return
      }
      fetchPaymentDetails()
    }, 5000) // Check every 5 seconds
    
    // Clear interval after 5 minutes
    setTimeout(() => {
      clearInterval(interval)
    }, 300000)
  }

})
</script>

// ... existing styles remain the same ...
<style scoped>
.payment-status-page {
  background: linear-gradient(135deg, #09050d 0%, #121018 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.payment-status-card {
  background: #000;
  color: #fff;
  border-radius: 20px;
  padding: 30px;
  max-width: 550px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
  transform: translateY(20px);
  opacity: 0;
  animation: slideUpFadeIn 0.8s ease forwards;
}

.lime-glow {
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 30px rgba(189, 240, 0, 0.1);
}

.status-icon-section {
  padding-bottom: 0;
}

.icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.status-icon {
  animation: bounceIn 0.8s ease-out;
  position: relative;
  z-index: 2;
}

.icon-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid;
  border-radius: 50%;
  opacity: 0;
  animation: pulseRing 2s ease-out infinite;
}

.icon-ring.green { border-color: #4caf50; }
.icon-ring.red { border-color: #f44336; }
.icon-ring.orange { border-color: #ff9800; }
.icon-ring.grey { border-color: #9e9e9e; }

.icon-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #bdf000;
  border-radius: 50%;
  animation: particleFloat 1.5s ease-in-out infinite;
}

.status-message-section {
  padding-top: 10px;
  padding-bottom: 30px;
}

.status-title {
  animation: fadeInUp 0.6s ease 0.3s forwards;
  opacity: 0;
  transform: translateY(20px);
}

.status-message {
  animation: fadeInUp 0.6s ease 0.4s forwards;
  opacity: 0;
  transform: translateY(20px);
}

.payment-details-section, 
.error-details-section,
.pending-details-section {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInRight 0.5s ease forwards;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #bdf000;
  display: flex;
  align-items: center;
}

.detail-value {
  color: #ffffff;
  font-weight: 500;
}

.action-buttons {
  padding-top: 30px;
}

.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #000000;
  font-weight: 700;
  border-radius: 8px;
  padding: 12px 24px;
  box-shadow: 0 4px 15px rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(189, 240, 0, 0.4);
}

.btn-outline-light {
  border: 1px solid #fff;
  color: #fff;
  border-radius: 8px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.security-badges {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.security-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #a0a0a0;
  opacity: 0;
  animation: fadeIn 0.6s ease forwards;
}

.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  opacity: 0;
  animation: confettiFall 5s linear forwards;
}

/* Animations */
@keyframes slideUpFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Color classes */
.text-lime { color: #bdf000; }
.text-red { color: #f44336; }
.text-green { color: #4caf50; }
.text-orange { color: #ff9800; }
.text-grey-5 { color: #aaa; }

/* Responsive design */
@media (max-width: 768px) {
  .payment-status-card {
    padding: 20px;
    margin: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .security-badges {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-outline-light {
    margin-left: 0 !important;
  }
}
</style>
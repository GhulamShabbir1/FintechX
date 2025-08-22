<template>
  <q-page class="q-pa-md flex flex-center payment-status-page">
    <q-card class="payment-status-card lime-glow">
      <q-card-section class="status-icon-section">
        <q-icon
          :name="statusIcon"
          :color="statusColor"
          size="80px"
          class="status-icon"
        />
      </q-card-section>

      <q-card-section class="status-message-section">
        <div class="text-h5 text-center" :class="`text-${statusColor}`">{{ statusTitle }}</div>
        <div class="text-subtitle1 text-center text-grey-5 q-mt-sm">{{ statusMessage }}</div>
      </q-card-section>

      <q-card-section v-if="isSuccess" class="payment-details-section">
        <div class="detail-item">
          <div class="detail-label">Transaction ID:</div>
          <div class="detail-value">{{ transactionId || 'N/A' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Amount Paid:</div>
          <div class="detail-value text-lime">{{ currency }}{{ formatAmount(amount) }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Merchant:</div>
          <div class="detail-value">{{ merchantName || 'N/A' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date:</div>
          <div class="detail-value">{{ transactionDate }}</div>
        </div>
      </q-card-section>

      <q-card-section v-else-if="isFailed" class="error-details-section">
        <div class="detail-item">
          <div class="detail-label">Error:</div>
          <div class="detail-value text-red">{{ errorMessage || 'Unknown error' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Please try again or contact support.</div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md">
        <q-btn
          v-if="isSuccess"
          label="Back to Merchant"
          class="btn-gradient"
          @click="goToMerchant"
        />
        <q-btn
          v-else
          label="Try Again"
          class="btn-gradient"
          @click="tryAgain"
        />
        <q-btn
          flat
          label="Go to Home"
          class="q-ml-sm btn-outline-light"
          @click="goToHome"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../boot/axios'

const route = useRoute()
const router = useRouter()

const paymentStatus = ref(route.query.status || 'unknown')
const transactionId = ref(route.params.id === 'failed' ? null : route.params.id)
const amount = ref(parseFloat(route.query.amount) || 0)
const errorMessage = ref(route.query.error || 'Payment could not be completed.')
const merchantId = ref(route.query.merchantId || null)
const merchantName = ref(route.query.merchantName || '')
const transactionDate = ref(new Date().toLocaleDateString())
const currency = ref('$')

const isSuccess = computed(() => paymentStatus.value === 'success')
const isFailed = computed(() => paymentStatus.value === 'failed')

const statusIcon = computed(() => {
  if (isSuccess.value) return 'check_circle'
  if (isFailed.value) return 'cancel'
  return 'help_outline'
})

const statusColor = computed(() => {
  if (isSuccess.value) return 'green'
  if (isFailed.value) return 'red'
  return 'grey'
})

const statusTitle = computed(() => {
  if (isSuccess.value) return 'Payment Successful!'
  if (isFailed.value) return 'Payment Failed'
  return 'Payment Status Unknown'
})

const statusMessage = computed(() => {
  if (isSuccess.value) return 'Your transaction has been completed.'
  if (isFailed.value) return 'There was an issue processing your payment.'
  return 'We could not determine the status of your payment.'
})

const formatAmount = (val) => {
  return (val / 100).toFixed(2)
}

const fetchMerchantName = async () => {
  if (merchantId.value && !merchantName.value) {
    try {
      const response = await api.get(`/merchants/${merchantId.value}`)
      merchantName.value = response.data.business_name || 'Unknown Merchant'
    } catch (error) {
      console.error('Failed to fetch merchant name:', error)
      merchantName.value = 'Unknown Merchant'
    }
  }
}

const goToMerchant = () => {
  if (route.query.returnUrl) {
    window.location.href = route.query.returnUrl
  } else {
    router.push('/')
  }
}

const tryAgain = () => {
  router.push({ 
    name: 'checkout', 
    query: { 
      merchantId: merchantId.value, 
      amount: amount.value,
      returnUrl: route.query.returnUrl
    } 
  })
}

const goToHome = () => {
  router.push('/')
}

onMounted(() => {
  if (isSuccess.value) {
    fetchMerchantName()
  }
})
</script>

<style scoped>
.payment-status-page {
  background: linear-gradient(135deg, #09050d 0%, #121018 100%);
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

.status-icon {
  animation: bounceIn 0.8s ease-out;
}

.status-message-section {
  padding-top: 10px;
  padding-bottom: 30px;
}

.payment-details-section, .error-details-section {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #bdf000;
}

.detail-value {
  color: #ffffff;
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
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(189, 240, 0, 0.4);
}

.btn-outline-light {
  border: 1px solid #fff;
  color: #fff;
  border-radius: 8px;
  padding: 12px 24px;
}

/* Animations */
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

/* Hover effects */
.btn-gradient, .btn-outline-light {
  transition: all 0.3s ease;
}

.btn-gradient:hover, .btn-outline-light:hover {
  transform: translateY(-2px);
}

/* Responsive design */
@media (max-width: 768px) {
  .payment-status-card {
    padding: 20px;
    margin: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}
</style>
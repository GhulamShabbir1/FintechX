<template>
  <div class="checkout-router">
    <!-- Checkout page -->
    <CheckoutPage v-if="showCheckout" />
    
    <!-- Payment status page -->
    <PaymentStatus v-else-if="showStatus" />
    
    <!-- Error page -->
    <div v-else-if="showError" class="error-container">
      <q-card class="error-card lime-glow">
        <q-card-section class="text-center">
          <q-icon name="error" size="64px" color="negative" class="q-mb-md" />
          <div class="text-h5 text-negative">Checkout Error</div>
          <div class="text-subtitle1 q-mt-md">{{ errorMessage }}</div>
          <q-btn
            label="Try Again"
            class="btn-gradient q-mt-lg"
            @click="retryCheckout"
          />
        </q-card-section>
      </q-card>
    </div>
    
    <!-- Loading state -->
    <div v-else class="loading-container">
      <q-spinner-dots size="50px" color="lime" />
      <div class="loading-text">Initializing checkout...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CheckoutPage from './CheckoutPage.vue'
import PaymentStatus from '../payments/PaymentStatus.vue'

const route = useRoute()

// Reactive data
const checkoutState = ref('loading') // loading, checkout, status, error
const errorMessage = ref('')

// Computed properties
const showCheckout = computed(() => checkoutState.value === 'checkout')
const showStatus = computed(() => checkoutState.value === 'status')
const showError = computed(() => checkoutState.value === 'error')

// Methods
const retryCheckout = () => {
  checkoutState.value = 'loading'
  initializeCheckout()
}

const initializeCheckout = async () => {
  try {
    // Check if this is a payment status page
    if (route.query.status) {
      checkoutState.value = 'status'
      return
    }
    
    // Validate required parameters
    const requiredParams = ['amount', 'merchant']
    const missingParams = requiredParams.filter(param => !route.query[param])
    
    if (missingParams.length > 0) {
      errorMessage.value = `Missing required parameters: ${missingParams.join(', ')}`
      checkoutState.value = 'error'
      return
    }
    
    // Initialize checkout
    checkoutState.value = 'checkout'
    
  } catch (error) {
    console.error('Failed to initialize checkout:', error)
    errorMessage.value = 'Failed to initialize checkout. Please try again.'
    checkoutState.value = 'error'
  }
}

// Lifecycle
onMounted(() => {
  initializeCheckout()
})
</script>

<style scoped>
.checkout-router {
  min-height: 100vh;
  background: #0a0a0a;
}

.loading-container, .error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.loading-text {
  color: #bdf000;
  font-size: 1.1rem;
  margin-top: 20px;
}

.error-card {
  max-width: 500px;
  width: 100%;
  background: #121212;
  border-radius: 16px;
  overflow: hidden;
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(189, 240, 0, 0.2),
              0 0 20px rgba(189, 240, 0, 15);
}

.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 5);
  border-radius: 8px;
}

.text-negative {
  color: #ff6b6b;
}
</style>
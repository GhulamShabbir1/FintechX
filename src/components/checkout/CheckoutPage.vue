<template>
  <q-page class="checkout-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <q-spinner-dots size="50px" color="lime" />
        <div class="loading-text">Loading secure checkout...</div>
        <div class="loading-subtext">Preparing your payment environment</div>
      </div>
    </div>
    
    <!-- Main checkout content -->
    <div v-else class="checkout-content">
      <!-- Header with back button -->
      <div class="checkout-header">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="lime"
          @click="goBack"
          class="back-btn animate-fade-in"
        />
        <div class="header-text animate-fade-in" style="animation-delay: 0.1s">
          <h1 class="page-title">Secure Checkout</h1>
          <p class="page-subtitle">Complete your payment securely</p>
        </div>
        <div class="header-security animate-fade-in" style="animation-delay: 0.2s">
          <q-icon name="lock" color="lime" size="20px" />
          <span>Secure Connection</span>
        </div>
      </div>
      
      <!-- Main checkout form -->
      <div class="checkout-main">
        <div class="checkout-left">
          <!-- Merchant branding and amount -->
          <MerchantBranding
            :merchant="merchantInfo"
            :amount="paymentDetails.amount"
            :order-details="orderDetails"
            @branding-loaded="onBrandingLoaded"
            class="animate-fade-in"
            style="animation-delay: 0.3s"
          />
          
          <!-- Payment method selector -->
          <PaymentMethodSelector
            v-model="selectedPaymentMethod"
            :methods="availablePaymentMethods"
            @method-selected="onPaymentMethodSelected"
            class="animate-fade-in"
            style="animation-delay: 0.4s"
          />
        </div>
        
        <div class="checkout-right">
          <!-- Payment form based on selected method -->
          <div v-if="selectedPaymentMethod === 'card'" class="payment-section card-payment animate-fade-in" style="animation-delay: 0.5s">
            <PaymentMethodCard
              v-model="cardForm"
              :processing="processing"
              @submit="processCardPayment"
              @validation-change="onCardValidationChange"
            />
          </div>
          
          <div v-else-if="selectedPaymentMethod === 'wallet'" class="payment-section wallet-payment animate-fade-in" style="animation-delay: 0.5s">
            <div class="wallet-payment">
              <q-card class="wallet-card modern-card">
                <q-card-section class="card-header">
                  <div class="card-icon">
                    <q-icon name="account_balance_wallet" size="28px" />
                  </div>
                  <div class="card-title">
                    <div class="text-h6">Digital Wallet</div>
                    <div class="text-caption">Pay with your favorite wallet</div>
                  </div>
                </q-card-section>
                
                <q-card-section>
                  <div class="wallet-options q-gutter-md">
                    <q-btn
                      v-for="wallet in walletOptions"
                      :key="wallet.id"
                      :label="wallet.name"
                      :icon="wallet.icon"
                      class="wallet-btn modern-btn"
                      :class="{ 'wallet-selected': selectedWallet === wallet.id }"
                      @click="selectWallet(wallet.id)"
                    />
                  </div>
                  
                  <q-btn
                    v-if="selectedWallet"
                    label="Continue with Wallet"
                    class="btn-primary full-width q-mt-lg"
                    :loading="processing"
                    @click="processWalletPayment"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <div v-else-if="selectedPaymentMethod === 'upi'" class="payment-section upi-payment animate-fade-in" style="animation-delay: 0.5s">
            <div class="upi-payment">
              <q-card class="upi-card modern-card">
                <q-card-section class="card-header">
                  <div class="card-icon">
                    <q-icon name="qr_code" size="28px" />
                  </div>
                  <div class="card-title">
                    <div class="text-h6">UPI Payment</div>
                    <div class="text-caption">Scan QR or enter UPI ID</div>
                  </div>
                </q-card-section>
                
                <q-card-section>
                  <q-input
                    v-model="upiForm.upiId"
                    label="UPI ID"
                    placeholder="example@upi"
                    outlined
                    dense
                    class="q-mb-md"
                  />
                  
                  <q-btn
                    label="Pay with UPI"
                    class="btn-primary full-width"
                    :loading="processing"
                    @click="processUpiPayment"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error display -->
      <div v-if="error" class="error-message q-mt-md">
        <q-banner class="text-white bg-negative">
          {{ error }}
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import api from '../../boot/axios'
import MerchantBranding from './MerchantBranding.vue'
import PaymentMethodSelector from './PaymentMethodSelector.vue'
import PaymentMethodCard from './PaymentMethodCard.vue'

const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(true)
const processing = ref(false)
const error = ref('')
const merchantInfo = ref({})
const paymentDetails = ref({
  amount: 0,
  currency: 'usd'
})
const orderDetails = ref([])
const selectedPaymentMethod = ref('card')
const selectedWallet = ref(null)
const cardForm = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: ''
})
const upiForm = ref({
  upiId: ''
})

// Payment methods
const availablePaymentMethods = ref([
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit_card' },
  { id: 'wallet', name: 'Digital Wallet', icon: 'account_balance_wallet' },
  { id: 'upi', name: 'UPI', icon: 'qr_code' }
])

const walletOptions = ref([
  { id: 'paytm', name: 'Paytm', icon: 'account_balance_wallet' },
  { id: 'phonepe', name: 'PhonePe', icon: 'account_balance_wallet' },
  { id: 'gpay', name: 'Google Pay', icon: 'account_balance_wallet' }
])

// Computed
const totalAmount = computed(() => {
  return orderDetails.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
})

// Methods
const goBack = () => {
  router.go(-1)
}

const onBrandingLoaded = (branding) => {
  merchantInfo.value = branding
}

const onPaymentMethodSelected = (method) => {
  selectedPaymentMethod.value = method
  error.value = ''
}

const onCardValidationChange = () => {
  // Handle card validation
}

const selectWallet = (walletId) => {
  selectedWallet.value = walletId
}

const processCardPayment = async () => {
  await processPayment({
    method: 'card',
    card_details: cardForm.value
  })
}

const processWalletPayment = async () => {
  await processPayment({
    method: 'wallet',
    wallet_id: selectedWallet.value
  })
}

const processUpiPayment = async () => {
  if (!upiForm.value.upiId) {
    error.value = 'Please enter UPI ID'
    return
  }
  
  await processPayment({
    method: 'upi',
    upi_id: upiForm.value.upiId
  })
}

const processPayment = async (paymentData) => {
  try {
    processing.value = true
    error.value = ''
    
    const payload = {
      merchant_id: route.params.merchantId || 1,
      amount: totalAmount.value,
      currency: paymentDetails.value.currency,
      method: paymentData.method,
      customer: {
        name: 'John Doe', // Get from form
        email: 'customer@example.com', // Get from form
        phone: '+15555555555' // Get from form
      },
      cart: orderDetails.value,
      return_url_success: `${window.location.origin}/payment/success`,
      return_url_failure: `${window.location.origin}/payment/failure`,
      ...paymentData
    }
    
    const response = await api.post('/api/payments/checkout', payload)
    
    if (response.data.success) {
      Notify.create({
        type: 'positive',
        message: 'Payment processed successfully!',
        position: 'top'
      })
      
      // Redirect to success page or handle response
      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url
      }
    } else {
      error.value = response.data.message || 'Payment failed'
    }
    
  } catch (err) {
    console.error('Payment error:', err)
    error.value = err.response?.data?.message || 'Payment processing failed. Please try again.'
  } finally {
    processing.value = false
  }
}

const loadCheckoutData = async () => {
  try {
    loading.value = true
    
    // Load merchant info
    if (route.params.merchantId) {
      const merchantResponse = await api.get(`/api/merchant/${route.params.merchantId}`)
      merchantInfo.value = merchantResponse.data
    }
    
    // Load order details (this would come from your cart/order system)
    orderDetails.value = [
      { product: 'T-Shirt', qty: 2, price: 2000 },
      { product: 'Cap', qty: 1, price: 1000 }
    ]
    
    paymentDetails.value.amount = totalAmount.value
    
  } catch (err) {
    console.error('Error loading checkout data:', err)
    error.value = 'Failed to load checkout information'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadCheckoutData()
})
</script>

<style scoped>
.checkout-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #1a1a1a 100%);
  min-height: 100vh;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
  background: rgba(10, 10, 10, 0.95);
}

.loading-content {
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

.loading-text {
  color: #bdf000;
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 16px;
}

.loading-subtext {
  color: #888;
  font-size: 0.9rem;
  margin-top: 8px;
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(18, 18, 18, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(189, 240, 0, 0.1);
}

.back-btn {
  background: rgba(189, 240, 0, 0.1);
  border: 1px solid rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
  background: rgba(189, 240, 0, 0.2);
  box-shadow: 0 4px 12px rgba(189, 240, 0, 0.2);
}

.header-text {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #bdf000 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 0;
  font-size: 1.1rem;
  color: #ccc;
  opacity: 0.8;
}

.header-security {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #bdf000;
  font-size: 0.9rem;
  font-weight: 500;
}

.checkout-main {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 32px;
  margin-bottom: 40px;
}

.checkout-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.checkout-right {
  display: flex;
  flex-direction: column;
}

.payment-section {
  background: rgba(18, 18, 18, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.15);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.payment-section:hover {
  border-color: rgba(189, 240, 0, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(189, 240, 0, 0.2),
              0 0 30px rgba(189, 240, 0, 0.1);
}

.modern-card {
  background: transparent;
  border: none;
  border-radius: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.2), rgba(189, 240, 0, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bdf000;
}

.card-title .text-h6 {
  color: #ffffff;
  margin: 0;
  font-weight: 600;
}

.card-title .text-caption {
  color: #888;
  margin: 4px 0 0 0;
}

.wallet-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 20px 0;
}

.wallet-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.wallet-btn:hover {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(189, 240, 0, 0.2);
}

.wallet-selected {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.15);
  color: #bdf000;
  box-shadow: 0 4px 16px rgba(189, 240, 0, 0.2);
}

.modern-input {
  border-radius: 12px;
}

.modern-input :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.3);
}

.modern-input :deep(.q-field__control:focus-within) {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #09050d;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(189, 240, 0, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.trust-indicators {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 30px;
  background: rgba(18, 18, 18, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  backdrop-filter: blur(10px);
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}

.trust-item:hover {
  background: rgba(189, 240, 0, 0.1);
  color: #bdf000;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.trust-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.2), rgba(189, 240, 0, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

/* Animation Classes */
.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 1024px) {
  .checkout-main {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .trust-indicators {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 16px;
  }
  
  .checkout-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .wallet-options {
    grid-template-columns: 1fr;
  }
  
  .trust-indicators {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .trust-item {
    flex-direction: row;
    text-align: left;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .checkout-header {
    padding: 12px;
  }
  
  .payment-section {
    border-radius: 16px;
  }
}

/* Smooth scrolling */
.checkout-page {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
.checkout-page::-webkit-scrollbar {
  width: 8px;
}

.checkout-page::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.checkout-page::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.3);
  border-radius: 4px;
}

.checkout-page::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.5);
}

/* Enhanced focus states */
:deep(.q-focusable):focus {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Loading animation enhancements */
:deep(.q-spinner) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulse animation for interactive elements */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.btn-primary:focus {
  animation: pulse 0.6s ease;
}

/* Glow effect for cards */
.modern-card {
  position: relative;
}

.modern-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(189, 240, 0, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-card:hover::before {
  opacity: 1;
}
</style>
<template>
  <q-page class="checkout-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <q-spinner-dots size="50px" color="lime" />
      <div class="loading-text">Loading checkout...</div>
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
          class="back-btn"
        />
        <div class="header-text">
          <h1 class="page-title">Secure Checkout</h1>
          <p class="page-subtitle">Complete your payment securely</p>
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
          />
          
          <!-- Payment method selector -->
          <PaymentMethodSelector
            v-model="selectedPaymentMethod"
            :methods="availablePaymentMethods"
            @method-selected="onPaymentMethodSelected"
          />
        </div>
        
        <div class="checkout-right">
          <!-- Payment form based on selected method -->
          <div v-if="selectedPaymentMethod === 'card'" class="payment-section">
            <PaymentMethodCard
              v-model="cardForm"
              :processing="processing"
              @submit="processCardPayment"
              @validation-change="onCardValidationChange"
            />
          </div>
          
          <div v-else-if="selectedPaymentMethod === 'wallet'" class="payment-section">
            <div class="wallet-payment">
              <q-card class="wallet-card lime-glow">
                <q-card-section class="text-h6 text-center text-lime">
                  <q-icon name="account_balance_wallet" class="q-mr-sm" />
                  Digital Wallet Payment
                </q-card-section>
                
                <q-card-section>
                  <div class="wallet-options q-gutter-md">
                    <q-btn
                      v-for="wallet in walletOptions"
                      :key="wallet.id"
                      :label="wallet.name"
                      :icon="wallet.icon"
                      class="wallet-btn full-width"
                      :class="{ 'wallet-selected': selectedWallet === wallet.id }"
                      @click="selectWallet(wallet.id)"
                    />
                  </div>
                  
                  <q-btn
                    v-if="selectedWallet"
                    label="Continue with Wallet"
                    class="btn-gradient full-width q-mt-md"
                    :loading="processing"
                    @click="processWalletPayment"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <div v-else-if="selectedPaymentMethod === 'bank'" class="payment-section">
            <div class="bank-payment">
              <q-card class="bank-card lime-glow">
                <q-card-section class="text-h6 text-center text-lime">
                  <q-icon name="account_balance" class="q-mr-sm" />
                  Bank Transfer
                </q-card-section>
                
                <q-card-section>
                  <q-form @submit.prevent="processBankPayment" class="q-gutter-md">
                    <q-select
                      v-model="bankForm.bank"
                      :options="bankOptions"
                      label="Select Bank"
                      filled
                      dense
                      :rules="[val => !!val || 'Please select a bank']"
                    />
                    
                    <q-input
                      v-model="bankForm.accountNumber"
                      label="Account Number"
                      filled
                      dense
                      :rules="[val => !!val || 'Account number required']"
                    />
                    
                    <q-input
                      v-model="bankForm.accountName"
                      label="Account Holder Name"
                      filled
                      dense
                      :rules="[val => !!val || 'Account name required']"
                    />
                    
                    <q-btn
                      type="submit"
                      label="Initiate Transfer"
                      class="btn-gradient full-width q-mt-md"
                      :loading="processing"
                      :disable="!isBankFormValid"
                    />
                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Security and trust indicators -->
      <div class="trust-indicators">
        <div class="trust-item">
          <q-icon name="security" color="lime" size="24px" />
          <span>SSL Encrypted</span>
        </div>
        <div class="trust-item">
          <q-icon name="verified_user" color="lime" size="24px" />
          <span>PCI Compliant</span>
        </div>
        <div class="trust-item">
          <q-icon name="lock" color="lime" size="24px" />
          <span>Secure Payment</span>
        </div>
        <div class="trust-item">
          <q-icon name="support_agent" color="lime" size="24px" />
          <span>24/7 Support</span>
        </div>
      </div>
    </div>
    
    <!-- Payment processing overlay -->
    <PaymentLoader
      v-if="processing"
      :message="processingMessage"
      :steps="processingSteps"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify, Dialog } from 'quasar'
import api from '../../boot/axios'
import MerchantBranding from './MerchantBranding.vue'
import PaymentMethodSelector from './PaymentMethodSelector.vue'
import PaymentMethodCard from './PaymentMethodCard.vue'
import PaymentLoader from '../payments/PaymentLoader.vue'

const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(true)
const processing = ref(false)
const processingMessage = ref('')
const processingSteps = ref([])

const merchantInfo = ref(null)
const paymentDetails = ref({
  amount: 0,
  currency: 'USD',
  description: ''
})

const orderDetails = ref(null)
const selectedPaymentMethod = ref('card')
const availablePaymentMethods = ref([])

// Form data
const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvc: ''
})

const selectedWallet = ref(null)
const walletOptions = ref([
  { id: 'paypal', name: 'PayPal', icon: 'payments' },
  { id: 'apple', name: 'Apple Pay', icon: 'smartphone' },
  { id: 'google', name: 'Google Pay', icon: 'smartphone' },
  { id: 'amazon', name: 'Amazon Pay', icon: 'shopping_cart' }
])

const bankForm = ref({
  bank: null,
  accountNumber: '',
  accountName: ''
})

const bankOptions = ref([
  'Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'US Bank'
])

// Computed properties
const isBankFormValid = computed(() => {
  return bankForm.value.bank && 
         bankForm.value.accountNumber && 
         bankForm.value.accountName
})

// Methods
const onBrandingLoaded = (branding) => {
  merchantInfo.value = branding
}

const onPaymentMethodSelected = (method) => {
  selectedPaymentMethod.value = method
}

const onCardValidationChange = (validation) => {
  // Handle card validation changes
  console.log('Card validation:', validation)
}

const selectWallet = (walletId) => {
  selectedWallet.value = walletId
}

const getMerchantId = () => route.query.merchant || route.params.merchant || route.query.merchantId

const processCardPayment = async (cardData) => {
  await processPayment('card', { cardData })
}

const processWalletPayment = async () => {
  if (!selectedWallet.value) return
  await processPayment('wallet', { wallet: selectedWallet.value })
}

const processBankPayment = async () => {
  if (!isBankFormValid.value) return
  await processPayment('bank', { bankData: bankForm.value })
}

const processPayment = async (method, data) => {
  processing.value = true
  
  // Set processing message and steps based on method
  switch (method) {
    case 'card':
      processingMessage.value = 'Processing card payment...'
      processingSteps.value = [
        'Validating card details...',
        'Processing payment...',
        'Confirming transaction...'
      ]
      break
    case 'wallet':
      processingMessage.value = `Processing ${getWalletName(selectedWallet.value)} payment...`
      processingSteps.value = [
        'Connecting to wallet...',
        'Authorizing payment...',
        'Processing transaction...'
      ]
      break
    case 'bank':
      processingMessage.value = 'Initiating bank transfer...'
      processingSteps.value = [
        'Validating account details...',
        'Initiating transfer...',
        'Processing payment...'
      ]
      break
  }
  
  try {
    // Simulate API call
    const processingTime = method === 'bank' ? 4000 : method === 'wallet' ? 2500 : 3000
    await new Promise(resolve => setTimeout(resolve, processingTime))
    
    // Redirect to success page
    router.push({
      path: '/payment-status',
      query: {
        status: 'success',
        amount: paymentDetails.value.amount,
        method: method,
        merchantId: getMerchantId(),
        merchantName: merchantInfo.value?.name || 'Merchant',
        ...data
      }
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Payment failed. Please try again.',
      actions: [{ label: 'Retry', color: 'white', handler: () => processPayment(method, data) }],
    })
  } finally {
    processing.value = false
  }
}

const getWalletName = (walletId) => {
  const wallet = walletOptions.value.find(w => w.id === walletId)
  return wallet ? wallet.name : 'Wallet'
}

const goBack = () => {
  Dialog.create({
    title: 'Leave Checkout?',
    message: 'Are you sure you want to leave? Your payment details will be lost.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    // Go back to merchant site or previous page
    if (route.query.returnUrl) {
      window.location.href = route.query.returnUrl
    } else {
      router.go(-1)
    }
  })
}

const initializeCheckout = async () => {
  try {
    loading.value = true
    
    // Get checkout parameters from route
    const amount = route.query.amount || 99.99
    const merchantId = getMerchantId()
    const orderId = route.query.orderId
    
    paymentDetails.value.amount = parseFloat(amount)
    paymentDetails.value.description = route.query.description || 'Payment'
    
    // Set available payment methods
    availablePaymentMethods.value = [
      { id: 'card', name: 'Credit/Debit Card', icon: 'credit_card', available: true },
      { id: 'wallet', name: 'Digital Wallet', icon: 'account_balance_wallet', available: true },
      { id: 'bank', name: 'Bank Transfer', icon: 'account_balance', available: true }
    ]
    
    // Fetch merchant information
    if (merchantId) {
      try {
        const response = await api.get(`/merchants/${merchantId}`)
        merchantInfo.value = response.data
      } catch (error) {
        console.error('Failed to fetch merchant info:', error)
        // Use fallback merchant info
        merchantInfo.value = {
          name: 'Merchant',
          logo: 'https://placehold.co/48x48/121018/bdf000?text=M',
          primaryColor: '#bdf000'
        }
      }
    }
    
    // Fetch order details if orderId is provided
    if (orderId) {
      try {
        const response = await api.get(`/orders/${orderId}`)
        orderDetails.value = response.data
      } catch (error) {
        console.error('Failed to fetch order details:', error)
      }
    }
    
  } catch (error) {
    console.error('Failed to initialize checkout:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load checkout. Please refresh the page.'
    })
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  initializeCheckout()
})

onBeforeUnmount(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.checkout-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}

.loading-text {
  color: #bdf000;
  font-size: 1.1rem;
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  background: rgba(189, 240, 0, 0.1);
  border: 1px solid rgba(189, 240, 0, 3);
}

.header-text {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.page-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #ccc;
  opacity: 0.8;
}

.checkout-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
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
  background: #121212;
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.wallet-card, .bank-card {
  background: #121212;
  border-radius: 16px;
  overflow: hidden;
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(189, 240, 0, 0.2),
              0 0 20px rgba(189, 240, 0, 15);
}

.wallet-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.wallet-btn {
  background: #1a1a1a;
  border: 1px solid #333;
  color: #fff;
  transition: all 0.3s ease;
}

.wallet-btn:hover {
  border-color: #bdf000;
  background: #1f1f1f;
}

.wallet-selected {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
  color: #bdf000;
}

.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 5);
}
.checkout-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}

.loading-text {
  color: #bdf000;
  font-size: 1.1rem;
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  background: rgba(189, 240, 0, 0.1);
  border: 1px solid rgba(189, 240, 0, 3);
}

.header-text {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.page-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #ccc;
  opacity: 0.8;
}

.checkout-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
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
  background: #121212;
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.wallet-card, .bank-card {
  background: #121212;
  border-radius: 16px;
  overflow: hidden;
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(189, 240, 0, 0.2),
              0 0 20px rgba(189, 240, 0, 15);
}

.wallet-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.wallet-btn {
  background: #1a1a1a;
  border: 1px solid #333;
  color: #fff;
  transition: all 0.3s ease;
}

.wallet-btn:hover {
  border-color: #bdf000;
  background: #1f1f1f;
}

.wallet-selected {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
  color: #bdf000;
}

.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 5);
  border-radius: 8px;
}

.full-width {
  width: 100%;
}

.trust-indicators {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 24px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.9rem;
  text-align: center;
}

.text-lime {
  color: #bdf000;
}

/* Responsive design */
@media (max-width: 1024px) {
  .checkout-main {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 16px;
  }
  
  .checkout-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .trust-indicators {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .wallet-options {
    grid-template-columns: 1fr;
  }
}

/* Animation classes */
.back-btn {
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
  background: rgba(189, 240, 0, 0.2);
}

.wallet-btn, .bank-card {
  transition: all 0.3s ease;
}

.wallet-btn:hover, .bank-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.trust-item {
  transition: all 0.3s ease;
}

.trust-item:hover {
  transform: translateY(-4px);
  color: #bdf000;
}

/* Loading animation */
.loading-container {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
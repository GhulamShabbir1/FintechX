<template>
  <div class="hosted-checkout">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <q-spinner-dots size="50px" color="lime" />
        <div class="loading-text">Loading secure checkout...</div>
        <div class="loading-subtext">Preparing your payment environment</div>
      </div>
    </div>

    <!-- Checkout Form -->
    <div v-else-if="!paymentComplete" class="checkout-form-container">
      <!-- Merchant Header -->
      <div class="merchant-header">
        <div class="merchant-info">
          <q-avatar size="48px" square class="merchant-logo">
            <img :src="merchantData.logo_url || placeholderLogo" :alt="merchantData.business_name" />
          </q-avatar>
          <div class="merchant-details">
            <h2 class="merchant-name">{{ merchantData.business_name }}</h2>
            <p class="merchant-description">{{ merchantData.description || 'Secure Payment Portal' }}</p>
          </div>
        </div>
        <div class="security-badge">
          <q-icon name="security" color="green" />
          <span>SSL Secured</span>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="payment-summary">
        <div class="summary-header">
          <h3>Payment Summary</h3>
        </div>
        <div class="summary-content">
          <div class="summary-row">
            <span class="label">Amount:</span>
            <span class="value">{{ formatCurrency(amount) }}</span>
          </div>
          <div class="summary-row" v-if="description">
            <span class="label">Description:</span>
            <span class="value">{{ description }}</span>
          </div>
          <div class="summary-row" v-if="merchantData.currency">
            <span class="label">Currency:</span>
            <span class="value">{{ merchantData.currency.toUpperCase() }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <div class="payment-form">
        <h3>Payment Details</h3>
        
        <!-- Payment Method Selection -->
        <div class="payment-methods">
          <div class="method-tabs">
            <q-btn
              v-for="method in availableMethods"
              :key="method.id"
              :class="['method-tab', { active: selectedMethod === method.id }]"
              @click="selectedMethod = method.id"
              flat
              no-caps
            >
              <q-icon :name="method.icon" class="q-mr-sm" />
              {{ method.label }}
            </q-btn>
          </div>

          <!-- Card Payment Form -->
          <div v-if="selectedMethod === 'card'" class="method-form">
            <q-form @submit.prevent="processPayment" class="card-form">
              <div class="form-row">
                <div class="form-group full-width">
                  <label>Card Number</label>
                  <q-input
                    v-model="cardForm.number"
                    mask="#### #### #### ####"
                    placeholder="1234 5678 9012 3456"
                    outlined
                    dense
                    :error="!!errors.number"
                    :error-message="errors.number"
                    @input="validateCardNumber"
                  >
                    <template v-slot:append>
                      <q-icon :name="cardBrandIcon" :color="cardBrandColor" size="sm" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Cardholder Name</label>
                  <q-input
                    v-model="cardForm.name"
                    placeholder="John Doe"
                    outlined
                    dense
                    :error="!!errors.name"
                    :error-message="errors.name"
                    @input="validateCardName"
                  />
                </div>
                <div class="form-group">
                  <label>Expiry Date</label>
                  <q-input
                    v-model="cardForm.expiry"
                    mask="##/##"
                    placeholder="MM/YY"
                    outlined
                    dense
                    :error="!!errors.expiry"
                    :error-message="errors.expiry"
                    @input="validateExpiry"
                  />
                </div>
                <div class="form-group">
                  <label>CVC</label>
                  <q-input
                    v-model="cardForm.cvc"
                    mask="###"
                    placeholder="123"
                    outlined
                    dense
                    :error="!!errors.cvc"
                    :error-message="errors.cvc"
                    @input="validateCvc"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label>Billing Address</label>
                  <q-input
                    v-model="cardForm.address"
                    placeholder="123 Main St, City, State 12345"
                    outlined
                    dense
                    :error="!!errors.address"
                    :error-message="errors.address"
                  />
                </div>
              </div>

              <div class="form-actions">
                <q-btn
                  type="submit"
                  class="pay-button"
                  :loading="processing"
                  :disable="!isFormValid"
                  label="Pay Now"
                  size="lg"
                  no-caps
                />
              </div>
            </q-form>
          </div>

          <!-- Bank Transfer Form -->
          <div v-else-if="selectedMethod === 'bank'" class="method-form">
            <div class="bank-transfer-info">
              <q-icon name="account_balance" size="64px" color="lime" />
              <h4>Bank Transfer</h4>
              <p>Complete your payment using bank transfer</p>
              <q-btn
                color="lime"
                label="Get Bank Details"
                @click="getBankDetails"
                class="q-mt-md"
              />
            </div>
          </div>

          <!-- Wallet Payment -->
          <div v-else-if="selectedMethod === 'wallet'" class="method-form">
            <div class="wallet-options">
              <div 
                v-for="wallet in walletOptions" 
                :key="wallet.id"
                class="wallet-option"
                @click="selectWallet(wallet.id)"
              >
                <q-icon :name="wallet.icon" size="32px" :color="wallet.color" />
                <span>{{ wallet.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="security-notice">
        <div class="security-content">
          <q-icon name="security" color="green" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </div>
    </div>

    <!-- Payment Processing -->
    <div v-else-if="processing" class="processing-container">
      <div class="processing-content">
        <q-spinner-dots size="50px" color="lime" />
        <div class="processing-text">Processing your payment...</div>
        <div class="processing-subtext">Please wait while we secure your transaction</div>
        <div class="processing-progress">
          <q-linear-progress 
            :value="processingProgress" 
            color="lime" 
            size="md"
            class="q-mt-md"
          />
        </div>
      </div>
    </div>

    <!-- Payment Complete -->
    <div v-else class="payment-complete">
      <div class="complete-content">
        <q-icon name="check_circle" size="64px" color="green" />
        <h2>Payment Successful!</h2>
        <p>Your transaction has been processed successfully</p>
        <div class="transaction-details">
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
            <span class="value">{{ formatDate(new Date()) }}</span>
          </div>
        </div>
        <q-btn
          color="lime"
          label="Return to Merchant"
          @click="returnToMerchant"
          class="q-mt-lg"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <div class="error-content">
        <q-icon name="error" size="64px" color="red" />
        <h2>Payment Failed</h2>
        <p>{{ error }}</p>
        <q-btn
          color="lime"
          label="Try Again"
          @click="retryPayment"
          class="q-mt-lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePaymentsStore } from '../../store/payments'
import { Notify } from 'quasar'
import api from '../../boot/axios'

const route = useRoute()
const paymentsStore = usePaymentsStore()

// Props
const props = defineProps({
  merchantId: {
    type: String,
    required: true
  }
})

// Reactive data
const loading = ref(true)
const processing = ref(false)
const paymentComplete = ref(false)
const error = ref(null)
const merchantData = ref({})
const amount = ref(0)
const description = ref('')
const selectedMethod = ref('card')
const transactionId = ref('')
const processingProgress = ref(0)

// Form data
const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvc: '',
  address: ''
})

// Validation errors
const errors = ref({})

// Constants
const placeholderLogo = 'https://dummyimage.com/200x200/121018/bdf000.png&text=Logo'

// Available payment methods
const availableMethods = [
  { id: 'card', label: 'Credit/Debit Card', icon: 'credit_card' },
  { id: 'bank', label: 'Bank Transfer', icon: 'account_balance' },
  { id: 'wallet', label: 'Digital Wallet', icon: 'account_balance_wallet' }
]

const walletOptions = [
  { id: 'paypal', name: 'PayPal', icon: 'paypal', color: 'blue' },
  { id: 'apple', name: 'Apple Pay', icon: 'apple', color: 'black' },
  { id: 'google', name: 'Google Pay', icon: 'g_mobiledata', color: 'green' }
]

// Computed properties
const isFormValid = computed(() => {
  return cardForm.value.number && 
         cardForm.value.name && 
         cardForm.value.expiry && 
         cardForm.value.cvc && 
         cardForm.value.address &&
         Object.keys(errors.value).length === 0
})

const cardBrandIcon = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'credit_card'
  if (number.startsWith('5')) return 'credit_card'
  if (number.startsWith('3')) return 'credit_card'
  return 'credit_card'
})

const cardBrandColor = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'blue'
  if (number.startsWith('5')) return 'red'
  if (number.startsWith('3')) return 'green'
  return 'grey'
})

// Methods
const loadMerchantData = async () => {
  try {
    const response = await api.get(`/api/merchant/${props.merchantId}`)
    merchantData.value = response.data
    
    // Extract amount and description from query params or merchant data
    amount.value = parseInt(route.query.amount) || merchantData.value.default_amount || 1000
    description.value = route.query.description || merchantData.value.default_description || 'Payment'
    
  } catch (error) {
    console.error('Error loading merchant data:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load merchant information',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const validateCardNumber = () => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.length < 13 || number.length > 19) {
    errors.value.number = 'Invalid card number length'
  } else if (!/^\d+$/.test(number)) {
    errors.value.number = 'Card number must contain only digits'
  } else {
    delete errors.value.number
  }
}

const validateCardName = () => {
  if (cardForm.value.name.length < 2) {
    errors.value.name = 'Name must be at least 2 characters'
  } else {
    delete errors.value.name
  }
}

const validateExpiry = () => {
  const expiry = cardForm.value.expiry
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.value.expiry = 'Invalid expiry format (MM/YY)'
  } else {
    const [month, year] = expiry.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      errors.value.expiry = 'Invalid month'
    } else if (parseInt(year) < currentYear || 
               (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      errors.value.expiry = 'Card has expired'
    } else {
      delete errors.value.expiry
    }
  }
}

const validateCvc = () => {
  const cvc = cardForm.value.cvc
  if (!/^\d{3,4}$/.test(cvc)) {
    errors.value.cvc = 'CVC must be 3-4 digits'
  } else {
    delete errors.value.cvc
  }
}

const processPayment = async () => {
  if (!isFormValid.value) return
  
  try {
    processing.value = true
    error.value = null
    
    // Simulate processing progress
    const progressInterval = setInterval(() => {
      if (processingProgress.value < 90) {
        processingProgress.value += Math.random() * 20
      }
    }, 500)
    
    // Prepare payment data
    const paymentData = {
      merchant_id: props.merchantId,
      amount: amount.value,
      currency: merchantData.value.currency || 'usd',
      method: selectedMethod.value,
      customer: {
        name: cardForm.value.name,
        email: 'customer@example.com', // This should come from customer context
        phone: '+15555555555' // This should come from customer context
      },
      card: selectedMethod.value === 'card' ? {
        number: cardForm.value.number.replace(/\s/g, ''),
        exp_month: parseInt(cardForm.value.expiry.split('/')[0]),
        exp_year: 2000 + parseInt(cardForm.value.expiry.split('/')[1]),
        cvc: cardForm.value.cvc
      } : undefined,
      billing_address: cardForm.value.address,
      return_url_success: `${window.location.origin}/payment/success`,
      return_url_failure: `${window.location.origin}/payment/failure`
    }
    
    // Process payment
    const response = await paymentsStore.checkout(paymentData)
    
    clearInterval(progressInterval)
    processingProgress.value = 100
    
    // Wait a bit to show completion
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Handle success
    if (response.success) {
      transactionId.value = response.payment_id || 'TXN_' + Date.now()
      paymentComplete.value = true
      
      Notify.create({
        type: 'positive',
        message: 'Payment successful!',
        position: 'top'
      })
    } else {
      throw new Error(response.message || 'Payment failed')
    }
    
  } catch (error) {
    console.error('Payment error:', error)
    error.value = error.response?.data?.message || error.message || 'Payment failed. Please try again.'
    
    Notify.create({
      type: 'negative',
      message: error.value,
      position: 'top'
    })
  } finally {
    processing.value = false
  }
}

const selectWallet = (walletId) => {
  // Implement wallet payment logic
  console.log('Selected wallet:', walletId)
}

const getBankDetails = () => {
  // Implement bank transfer logic
  console.log('Getting bank details')
}

const retryPayment = () => {
  error.value = null
  paymentComplete.value = false
}

const returnToMerchant = () => {
  // Redirect to merchant's return URL or close checkout
  if (merchantData.value.return_url) {
    window.location.href = merchantData.value.return_url
  } else {
        window.close()
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount / 100)
    }

    const formatDate = (date) => {
      return date.toLocaleDateString()
    }

    // Lifecycle
    onMounted(() => {
      loadMerchantData()
    })

    // Watch for route changes
    watch(() => route.query, (newQuery) => {
      if (newQuery.amount) {
        amount.value = parseInt(newQuery.amount)
      }
      if (newQuery.description) {
        description.value = newQuery.description
      }
    })
  </script>

  <style scoped>
  .hosted-checkout {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
    color: #ffffff;
    padding: 24px;
  }

  /* Loading Container */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
  }

  .loading-content {
    text-align: center;
  }

  .loading-text {
    font-size: 1.5rem;
    margin: 24px 0 8px 0;
    color: #ffffff;
  }

  .loading-subtext {
    color: #cfcfcf;
    font-size: 1rem;
  }

  /* Checkout Form Container */
  .checkout-form-container {
    max-width: 800px;
    margin: 0 auto;
  }

  /* Merchant Header */
  .merchant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .merchant-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .merchant-logo {
    border: 2px solid rgba(189, 240, 0.3);
  }

  .merchant-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #bdf000;
  }

  .merchant-description {
    color: #cfcfcf;
    margin: 0;
  }

  .security-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4caf50;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Payment Summary */
  .payment-summary {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .summary-header h3 {
    margin: 0 0 16px 0;
    color: #bdf000;
  }

  .summary-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    color: #cfcfcf;
  }

  .value {
    font-weight: 600;
    color: #ffffff;
  }

  /* Payment Form */
  .payment-form {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .payment-form h3 {
    margin: 0 0 20px 0;
    color: #bdf000;
  }

  /* Payment Methods */
  .method-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .method-tab {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px 16px;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .method-tab:hover {
    background: rgba(189, 240, 0.1);
  }

  .method-tab.active {
    background: rgba(189, 240, 0.2);
    border-color: #bdf000;
    color: #bdf000;
  }

  /* Method Forms */
  .method-form {
    padding: 24px 0;
  }

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .form-group {
    flex: 1;
  }

  .form-group.full-width {
    flex: 1 1 100%;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #ffffff;
    font-weight: 500;
  }

  .form-group :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.05) !important;
    border-radius: 8px;
  }

  .form-group :deep(.q-field__native) {
    color: #ffffff !important;
  }

  .form-group :deep(.q-field__label) {
    color: #cfcfcf !important;
  }

  /* Form Actions */
  .form-actions {
    margin-top: 32px;
    text-align: center;
  }

  .pay-button {
    background: linear-gradient(135deg, #bdf000, #a0d000);
    color: #09050d;
    font-weight: 700;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 1.1rem;
    min-width: 200px;
  }

  .pay-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(189, 240, 0.3);
  }

  .pay-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Bank Transfer */
  .bank-transfer-info {
    text-align: center;
    padding: 48px 24px;
  }

  .bank-transfer-info h4 {
    margin: 16px 0 8px 0;
    color: #bdf000;
  }

  .bank-transfer-info p {
    color: #cfcfcf;
    margin-bottom: 24px;
  }

  /* Wallet Options */
  .wallet-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 0;
  }

  .wallet-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .wallet-option:hover {
    background: rgba(189, 240, 0.1);
    border-color: rgba(189, 240, 0.3);
  }

  .wallet-option span {
    color: #ffffff;
    font-weight: 500;
  }

  /* Security Notice */
  .security-notice {
    background: rgba(0, 255, 0, 0.1);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    border: 1px solid rgba(0, 255, 0, 0.2);
  }

  .security-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #4caf50;
    font-size: 0.875rem;
  }

  /* Processing Container */
  .processing-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
  }

  .processing-content {
    text-align: center;
  }

  .processing-text {
    font-size: 1.5rem;
    margin: 24px 0 8px 0;
    color: #ffffff;
  }

  .processing-subtext {
    color: #cfcfcf;
    font-size: 1rem;
    margin-bottom: 24px;
  }

  /* Payment Complete */
  .payment-complete {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
  }

  .complete-content {
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 48px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 500px;
  }

  .complete-content h2 {
    color: #4caf50;
    margin: 16px 0 8px 0;
  }

  .complete-content p {
    color: #cfcfcf;
    margin-bottom: 24px;
  }

  .transaction-details {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .detail-row:last-child {
    margin-bottom: 0;
  }

  .detail-row .label {
    color: #cfcfcf;
  }

  .detail-row .value {
    color: #ffffff;
    font-weight: 500;
  }

  /* Error Container */
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
  }

  .error-content {
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 48px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 500px;
  }

  .error-content h2 {
    color: #f44336;
    margin: 16px 0 8px 0;
  }

  .error-content p {
    color: #cfcfcf;
    margin-bottom: 24px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hosted-checkout {
      padding: 16px;
    }

    .merchant-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .form-row {
      flex-direction: column;
      gap: 12px;
    }

    .method-tabs {
      justify-content: center;
    }

    .pay-button {
      min-width: 100%;
    }
  }
  </style>
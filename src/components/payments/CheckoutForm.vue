<template>
  <div class="checkout-container">
    <q-card class="payment-card lime-glow">
      <!-- Header -->
      <q-card-section class="payment-header">
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="48px" class="merchant-avatar">
              <img :src="merchantInfo.logo || placeholderLogo" />
            </q-avatar>
          </div>
          <div class="col">
            <div class="text-h6 text-lime">{{ merchantInfo.business_name || 'FinteckX Store' }}</div>
            <div class="text-caption text-grey-5">Secure Payment Portal</div>
          </div>
          <div class="col-auto">
            <q-chip color="green" text-color="white" icon="security" size="sm" class="security-chip">
              SSL Secured
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <!-- Payment Amount -->
      <q-card-section class="payment-amount">
        <div class="text-center">
          <div class="amount-display">
            <span class="currency">{{ currency }}</span>
            <span class="amount">{{ formatAmount(amount) }}</span>
          </div>
          <div class="text-caption text-grey-6" v-if="description">{{ description }}</div>
        </div>
      </q-card-section>

      <!-- Payment Methods Tabs -->
      <q-card-section class="payment-methods">
        <q-tabs v-model="selectedMethod" class="payment-tabs" indicator-color="lime" align="justify">
          <q-tab name="card" icon="credit_card" label="Card" class="payment-tab" />
          <q-tab name="wallet" icon="account_balance_wallet" label="Wallet" class="payment-tab" />
          <q-tab name="bank" icon="account_balance" label="Bank" class="payment-tab" />
        </q-tabs>

        <q-separator class="q-my-md" />

        <!-- Card Payment Form -->
        <q-tab-panels v-model="selectedMethod" animated transition-prev="slide-right" transition-next="slide-left">
          <q-tab-panel name="card" class="q-pa-none">
            <q-form @submit.prevent="processPayment" class="card-form">
              <!-- Card Number -->
              <div class="form-group">
                <label class="field-label">Card Number</label>
                <div class="card-input-container">
                  <q-input
                    v-model="cardForm.number"
                    mask="#### #### #### ####"
                    placeholder="1234 5678 9012 3456"
                    outlined
                    dense
                    class="card-input"
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

              <!-- Card Holder Name -->
              <div class="form-group">
                <label class="field-label">Cardholder Name</label>
                <q-input
                  v-model="cardForm.name"
                  placeholder="John Doe"
                  outlined
                  dense
                  class="card-input"
                  :error="!!errors.name"
                  :error-message="errors.name"
                  @input="validateCardName"
                />
              </div>

              <!-- Expiry and CVC -->
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="form-group">
                    <label class="field-label">Expiry Date</label>
                    <q-input
                      v-model="cardForm.expiry"
                      mask="##/##"
                      placeholder="MM/YY"
                      outlined
                      dense
                      class="card-input"
                      :error="!!errors.expiry"
                      :error-message="errors.expiry"
                      @input="validateExpiry"
                    />
                  </div>
                </div>
                <div class="col-6">
                  <div class="form-group">
                    <label class="field-label">CVC</label>
                    <q-input
                      v-model="cardForm.cvc"
                      mask="###"
                      placeholder="123"
                      outlined
                      dense
                      class="card-input"
                      :error="!!errors.cvc"
                      :error-message="errors.cvc"
                      @input="validateCvc"
                    />
                  </div>
                </div>
              </div>

              <!-- Billing Address -->
              <div class="form-group">
                <label class="field-label">Billing Address</label>
                <q-input
                  v-model="cardForm.address"
                  placeholder="123 Main St, City, State 12345"
                  outlined
                  dense
                  class="card-input"
                  :error="!!errors.address"
                  :error-message="errors.address"
                />
              </div>

              <!-- Submit Button -->
              <div class="form-actions">
                <q-btn
                  type="submit"
                  class="submit-btn"
                  :loading="processing"
                  :disable="!isFormValid"
                  label="Pay Now"
                  size="lg"
                />
              </div>
            </q-form>
          </q-tab-panel>

          <!-- Wallet Payment -->
          <q-tab-panel name="wallet" class="q-pa-none">
            <div class="wallet-options">
              <div class="wallet-option" @click="selectWallet('paypal')">
                <q-icon name="paypal" size="32px" color="blue" />
                <span>PayPal</span>
              </div>
              <div class="wallet-option" @click="selectWallet('apple')">
                <q-icon name="apple" size="32px" color="black" />
                <span>Apple Pay</span>
              </div>
              <div class="wallet-option" @click="selectWallet('google')">
                <q-icon name="g_mobiledata" size="32px" color="green" />
                <span>Google Pay</span>
              </div>
            </div>
          </q-tab-panel>

          <!-- Bank Transfer -->
          <q-tab-panel name="bank" class="q-pa-none">
            <div class="bank-transfer-info">
              <div class="info-card">
                <q-icon name="account_balance" size="48px" color="lime" />
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
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- Security Notice -->
      <q-card-section class="security-notice">
        <div class="security-content">
          <q-icon name="security" color="green" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </q-card-section>
    </q-card>

    <!-- Processing Modal -->
    <q-dialog v-model="showProcessing" persistent>
      <q-card class="processing-card">
        <q-card-section class="text-center">
          <q-spinner-dots color="lime" size="50px" />
          <div class="text-h6 q-mt-md">Processing Payment</div>
          <div class="text-subtitle2 q-mt-sm">Please wait while we secure your transaction...</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentsStore } from '../../store/payments'
import { Notify } from 'quasar'
import api from '../../boot/axios'

const router = useRouter()
const payments = usePaymentsStore()

// Props
const props = defineProps({
  merchantId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: '$'
  },
  description: {
    type: String,
    default: ''
  }
})

// Reactive data
const selectedMethod = ref('card')
const processing = ref(false)
const showProcessing = ref(false)
const merchantInfo = ref({})
const placeholderLogo = 'https://dummyimage.com/200x200/121018/bdf000.png&text=Logo'

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
const loadMerchantInfo = async () => {
  try {
    const response = await api.get(`/api/merchant/${props.merchantId}`)
    merchantInfo.value = response.data
  } catch (error) {
    console.error('Error loading merchant info:', error)
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
    showProcessing.value = true
    
    // Prepare payment data
    const paymentData = {
      merchant_id: props.merchantId,
      amount: props.amount,
      currency: props.currency.toLowerCase(),
      method: 'card',
      customer: {
        name: cardForm.value.name,
        email: 'customer@example.com', // This should come from customer context
        phone: '+15555555555' // This should come from customer context
      },
      card: {
        number: cardForm.value.number.replace(/\s/g, ''),
        exp_month: parseInt(cardForm.value.expiry.split('/')[0]),
        exp_year: 2000 + parseInt(cardForm.value.expiry.split('/')[1]),
        cvc: cardForm.value.cvc
      },
      billing_address: cardForm.value.address,
      return_url_success: `${window.location.origin}/payment/success`,
      return_url_failure: `${window.location.origin}/payment/failure`
    }
    
    // Process payment
    const response = await payments.checkout(paymentData)
    
    // Handle success
    if (response.success) {
      Notify.create({
        type: 'positive',
        message: 'Payment successful!',
        position: 'top'
      })
      
      // Redirect to success page
      router.push({
        name: 'payment-status',
        params: { id: response.payment_id },
        query: { status: 'success' }
      })
    } else {
      throw new Error(response.message || 'Payment failed')
    }
    
  } catch (error) {
    console.error('Payment error:', error)
    Notify.create({
      type: 'negative',
      message: error.message || 'Payment failed. Please try again.',
      position: 'top'
    })
  } finally {
    processing.value = false
    showProcessing.value = false
  }
}

const selectWallet = (wallet) => {
  // Implement wallet payment logic
  console.log('Selected wallet:', wallet)
}

const getBankDetails = () => {
  // Implement bank transfer logic
  console.log('Getting bank details')
}

const formatAmount = (amount) => {
  return (amount / 100).toFixed(2)
}

// Lifecycle
onMounted(() => {
  loadMerchantInfo()
})
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.payment-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0.2);
  backdrop-filter: blur(10px);
}

.lime-glow {
  box-shadow: 0 0 30px rgba(189, 240, 0.3);
}

/* Header */
.payment-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 24px;
}

.merchant-avatar {
  border: 2px solid rgba(189, 240, 0.3);
}

.security-chip {
  font-size: 0.75rem;
}

/* Amount Display */
.payment-amount {
  text-align: center;
  padding: 32px 24px;
}

.amount-display {
  margin-bottom: 8px;
}

.currency {
  font-size: 1.5rem;
  color: #cfcfcf;
  margin-right: 8px;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: #bdf000;
}

/* Payment Methods */
.payment-methods {
  padding: 0 24px 24px;
}

.payment-tabs {
  color: #cfcfcf;
}

.payment-tab {
  color: #cfcfcf;
}

/* Form Styles */
.card-form {
  padding: 24px 0;
}

.form-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 500;
}

.card-input {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.card-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
}

.card-input :deep(.q-field__native) {
  color: #ffffff !important;
}

.card-input :deep(.q-field__label) {
  color: #cfcfcf !important;
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

/* Bank Transfer */
.bank-transfer-info {
  padding: 24px 0;
}

.info-card {
  text-align: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card h4 {
  color: #ffffff;
  margin: 16px 0 8px 0;
}

.info-card p {
  color: #cfcfcf;
  margin-bottom: 16px;
}

/* Form Actions */
.form-actions {
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #09050d;
  font-weight: 700;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(189, 240, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Security Notice */
.security-notice {
  background: rgba(0, 255, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.security-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4caf50;
  font-size: 0.875rem;
}

/* Processing Modal */
.processing-card {
  background: rgba(10, 10, 10, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0.2);
  min-width: 300px;
}

/* Responsive */
@media (max-width: 768px) {
  .checkout-container {
    margin: 16px;
  }
  
  .amount {
    font-size: 2.5rem;
  }
  
  .payment-header .row {
    flex-direction: column;
    text-align: center;
  }
}
</style>
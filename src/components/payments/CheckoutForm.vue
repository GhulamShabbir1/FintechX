<template>
  <div class="checkout-container">
    <q-card class="payment-card lime-glow">
      <!-- Header -->
      <q-card-section class="payment-header">
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="48px" class="merchant-avatar">
              <img :src="merchantInfo.logo || placeholderLogo" @error="handleImageError" />
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
          <div v-if="processingFee > 0" class="processing-fee text-caption text-grey-6">
            Processing fee: {{ currency }}{{ processingFee }}
          </div>
        </div>
      </q-card-section>

      <!-- Customer Information -->
      <q-card-section class="customer-info" v-if="showCustomerInfo">
        <div class="section-title">Customer Information</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="customerForm.email"
              label="Email Address"
              type="email"
              outlined
              dense
              :error="!!errors.email"
              :error-message="errors.email"
              @blur="validateEmail"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="customerForm.name"
              label="Full Name"
              outlined
              dense
              :error="!!errors.name"
              :error-message="errors.name"
              @blur="validateName"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Payment Methods Tabs -->
      <q-card-section class="payment-methods">
        <div class="section-title">Payment Method</div>
        <q-tabs v-model="selectedMethod" class="payment-tabs" indicator-color="lime" align="justify">
          <q-tab 
            v-for="method in availablePaymentMethods" 
            :key="method.id"
            :name="method.id" 
            :icon="method.icon" 
            :label="method.label" 
            class="payment-tab"
            :disabled="!method.enabled"
          />
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
                    @blur="validateCardNumber"
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
                  @blur="validateCardName"
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
                      @blur="validateExpiry"
                    />
                  </div>
                </div>
                <div class="col-6">
                  <div class="form-group">
                    <label class="field-label">CVC/CVV</label>
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
                      @blur="validateCvc"
                    />
                  </div>
                </div>
              </div>

              <!-- Billing Address -->
              <div class="form-group" v-if="showBillingAddress">
                <label class="field-label">Billing Address</label>
                <q-input
                  v-model="cardForm.billingAddress"
                  placeholder="123 Main St, City, State, ZIP"
                  outlined
                  dense
                  class="card-input"
                  :error="!!errors.billingAddress"
                  :error-message="errors.billingAddress"
                />
              </div>

              <!-- Save Card Option -->
              <div class="form-group" v-if="showSaveCard">
                <q-checkbox
                  v-model="cardForm.saveCard"
                  label="Save this card for future payments"
                  color="lime"
                />
              </div>
            </q-form>
          </q-tab-panel>

          <!-- Digital Wallet Payment -->
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
              <div class="info-item">
                <q-icon name="info" color="lime" size="20px" />
                <span>Bank transfers may take 1-3 business days to process</span>
              </div>
              <q-btn
                label="Continue with Bank Transfer"
                color="lime"
                class="full-width q-mt-md"
                @click="initiateBankTransfer"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- Terms and Conditions -->
      <q-card-section class="terms-section">
        <q-checkbox
          v-model="termsAccepted"
          label="I agree to the terms and conditions"
          color="lime"
          :error="!!errors.terms"
          :error-message="errors.terms"
        />
        <div class="terms-links">
          <a href="#" @click.prevent="showTerms">Terms of Service</a>
          <span class="separator">|</span>
          <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
        </div>
      </q-card-section>

      <!-- Payment Button -->
      <q-card-section class="payment-action">
        <q-btn
          :label="paymentButtonLabel"
          :color="paymentButtonColor"
          :loading="processing"
          :disabled="!canProcessPayment"
          class="payment-button full-width"
          size="lg"
          @click="processPayment"
        />
        
        <div v-if="processing" class="processing-info q-mt-sm">
          <q-spinner-dots size="16px" color="lime" />
          <span class="q-ml-sm">Processing your payment...</span>
        </div>
      </q-card-section>

      <!-- Error Display -->
      <q-card-section v-if="hasErrors" class="error-section">
        <q-banner class="error-banner" color="negative">
          <template v-slot:avatar>
            <q-icon name="error" color="white" />
          </template>
          <div class="error-messages">
            <div v-for="(error, field) in errors" :key="field" class="error-message">
              {{ error }}
            </div>
          </div>
        </q-banner>
      </q-card-section>
    </q-card>

    <!-- Terms Modal -->
    <q-dialog v-model="showTermsModal">
      <q-card class="terms-modal">
        <q-card-section>
          <div class="text-h6">Terms of Service</div>
        </q-card-section>
        <q-card-section>
          <div class="terms-content">
            <!-- Terms content here -->
            <p>By using this payment service, you agree to our terms of service...</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Privacy Modal -->
    <q-dialog v-model="showPrivacyModal">
      <q-card class="privacy-modal">
        <q-card-section>
          <div class="text-h6">Privacy Policy</div>
        </q-card-section>
        <q-card-section>
          <div class="privacy-content">
            <!-- Privacy content here -->
            <p>We are committed to protecting your privacy...</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'

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
  merchantName: {
    type: String,
    default: ''
  },
  merchantLogo: {
    type: String,
    default: ''
  },
  paymentMethods: {
    type: Array,
    default: () => []
  },
  customerInfo: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits([
  'payment-success',
  'payment-failed',
  'payment-processing',
  'validation-error'
])

// Quasar
const $q = useQuasar()

// Reactive data
const processing = ref(false)
const selectedMethod = ref('card')
const termsAccepted = ref(false)
const showTermsModal = ref(false)
const showPrivacyModal = ref(false)

// Form data
const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvc: '',
  billingAddress: '',
  saveCard: false
})

const customerForm = ref({
  email: props.customerInfo.email || '',
  name: props.customerInfo.name || ''
})

// Validation errors
const errors = ref({})

// Configuration
const showCustomerInfo = ref(true)
const showBillingAddress = ref(true)
const showSaveCard = ref(true)

// Computed
const merchantInfo = computed(() => ({
  business_name: props.merchantName,
  logo: props.merchantLogo
}))

const availablePaymentMethods = computed(() => {
  if (props.paymentMethods.length > 0) {
    return props.paymentMethods
  }
  
  // Default payment methods
  return [
    { id: 'card', label: 'Card', icon: 'credit_card', enabled: true },
    { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', enabled: true },
    { id: 'bank', label: 'Bank', icon: 'account_balance', enabled: true }
  ]
})

const placeholderLogo = computed(() => {
  return 'https://placehold.co/80x80/121018/bdf000?text=M'
})

const processingFee = computed(() => {
  // Calculate processing fee based on amount and payment method
  const amount = Number(props.amount)
  if (amount <= 0) return 0
  
  if (selectedMethod.value === 'card') {
    return Math.max(0.30, amount * 0.029) // 2.9% + $0.30
  } else if (selectedMethod.value === 'wallet') {
    return amount * 0.025 // 2.5%
  } else {
    return amount * 0.01 // 1%
  }
})

const cardBrandIcon = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'credit_card'
  if (number.startsWith('5')) return 'credit_card'
  if (number.startsWith('34') || number.startsWith('37')) return 'credit_card'
  if (number.startsWith('6')) return 'credit_card'
  return 'credit_card'
})

const cardBrandColor = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'blue'
  if (number.startsWith('5')) return 'green'
  if (number.startsWith('34') || number.startsWith('37')) return 'red'
  if (number.startsWith('6')) return 'orange'
  return 'grey'
})

const paymentButtonLabel = computed(() => {
  if (processing.value) return 'Processing...'
  return `Pay ${props.currency}${formatAmount(Number(props.amount) + processingFee.value)}`
})

const paymentButtonColor = computed(() => {
  if (processing.value) return 'grey'
  return canProcessPayment.value ? 'lime' : 'grey'
})

const canProcessPayment = computed(() => {
  return termsAccepted.value && 
         !hasErrors.value && 
         isFormValid.value &&
         !processing.value
})

const hasErrors = computed(() => {
  return Object.keys(errors.value).length > 0
})

const isFormValid = computed(() => {
  if (selectedMethod.value === 'card') {
    return cardForm.value.number && 
           cardForm.value.name && 
           cardForm.value.expiry && 
           cardForm.value.cvc
  }
  return true
})

// Methods
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2)
}

const handleImageError = (event) => {
  event.target.src = placeholderLogo.value
}

const validateCardNumber = () => {
  const number = cardForm.value.number.replace(/\s/g, '')
  
  if (!number) {
    errors.value.number = 'Card number is required'
    return false
  }
  
  if (number.length < 13 || number.length > 19) {
    errors.value.number = 'Card number must be 13-19 digits'
    return false
  }
  
  // Luhn algorithm validation
  if (!isValidLuhn(number)) {
    errors.value.number = 'Invalid card number'
    return false
  }
  
  delete errors.value.number
  return true
}

const validateCardName = () => {
  const name = cardForm.value.name.trim()
  
  if (!name) {
    errors.value.name = 'Cardholder name is required'
    return false
  }
  
  if (name.length < 2) {
    errors.value.name = 'Name must be at least 2 characters'
    return false
  }
  
  delete errors.value.name
  return true
}

const validateExpiry = () => {
  const expiry = cardForm.value.expiry
  
  if (!expiry) {
    errors.value.expiry = 'Expiry date is required'
    return false
  }
  
  const [month, year] = expiry.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  if (month < 1 || month > 12) {
    errors.value.expiry = 'Invalid month'
    return false
  }
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    errors.value.expiry = 'Card has expired'
    return false
  }
  
  delete errors.value.expiry
  return true
}

const validateCvc = () => {
  const cvc = cardForm.value.cvc
  
  if (!cvc) {
    errors.value.cvc = 'CVC is required'
    return false
  }
  
  if (cvc.length < 3 || cvc.length > 4) {
    errors.value.cvc = 'CVC must be 3-4 digits'
    return false
  }
  
  delete errors.value.cvc
  return true
}

const validateEmail = () => {
  const email = customerForm.value.email.trim()
  
  if (!email) {
    errors.value.email = 'Email is required'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.value.email = 'Invalid email format'
    return false
  }
  
  delete errors.value.email
  return true
}

const validateName = () => {
  const name = customerForm.value.name.trim()
  
  if (!name) {
    errors.value.name = 'Name is required'
    return false
  }
  
  if (name.length < 2) {
    errors.value.name = 'Name must be at least 2 characters'
    return false
  }
  
  delete errors.value.name
  return false
}

const isValidLuhn = (number) => {
  let sum = 0
  let isEven = false
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

const validateForm = () => {
  const validations = []
  
  if (selectedMethod.value === 'card') {
    validations.push(
      validateCardNumber(),
      validateCardName(),
      validateExpiry(),
      validateCvc()
    )
  }
  
  if (showCustomerInfo.value) {
    validations.push(
      validateEmail(),
      validateName()
    )
  }
  
  return validations.every(Boolean)
}

const processPayment = async () => {
  if (!validateForm()) {
    emit('validation-error', errors.value)
    return
  }
  
  if (!termsAccepted.value) {
    errors.value.terms = 'You must accept the terms and conditions'
    emit('validation-error', errors.value)
    return
  }
  
  processing.value = true
  emit('payment-processing')
  
  try {
    const paymentData = {
      merchantId: props.merchantId,
      amount: Number(props.amount),
      currency: props.currency,
      description: props.description,
      paymentMethod: selectedMethod.value,
      customer: customerForm.value,
      metadata: {
        source: 'hosted_checkout',
        timestamp: new Date().toISOString()
      }
    }
    
    if (selectedMethod.value === 'card') {
      paymentData.card = {
        number: cardForm.value.number.replace(/\s/g, ''),
        name: cardForm.value.name,
        expiry: cardForm.value.expiry,
        cvc: cardForm.value.cvc,
        billingAddress: cardForm.value.billingAddress,
        saveCard: cardForm.value.saveCard
      }
    }
    
    const response = await api.post('/api/payments/checkout', paymentData)
    
    if (response.data.status === 'success') {
      emit('payment-success', response.data.transaction)
    } else {
      emit('payment-failed', {
        message: response.data.message || 'Payment failed',
        code: response.data.code
      })
    }
    
  } catch (error) {
    console.error('Payment processing error:', error)
    
    const errorMessage = error.response?.data?.message || 'Payment processing failed'
    emit('payment-failed', {
      message: errorMessage,
      code: error.response?.data?.code || 'PROCESSING_ERROR'
    })
  } finally {
    processing.value = false
  }
}

const selectWallet = (walletType) => {
  // Handle wallet selection
  $q.notify({
    type: 'info',
    message: `${walletType} integration coming soon`,
    position: 'top'
  })
}

const initiateBankTransfer = () => {
  // Handle bank transfer initiation
  $q.notify({
    type: 'info',
    message: 'Bank transfer feature coming soon',
    position: 'top'
  })
}

const showTerms = () => {
  showTermsModal.value = true
}

const showPrivacy = () => {
  showPrivacyModal.value = true
}

// Watchers
watch(() => props.customerInfo, (newInfo) => {
  if (newInfo.email) customerForm.value.email = newInfo.email
  if (newInfo.name) customerForm.value.name = newInfo.name
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Initialize with customer info if provided
  if (props.customerInfo.email) {
    customerForm.value.email = props.customerInfo.email
  }
  if (props.customerInfo.name) {
    customerForm.value.name = props.customerInfo.name
  }
})
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: 0 auto;
}

.payment-card {
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(189, 240, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

.lime-glow {
  box-shadow: 0 0 30px rgba(189, 240, 0.1);
}

.payment-header {
  background: linear-gradient(135deg, rgba(189, 240, 0.1), rgba(189, 240, 0.05));
  border-bottom: 1px solid rgba(189, 240, 0.1);
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

.customer-info {
  border-bottom: 1px solid rgba(189, 240, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.payment-methods {
  border-bottom: 1px solid rgba(189, 240, 0.1);
}

.payment-tabs {
  color: #9e9e9e;
}

.payment-tab {
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.card-input {
  background: rgba(255, 255, 255, 0.05);
}

.card-input-container {
  position: relative;
}

.wallet-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 20px 0;
}

.wallet-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 1px solid rgba(189, 240, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ffffff;
}

.wallet-option:hover {
  border-color: rgba(189, 240, 0.4);
  background: rgba(189, 240, 0.05);
  transform: translateY(-2px);
}

.bank-transfer-info {
  padding: 20px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #9e9e9e;
  margin-bottom: 16px;
}

.terms-section {
  border-bottom: 1px solid rgba(189, 240, 0.1);
}

.terms-links {
  margin-top: 12px;
  text-align: center;
}

.terms-links a {
  color: #bdf000;
  text-decoration: none;
  font-size: 12px;
}

.terms-links a:hover {
  text-decoration: underline;
}

.separator {
  color: #9e9e9e;
  margin: 0 8px;
}

.payment-action {
  background: rgba(189, 240, 0.05);
}

.payment-button {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
}

.processing-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
  font-size: 14px;
}

.error-section {
  border-top: 1px solid rgba(244, 67, 54, 0.2);
}

.error-banner {
  border-radius: 8px;
}

.error-messages {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-message {
  font-size: 14px;
}

.terms-modal,
.privacy-modal {
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  min-width: 500px;
  max-width: 600px;
}

.terms-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  color: #ffffff;
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .checkout-container {
    max-width: 100%;
    padding: 0 16px;
  }
  
  .payment-card {
    border-radius: 16px;
  }
  
  .amount {
    font-size: 36px;
  }
  
  .wallet-options {
    grid-template-columns: 1fr;
  }
  
  .terms-modal,
  .privacy-modal {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .payment-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .amount {
    font-size: 32px;
  }
  
  .payment-button {
    height: 48px;
    font-size: 16px;
  }
}
</style>
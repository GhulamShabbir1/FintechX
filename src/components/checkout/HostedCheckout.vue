<template>
  <div class="hosted-checkout">
    <!-- Header with merchant branding -->
    <MerchantBranding 
      :merchant="merchantInfo" 
      :amount="paymentAmount"
      @branding-loaded="onBrandingLoaded"
    />
    
    <!-- Payment method selector -->
    <PaymentMethodSelector 
      v-model="selectedMethod"
      :methods="availableMethods"
      @method-selected="onMethodSelected"
    />
    
    <!-- Payment form based on selected method -->
    <div class="payment-form-container">
      <!-- Card Payment Form -->
      <div v-if="selectedMethod === 'card'" class="payment-form">
        <q-card class="payment-card lime-glow">
          <q-card-section class="text-h6 text-center text-lime">
            <q-icon name="credit_card" class="q-mr-sm" />
            Card Payment
          </q-card-section>
          
          <q-card-section>
            <q-form @submit.prevent="processCardPayment" class="q-gutter-md">
              <!-- Card Number -->
              <q-input
                v-model="cardForm.number"
                label="Card Number"
                mask="#### #### #### ####"
                filled
                dense
                :rules="[val => !!val || 'Card number is required']"
                @input="detectCardBrand"
              >
                <template v-slot:prepend>
                  <q-icon :name="cardBrandIcon" :color="cardBrandColor" />
                </template>
              </q-input>
              
              <!-- Cardholder Name -->
              <q-input
                v-model="cardForm.name"
                label="Cardholder Name"
                filled
                dense
                :rules="[val => !!val || 'Name is required']"
              />
              
              <!-- Expiry and CVC -->
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model="cardForm.expiry"
                    label="MM/YY"
                    mask="##/##"
                    filled
                    dense
                    :rules="[val => !!val || 'Expiry required', val => validateExpiry(val) || 'Invalid expiry']"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="cardForm.cvc"
                    label="CVC"
                    mask="###"
                    filled
                    dense
                    :rules="[val => !!val || 'CVC required', val => val.length === 3 || 'Invalid CVC']"
                  />
                </div>
              </div>
              
              <!-- Submit Button -->
              <q-btn
                type="submit"
                label="Pay Now"
                class="btn-gradient full-width q-mt-md"
                :loading="processing"
                :disable="!isCardFormValid"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Digital Wallet Form -->
      <div v-if="selectedMethod === 'wallet'" class="payment-form">
        <q-card class="payment-card lime-glow">
          <q-card-section class="text-h6 text-center text-lime">
            <q-icon name="account_balance_wallet" class="q-mr-sm" />
            Digital Wallet
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
      
      <!-- Bank Transfer Form -->
      <div v-if="selectedMethod === 'bank'" class="payment-form">
        <q-card class="payment-card lime-glow">
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
    
    <!-- Security indicators -->
    <div class="security-indicators">
      <div class="security-item">
        <q-icon name="security" color="lime" />
        <span>SSL Encrypted</span>
      </div>
      <div class="security-item">
        <q-icon name="verified_user" color="lime" />
        <span>PCI Compliant</span>
      </div>
      <div class="security-item">
        <q-icon name="lock" color="lime" />
        <span>Secure Payment</span>
      </div>
    </div>
    
    <!-- Payment loader -->
    <PaymentLoader
      v-if="processing"
      :message="processingMessage"
      :steps="processingSteps"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import api from '../../boot/axios'
import MerchantBranding from './MerchantBranding.vue'
import PaymentMethodSelector from './PaymentMethodSelector.vue'
import PaymentLoader from '../payments/PaymentLoader.vue'

const route = useRoute()
const router = useRouter()

// Props and reactive data
const merchantInfo = ref(null)
const paymentAmount = ref(0)
const selectedMethod = ref('card')
const processing = ref(false)
const processingMessage = ref('')
const processingSteps = ref([])

// Card form
const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvc: ''
})

// Wallet form
const selectedWallet = ref(null)
const walletOptions = ref([
  { id: 'paypal', name: 'PayPal', icon: 'payments' },
  { id: 'apple', name: 'Apple Pay', icon: 'smartphone' },
  { id: 'google', name: 'Google Pay', icon: 'smartphone' },
  { id: 'amazon', name: 'Amazon Pay', icon: 'shopping_cart' }
])

// Bank form
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

// Available payment methods
const availableMethods = ref([
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit_card', available: true },
  { id: 'wallet', name: 'Digital Wallet', icon: 'account_balance_wallet', available: true },
  { id: 'bank', name: 'Bank Transfer', icon: 'account_balance', available: true }
])

// Computed properties
const isCardFormValid = computed(() => {
  return cardForm.value.number && 
         cardForm.value.name && 
         cardForm.value.expiry && 
         cardForm.value.cvc &&
         validateExpiry(cardForm.value.expiry)
})

const isBankFormValid = computed(() => {
  return bankForm.value.bank && 
         bankForm.value.accountNumber && 
         bankForm.value.accountName
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
const onBrandingLoaded = (branding) => {
  merchantInfo.value = branding
}

const onMethodSelected = (method) => {
  selectedMethod.value = method
}

const detectCardBrand = () => {
  // Card brand detection logic
}

const validateExpiry = (expiry) => {
  if (!expiry || expiry.length !== 5) return false
  const [month, year] = expiry.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  const expMonth = parseInt(month)
  const expYear = parseInt(year)
  
  if (expMonth < 1 || expMonth > 12) return false
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false
  
  return true
}

const selectWallet = (walletId) => {
  selectedWallet.value = walletId
}

const processCardPayment = async () => {
  if (!isCardFormValid.value) return
  
  processing.value = true
  processingMessage.value = 'Processing card payment...'
  processingSteps.value = [
    'Validating card details...',
    'Processing payment...',
    'Confirming transaction...'
  ]
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Redirect to success page
    router.push({
      path: '/payment-status',
      query: {
        status: 'success',
        amount: paymentAmount.value,
        method: 'card',
        merchant: merchantInfo.value?.name || 'Merchant'
      }
    })
  } catch{
    Notify.create({
      type: 'negative',
      message: 'Payment failed. Please try again.',
        actions: [{ label: 'Retry', color: 'white', handler: () => processCardPayment() }]
    })
  } finally {
    processing.value = false
  }
}

const processWalletPayment = async () => {
  if (!selectedWallet.value) return
  
  processing.value = true
  processingMessage.value = `Processing ${getWalletName(selectedWallet.value)} payment...`
  processingSteps.value = [
    'Connecting to wallet...',
    'Authorizing payment...',
    'Processing transaction...'
  ]
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    router.push({
      path: '/payment-status',
      query: {
        status: 'success',
        amount: paymentAmount.value,
        method: 'wallet',
        wallet: selectedWallet.value,
        merchant: merchantInfo.value?.name || 'Merchant'
      }
    })
  } catch{
    Notify.create({
      type: 'negative',
      message: 'Payment failed. Please try again.',
        actions: [{ label: 'Retry', color: 'white', handler: () => processWalletPayment() }]
    })
  } finally {
    processing.value = false
  }
}

const processBankPayment = async () => {
  if (!isBankFormValid.value) return
  
  processing.value = true
  processingMessage.value = 'Initiating bank transfer...'
  processingSteps.value = [
    'Validating account details...',
    'Initiating transfer...',
    'Processing payment...'
  ]
  
  try {
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    router.push({
      path: '/payment-status',
      query: {
        status: 'success',
        amount: paymentAmount.value,
        method: 'bank',
        bank: bankForm.value.bank,
        merchant: merchantInfo.value?.name || 'Merchant'
      }
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Transfer failed. Please try again.'
    })
  } finally {
    processing.value = false
  }
}

const getWalletName = (walletId) => {
  const wallet = walletOptions.value.find(w => w.id === walletId)
  return wallet ? wallet.name : 'Wallet'
}

// Initialize
onMounted(async () => {
  try {
    // Get payment details from route or query params
    const amount = route.query.amount || 99.99
    const merchantId = route.query.merchant || route.params.merchant
    
    paymentAmount.value = parseFloat(amount)
    
    // Fetch merchant info
    if (merchantId) {
      const response = await api.get(`/merchants/${merchantId}`)
      merchantInfo.value = response.data
    }
  } catch (error) {
    console.error('Failed to initialize checkout:', error)
  }
})
</script>

<style scoped>
.hosted-checkout {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #0a0a0a;
  min-height: 100vh;
}

.payment-form-container {
  margin: 24px 0;
}

.payment-form {
  margin-bottom: 24px;
}

.payment-card {
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

.full-width {
  width: 100%;
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

.security-indicators {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 32px;
  padding: 16px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.security-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.9rem;
}

.text-lime {
  color: #bdf000;
}

/* Responsive design */
@media (max-width: 768px) {
  .hosted-checkout {
    padding: 16px;
  }
  
  .wallet-options {
    grid-template-columns: 1fr;
  }
  
  .security-indicators {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
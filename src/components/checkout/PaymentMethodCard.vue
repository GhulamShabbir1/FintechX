<template>
  <div class="payment-method-card">
    <div class="card-preview">
      <div class="card-front" :class="{ 'card-focused': focusedField === 'number' }">
        <div class="card-header">
          <div class="card-brand">
            <q-icon :name="cardBrandIcon" :color="cardBrandColor" size="32px" />
            <span class="brand-name">{{ cardBrandName }}</span>
          </div>
          <div class="card-chip">
            <div class="chip-inner"></div>
          </div>
        </div>
        
        <div class="card-number">
          <span v-for="(digit, index) in maskedNumber" :key="index" class="digit">
            {{ digit }}
          </span>
        </div>
        
        <div class="card-footer">
          <div class="card-holder">
            <div class="label">CARD HOLDER</div>
            <div class="value">{{ cardForm.name || 'YOUR NAME' }}</div>
          </div>
          <div class="card-expiry">
            <div class="label">EXPIRES</div>
            <div class="value">{{ cardForm.expiry || 'MM/YY' }}</div>
          </div>
        </div>
      </div>
      
      <div class="card-back" :class="{ 'card-focused': focusedField === 'cvc' }">
        <div class="card-stripe"></div>
        <div class="card-signature">
          <div class="signature-line"></div>
          <div class="cvc-section">
            <div class="cvc-label">CVC</div>
            <div class="cvc-value">{{ cardForm.cvc || '123' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-form">
      <q-form @submit.prevent="validateAndSubmit" class="q-gutter-md">
        <!-- Card Number -->
        <div class="form-group">
          <label class="form-label">Card Number</label>
          <q-input
            v-model="cardForm.number"
            mask="#### #### #### ####"
            placeholder="1234 5678 9012 3456"
            filled
            dense
            :rules="[val => !!val || 'Card number is required', validateCardNumber]"
            @focus="focusedField = 'number'"
            @blur="focusedField = null"
            @input="onCardNumberInput"
          >
            <template v-slot:prepend>
              <q-icon :name="cardBrandIcon" :color="cardBrandColor" />
            </template>
            <template v-slot:append>
              <q-icon 
                v-if="cardValidation.number" 
                :name="cardValidation.number.valid ? 'check_circle' : 'error'"
                :color="cardValidation.number.valid ? 'positive' : 'negative'"
              />
            </template>
          </q-input>
          <div v-if="cardValidation.number && !cardValidation.number.valid" class="error-message">
            {{ cardValidation.number.message }}
          </div>
        </div>
        
        <!-- Cardholder Name -->
        <div class="form-group">
          <label class="form-label">Cardholder Name</label>
          <q-input
            v-model="cardForm.name"
            placeholder="JOHN DOE"
            filled
            dense
            :rules="[val => !!val || 'Name is required', validateCardName]"
            @focus="focusedField = 'name'"
            @blur="focusedField = null"
            @input="onCardNameInput"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
            <template v-slot:append>
              <q-icon 
                v-if="cardValidation.name" 
                :name="cardValidation.name.valid ? 'check_circle' : 'error'"
                :color="cardValidation.name.valid ? 'positive' : 'negative'"
              />
            </template>
          </q-input>
          <div v-if="cardValidation.name && !cardValidation.name.valid" class="error-message">
            {{ cardValidation.name.message }}
          </div>
        </div>
        
        <!-- Expiry and CVC -->
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="form-group">
              <label class="form-label">Expiry Date</label>
              <q-input
                v-model="cardForm.expiry"
                mask="##/##"
                placeholder="MM/YY"
                filled
                dense
                :rules="[val => !!val || 'Expiry required', validateExpiry]"
                @focus="focusedField = 'expiry'"
                @blur="focusedField = null"
                @input="onExpiryInput"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" />
                </template>
                <template v-slot:append>
                  <q-icon 
                    v-if="cardValidation.expiry" 
                    :name="cardValidation.expiry.valid ? 'check_circle' : 'error'"
                    :color="cardValidation.expiry.valid ? 'positive' : 'negative'"
                  />
                </template>
              </q-input>
              <div v-if="cardValidation.expiry && !cardValidation.expiry.valid" class="error-message">
                {{ cardValidation.expiry.message }}
              </div>
            </div>
          </div>
          
          <div class="col-6">
            <div class="form-group">
              <label class="form-label">CVC</label>
              <q-input
                v-model="cardForm.cvc"
                mask="###"
                placeholder="123"
                filled
                dense
                :rules="[val => !!val || 'CVC required', validateCVC]"
                @focus="focusedField = 'cvc'"
                @blur="focusedField = null"
                @input="onCVCInput"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon 
                    v-if="cardValidation.cvc" 
                    :name="cardValidation.cvc.valid ? 'check_circle' : 'error'"
                    :color="cardValidation.cvc.valid ? 'positive' : 'negative'"
                  />
                </template>
              </q-input>
              <div v-if="cardValidation.cvc && !cardValidation.cvc.valid" class="error-message">
                {{ cardValidation.cvc.message }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Submit Button -->
        <q-btn
          type="submit"
          label="Pay Securely"
          class="btn-gradient full-width q-mt-md"
          :loading="processing"
          :disable="!isFormValid"
          size="lg"
        >
          <template v-slot:loading>
            <q-spinner-dots />
            Processing...
          </template>
        </q-btn>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      number: '',
      name: '',
      expiry: '',
      cvc: ''
    })
  },
  processing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'validation-change'])

// Reactive data
const cardForm = ref({ ...props.modelValue })
const focusedField = ref(null)
const cardValidation = ref({
  number: null,
  name: null,
  expiry: null,
  cvc: null
})

// Computed properties
const maskedNumber = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  const masked = number.padEnd(16, '•')
  return masked.match(/.{1,4}/g) || []
})

const cardBrandIcon = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'credit_card'
  if (number.startsWith('5')) return 'credit_card'
  if (number.startsWith('3')) return 'credit_card'
  if (number.startsWith('6')) return 'credit_card'
  return 'credit_card'
})

const cardBrandColor = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'blue'
  if (number.startsWith('5')) return 'red'
  if (number.startsWith('3')) return 'green'
  if (number.startsWith('6')) return 'orange'
  return 'grey'
})

const cardBrandName = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'VISA'
  if (number.startsWith('5')) return 'MASTERCARD'
  if (number.startsWith('3')) return 'AMEX'
  if (number.startsWith('6')) return 'DISCOVER'
  return 'CARD'
})

const isFormValid = computed(() => {
  return Object.values(cardValidation.value).every(validation => 
    validation && validation.valid
  )
})

// Methods
const validateCardNumber = (val) => {
  if (!val) return 'Card number is required'
  
  const cleanNumber = val.replace(/\s/g, '')
  if (cleanNumber.length !== 16) return 'Card number must be 16 digits'
  
  if (!luhnCheck(cleanNumber)) return 'Invalid card number'
  
  return true
}

const validateCardName = (val) => {
  if (!val) return 'Name is required'
  if (val.length < 2) return 'Name must be at least 2 characters'
  if (!/^[a-zA-Z\s]+$/.test(val)) return 'Name can only contain letters and spaces'
  return true
}

const validateExpiry = (val) => {
  if (!val) return 'Expiry date is required'
  if (val.length !== 5) return 'Invalid expiry format'
  
  const [month, year] = val.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  const expMonth = parseInt(month)
  const expYear = parseInt(year)
  
  if (expMonth < 1 || expMonth > 12) return 'Invalid month'
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return 'Card has expired'
  }
  
  return true
}

const validateCVC = (val) => {
  if (!val) return 'CVC is required'
  if (val.length !== 3) return 'CVC must be 3 digits'
  if (!/^\d{3}$/.test(val)) return 'CVC must contain only numbers'
  return true
}

const luhnCheck = (number) => {
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

const updateValidation = (field, value) => {
  let validator
  switch (field) {
    case 'number':
      validator = validateCardNumber
      break
    case 'name':
      validator = validateCardName
      break
    case 'expiry':
      validator = validateExpiry
      break
    case 'cvc':
      validator = validateCVC
      break
    default:
      return
  }
  
  const result = validator(value)
  cardValidation.value[field] = {
    valid: result === true,
    message: result === true ? null : result
  }
  
  emit('validation-change', cardValidation.value)
}

const onCardNumberInput = () => {
  updateValidation('number', cardForm.value.number)
}

const onCardNameInput = () => {
  updateValidation('name', cardForm.value.name)
}

const onExpiryInput = () => {
  updateValidation('expiry', cardForm.value.expiry)
}

const onCVCInput = () => {
  updateValidation('cvc', cardForm.value.cvc)
}

const validateAndSubmit = () => {
  // Validate all fields
  updateValidation('number', cardForm.value.number)
  updateValidation('name', cardForm.value.name)
  updateValidation('expiry', cardForm.value.expiry)
  updateValidation('cvc', cardForm.value.cvc)
  
  if (isFormValid.value) {
    emit('submit', cardForm.value)
  }
}

// Watchers
watch(cardForm, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

watch(() => props.modelValue, (newValue) => {
  cardForm.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
.payment-method-card {
  background: #121212;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.card-preview {
  margin-bottom: 24px;
  perspective: 1000px;
}

.card-front, .card-back {
  background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card-front.card-focused, .card-back.card-focused {
  border-color: #bdf000;
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.3);
  transform: scale(1.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-name {
  color: #bdf000;
  font-weight: 600;
  font-size: 0.9rem;
}

.card-chip {
  width: 40px;
  height: 30px;
  background: linear-gradient(45deg, #d4af37, #ffd700);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-inner {
  width: 32px;
  height: 22px;
  background: #1a1a1a;
  border-radius: 4px;
}

.card-number {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
}

.digit {
  width: 24px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
}

.card-footer {
  display: flex;
  justify-content: space-between;
}

.card-holder, .card-expiry {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.7rem;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 500;
}

.card-back {
  background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
}

.card-stripe {
  height: 40px;
  background: #333;
  margin-bottom: 20px;
  border-radius: 4px;
}

.card-signature {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signature-line {
  flex: 1;
  height: 2px;
  background: #ccc;
  margin-right: 20px;
}

.cvc-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.cvc-label {
  font-size: 0.7rem;
  color: #ccc;
  text-transform: uppercase;
}

.cvc-value {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 500;
}

.card-form {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 4px;
}

.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 5);
  border-radius: 8px;
  height: 48px;
}

.full-width {
  width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
  .payment-method-card {
    padding: 20px;
  }
  
  .card-front, .card-back {
    padding: 16px;
  }
  
  .digit {
    width: 20px;
    height: 28px;
    font-size: 1rem;
  }
  
  .card-form {
    padding: 16px;
  }
}
</style>
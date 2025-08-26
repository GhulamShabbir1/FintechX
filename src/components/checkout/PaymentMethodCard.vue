<template>
  <div class="payment-method-card">
    <!-- 3D Card Preview -->
    <div class="card-preview" :class="{ 'card-flipped': showBackCard }">
      <div class="card-container">
        <!-- Front of the card -->
        <div class="card-front" :class="{ 'card-focused': focusedField === 'number' || focusedField === 'name' || focusedField === 'expiry' }">
          <div class="card-glare"></div>
          <div class="card-content">
            <div class="card-header">
              <div class="card-brand">
                <q-icon :name="cardBrandIcon" :color="cardBrandColor" size="32px" class="brand-icon" />
                <span class="brand-name">{{ cardBrandName }}</span>
              </div>
              <div class="card-chip">
                <div class="chip-inner">
                  <div class="chip-line"></div>
                  <div class="chip-line"></div>
                  <div class="chip-line"></div>
                </div>
              </div>
            </div>
            
            <div class="card-number">
              <span v-for="(digit, index) in maskedNumber" :key="index" class="digit" :class="{ 'digit-visible': digit !== '•' }">
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
        </div>
        
        <!-- Back of the card -->
        <div class="card-back" :class="{ 'card-focused': focusedField === 'cvc' }">
          <div class="card-glare"></div>
          <div class="card-content">
            <div class="card-stripe"></div>
            <div class="card-signature">
              <div class="signature-line"></div>
              <div class="cvc-section">
                <div class="cvc-label">CVC</div>
                <div class="cvc-value">{{ cardForm.cvc || '•••' }}</div>
              </div>
            </div>
            <div class="card-hologram"></div>
          </div>
        </div>
      </div>
      
      <div class="card-flip-hint" @click="showBackCard = !showBackCard">
        <q-icon :name="showBackCard ? 'visibility' : 'visibility_off'" size="16px" />
        <span>{{ showBackCard ? 'Show Front' : 'Show Back' }}</span>
      </div>
    </div>
    
    <!-- Card Form -->
    <div class="card-form">
      <q-form @submit.prevent="validateAndSubmit" class="q-gutter-md">
        <!-- Card Number -->
        <div class="form-group">
          <label class="form-label">
            <q-icon name="credit_card" size="20px" class="q-mr-sm" />
            Card Number
          </label>
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
            class="modern-input"
          >
            <template v-slot:prepend>
              <q-icon :name="cardBrandIcon" :color="cardBrandColor" />
            </template>
            <template v-slot:append>
              <q-icon 
                v-if="cardValidation.number" 
                :name="cardValidation.number.valid ? 'check_circle' : 'error'"
                :color="cardValidation.number.valid ? 'positive' : 'negative'"
                class="validation-icon"
              />
            </template>
          </q-input>
          <div v-if="cardValidation.number && !cardValidation.number.valid" class="error-message">
            {{ cardValidation.number.message }}
          </div>
        </div>
        
        <!-- Cardholder Name -->
        <div class="form-group">
          <label class="form-label">
            <q-icon name="person" size="20px" class="q-mr-sm" />
            Cardholder Name
          </label>
          <q-input
            v-model="cardForm.name"
            placeholder="JOHN DOE"
            filled
            dense
            :rules="[val => !!val || 'Name is required', validateCardName]"
            @focus="focusedField = 'name'"
            @blur="focusedField = null"
            @input="onCardNameInput"
            class="modern-input"
          >
            <template v-slot:append>
              <q-icon 
                v-if="cardValidation.name" 
                :name="cardValidation.name.valid ? 'check_circle' : 'error'"
                :color="cardValidation.name.valid ? 'positive' : 'negative'"
                class="validation-icon"
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
              <label class="form-label">
                <q-icon name="schedule" size="20px" class="q-mr-sm" />
                Expiry Date
              </label>
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
                class="modern-input"
              >
                <template v-slot:append>
                  <q-icon 
                    v-if="cardValidation.expiry" 
                    :name="cardValidation.expiry.valid ? 'check_circle' : 'error'"
                    :color="cardValidation.expiry.valid ? 'positive' : 'negative'"
                    class="validation-icon"
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
              <label class="form-label">
                <q-icon name="lock" size="20px" class="q-mr-sm" />
                CVC
                <q-tooltip>
                  The 3-digit code on the back of your card
                </q-tooltip>
              </label>
              <q-input
                v-model="cardForm.cvc"
                mask="###"
                placeholder="123"
                filled
                dense
                :rules="[val => !!val || 'CVC required', validateCVC]"
                @focus="focusedField = 'cvc'; showBackCard = true"
                @blur="focusedField = null"
                @input="onCVCInput"
                class="modern-input"
              >
                <template v-slot:append>
                  <q-icon 
                    v-if="cardValidation.cvc" 
                    :name="cardValidation.cvc.valid ? 'check_circle' : 'error'"
                    :color="cardValidation.cvc.valid ? 'positive' : 'negative'"
                    class="validation-icon"
                  />
                </template>
              </q-input>
              <div v-if="cardValidation.cvc && !cardValidation.cvc.valid" class="error-message">
                {{ cardValidation.cvc.message }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Security Info -->
        <div class="security-info">
          <q-icon name="security" color="lime" size="16px" />
          <span>Your card details are encrypted and secure</span>
        </div>
        
        <!-- Submit Button -->
        <q-btn
          type="submit"
          label="Pay Securely"
          class="btn-primary full-width q-mt-md"
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
const showBackCard = ref(false)
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
  if (number.startsWith('4')) return '#1a1f71' // Visa blue
  if (number.startsWith('5')) return '#eb001b' // Mastercard red
  if (number.startsWith('3')) return '#016fd0' // Amex blue
  if (number.startsWith('6')) return '#ff6000' // Discover orange
  return '#bdf000' // Default lime
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

watch(focusedField, (newField) => {
  if (newField === 'cvc') {
    showBackCard.value = true
  } else if (newField === null && showBackCard.value) {
    // Auto-flip back after a delay when moving away from CVC
    setTimeout(() => {
      if (focusedField.value !== 'cvc') {
        showBackCard.value = false
      }
    }, 1000)
  }
})
</script>

<style scoped>
.payment-method-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
}

.card-preview {
  margin-bottom: 32px;
  perspective: 1000px;
  position: relative;
}

.card-container {
  position: relative;
  width: 100%;
  height: 200px;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
}

.card-flipped .card-container {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
  border: 1px solid rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
}

.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
}

.card-focused {
  border-color: v-bind('cardBrandColor');
  box-shadow: 0 0 30px v-bind('cardBrandColor + "40"');
  transform: translateY(-4px);
}

.card-glare {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  opacity: 0.3;
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  filter: drop-shadow(0 0 8px v-bind('cardBrandColor + "80"'));
}

.brand-name {
  color: v-bind('cardBrandColor');
  font-weight: 700;
  font-size: 1rem;
  text-shadow: 0 0 10px v-bind('cardBrandColor + "40"');
}

.card-chip {
  width: 48px;
  height: 36px;
  background: linear-gradient(45deg, #d4af37, #ffd700, #d4af37);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.chip-inner {
  width: 40px;
  height: 28px;
  background: #1a1a1a;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.chip-line {
  position: absolute;
  background: rgba(255, 215, 0, 0.3);
}

.chip-line:nth-child(1) {
  top: 25%;
  left: 0;
  right: 0;
  height: 1px;
}

.chip-line:nth-child(2) {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
}

.chip-line:nth-child(3) {
  top: 75%;
  left: 0;
  right: 0;
  height: 1px;
}

.card-number {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  font-family: 'Courier New', monospace;
  justify-content: center;
}

.digit {
  width: 28px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  transition: all 0.3s ease;
}

.digit-visible {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
}

.card-holder, .card-expiry {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 0.75rem;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.value {
  font-size: 0.95rem;
  color: #ffffff;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.card-stripe {
  height: 48px;
  background: #000;
  margin: 20px 0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.card-stripe::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.card-signature {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.signature-line {
  flex: 1;
  height: 2px;
  background: #ccc;
  margin-right: 20px;
  position: relative;
}

.signature-line::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 6px;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.1) 2px,
    rgba(255, 255, 255, 0.1) 4px
  );
}

.cvc-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.cvc-label {
  font-size: 0.75rem;
  color: #ccc;
  text-transform: uppercase;
  font-weight: 500;
}

.cvc-value {
  font-size: 1rem;
  color: #ffffff;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.card-hologram {
  width: 60px;
  height: 40px;
  background: linear-gradient(45deg, #00d4ff, #bdf000, #00d4ff);
  border-radius: 6px;
  position: absolute;
  bottom: 20px;
  right: 20px;
  opacity: 0.7;
}

.card-flip-hint {
  position: absolute;
  bottom: -30px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ccc;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.card-flip-hint:hover {
  color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
}

.card-form {
  background: rgba(26, 26, 26, 0.8);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #ccc;
  font-size: 0.95rem;
  font-weight: 500;
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
  border-color: v-bind('cardBrandColor');
  box-shadow: 0 0 0 2px v-bind('cardBrandColor + "20"');
}

.validation-icon {
  transition: all 0.3s ease;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 6px;
  padding-left: 8px;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 16px;
  padding: 12px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, v-bind('cardBrandColor'), #a0d000);
  color: #09050d;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  height: 52px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px v-bind('cardBrandColor + "40"');
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.full-width {
  width: 100%;
}

/* Animation Classes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-form {
  animation: fadeIn 0.6s ease-out;
}

/* Responsive design */
@media (max-width: 768px) {
  .payment-method-card {
    padding: 20px;
  }
  
  .card-front, .card-back {
    padding: 20px;
  }
  
  .digit {
    width: 22px;
    height: 30px;
    font-size: 1rem;
  }
  
  .card-form {
    padding: 20px;
  }
  
  .card-container {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .payment-method-card {
    padding: 16px;
  }
  
  .card-number {
    gap: 8px;
  }
  
  .digit {
    width: 18px;
    height: 26px;
    font-size: 0.9rem;
  }
  
  .card-form {
    padding: 16px;
  }
  
  .card-container {
    height: 160px;
  }
}

/* Enhanced focus states */
:deep(.q-focusable):focus {
  outline: 2px solid v-bind('cardBrandColor + "40"');
  outline-offset: 2px;
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
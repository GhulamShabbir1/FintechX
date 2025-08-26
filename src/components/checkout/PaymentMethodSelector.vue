<template>
  <div class="payment-method-selector">
    <div class="selector-header animate-fade-in">
      <h3 class="selector-title">Choose Payment Method</h3>
      <p class="selector-subtitle">Select your preferred payment option</p>
    </div>
    
    <div class="methods-grid">
      <div
        v-for="method in availableMethods"
        :key="method.id"
        class="method-option"
        :class="{
          'method-selected': selectedMethod === method.id,
          'method-disabled': !method.available,
          'method-loading': method.loading
        }"
        @click="selectMethod(method)"
        @mouseenter="hoverMethod = method.id"
        @mouseleave="hoverMethod = null"
      >
        <!-- Method background effect -->
        <div class="method-background" :style="methodBackgroundStyle(method)"></div>
        
        <div class="method-content">
          <div class="method-icon">
            <q-icon :name="method.icon" size="32px" class="icon-animate" />
          </div>
          
          <div class="method-info">
            <div class="method-name">{{ method.name }}</div>
            <div class="method-description">{{ method.description }}</div>
          </div>
          
          <div class="method-status">
            <!-- Loading state -->
            <q-spinner
              v-if="method.loading"
              size="20px"
              color="lime"
              class="status-animate"
            />
            <!-- Selected state -->
            <q-icon
              v-else-if="selectedMethod === method.id"
              name="check_circle"
              color="lime"
              size="24px"
              class="status-animate"
            />
            <!-- Disabled state -->
            <q-icon
              v-else-if="!method.available"
              name="block"
              color="grey"
              size="24px"
            />
            <!-- Hover state -->
            <q-icon
              v-else-if="hoverMethod === method.id"
              name="arrow_forward"
              color="lime"
              size="20px"
              class="status-animate"
            />
            <!-- Default state -->
            <q-icon
              v-else
              name="radio_button_unchecked"
              color="grey"
              size="24px"
            />
          </div>
        </div>

        <!-- Coming soon badge for disabled methods -->
        <div v-if="!method.available" class="coming-soon-badge">
          Coming Soon
        </div>
      </div>
    </div>
    
    <!-- Additional payment info -->
    <div class="payment-info animate-fade-in" style="animation-delay: 0.2s">
      <div class="info-item">
        <q-icon name="security" color="lime" size="16px" class="info-icon" />
        <span>All payments are encrypted and secure</span>
      </div>
      <div class="info-item">
        <q-icon name="schedule" color="lime" size="16px" class="info-icon" />
        <span>Instant processing for most methods</span>
      </div>
      <div class="info-item">
        <q-icon name="payment" color="lime" size="16px" class="info-icon" />
        <span>No extra fees for any payment method</span>
      </div>
    </div>

    <!-- Selected method details -->
    <transition name="fade-slide">
      <div v-if="selectedMethodDetails" class="method-details animate-fade-in" style="animation-delay: 0.3s">
        <div class="details-header">
          <h4 class="details-title">Payment Details</h4>
        </div>
        <div class="details-content">
          <p>{{ selectedMethodDetails }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'card'
  },
  methods: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'method-selected'])

// Reactive data
const selectedMethod = ref(props.modelValue)
const hoverMethod = ref(null)
const loadingMethods = ref({})

// Computed properties
const availableMethods = computed(() => {
  const defaultMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: 'credit_card',
      available: true,
      details: 'Secure card payment with instant processing. Supports all major credit and debit cards.'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'PayPal, Apple Pay, Google Pay',
      icon: 'account_balance_wallet',
      available: true,
      details: 'Fast and secure payments using your favorite digital wallet service.'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank account transfer',
      icon: 'account_balance',
      available: true,
      details: 'Direct bank transfer with secure authentication. May take 1-2 business days.'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, USDC',
      icon: 'currency_bitcoin',
      available: false,
      details: 'Cryptocurrency payments coming soon. Support for multiple cryptocurrencies.'
    }
  ]
  
  return props.methods.length > 0 ? props.methods : defaultMethods
})

const selectedMethodDetails = computed(() => {
  const method = availableMethods.value.find(m => m.id === selectedMethod.value)
  return method?.details || null
})

// Methods
const selectMethod = async (method) => {
  if (!method.available || method.loading) return
  
  // Set loading state
  loadingMethods.value[method.id] = true
  
  // Simulate loading delay for better UX
  await new Promise(resolve => setTimeout(resolve, 300))
  
  selectedMethod.value = method.id
  emit('update:modelValue', method.id)
  emit('method-selected', method.id)
  
  // Clear loading state
  loadingMethods.value[method.id] = false
}

const methodBackgroundStyle = (method) => {
  if (method.loading) {
    return {
      background: `linear-gradient(45deg, 
        rgba(189, 240, 0, 0.1),
        rgba(189, 240, 0, 0.2),
        rgba(189, 240, 0, 0.1)
      )`,
      animation: 'gradientShift 1.5s ease-in-out infinite'
    }
  }
  
  if (selectedMethod.value === method.id) {
    return {
      background: `linear-gradient(45deg, 
        rgba(189, 240, 0, 0.15),
        rgba(189, 240, 0, 0.25),
        rgba(189, 240, 0, 0.15)
      )`
    }
  }
  
  if (hoverMethod.value === method.id && method.available) {
    return {
      background: `linear-gradient(45deg, 
        rgba(189, 240, 0, 0.05),
        rgba(189, 240, 0, 0.1),
        rgba(189, 240, 0, 0.05)
      )`
    }
  }
  
  return {
    background: 'rgba(189, 240, 0, 0.02)'
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedMethod.value = newValue
})

watch(selectedMethod, (newValue) => {
  emit('update:modelValue', newValue)
})

// Add loading property to methods
watch(availableMethods, (methods) => {
  methods.forEach(method => {
    method.loading = !!loadingMethods.value[method.id]
  })
}, { immediate: true, deep: true })
</script>

<style scoped>
.payment-method-selector {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.selector-header {
  text-align: center;
  margin-bottom: 32px;
}

.selector-title {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #bdf000, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.selector-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #ccc;
  opacity: 0.9;
  font-weight: 400;
}

.methods-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 32px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(26, 26, 26, 0.8);
  border: 2px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 80px;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.method-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  transition: all 0.3s ease;
}

.method-option:hover:not(.method-disabled):not(.method-loading) {
  border-color: rgba(189, 240, 0, 0.4);
  transform: translateY(-4px);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(189, 240, 0, 0.2);
}

.method-option.method-selected {
  border-color: #bdf000;
  box-shadow: 
    0 12px 40px rgba(189, 240, 0, 0.3),
    0 0 0 2px rgba(189, 240, 0, 0.3);
  transform: translateY(-2px);
}

.method-option.method-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.method-option.method-disabled:hover {
  transform: none;
  box-shadow: none;
}

.method-option.method-loading {
  cursor: wait;
  opacity: 0.8;
}

.method-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.15), rgba(189, 240, 0, 0.1));
  border-radius: 12px;
  color: #bdf000;
  border: 1px solid rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
}

.method-selected .method-icon {
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.25), rgba(189, 240, 0, 0.15));
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.3);
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
  font-size: 1.1rem;
}

.method-description {
  font-size: 0.9rem;
  color: #ccc;
  opacity: 0.9;
  line-height: 1.4;
}

.method-status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.coming-soon-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.payment-info {
  padding-top: 24px;
  border-top: 1px solid rgba(189, 240, 0, 0.2);
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ccc;
  font-size: 0.9rem;
  padding: 8px 0;
}

.info-icon {
  flex-shrink: 0;
}

.method-details {
  margin-top: 24px;
  padding: 20px;
  background: rgba(189, 240, 0, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.details-header {
  margin-bottom: 12px;
}

.details-title {
  margin: 0;
  font-size: 1.1rem;
  color: #bdf000;
  font-weight: 600;
}

.details-content {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
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

.fade-slide-enter-active {
  animation: fadeInUp 0.4s ease-out;
}

.fade-slide-leave-active {
  animation: fadeOutDown 0.3s ease-in;
}

@keyframes fadeOutDown {
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

.icon-animate {
  transition: all 0.3s ease;
}

.method-option:hover .icon-animate {
  transform: scale(1.1);
}

.status-animate {
  transition: all 0.3s ease;
}

.method-option:hover .status-animate {
  transform: scale(1.1);
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .payment-method-selector {
    padding: 24px;
  }
  
  .method-option {
    padding: 16px;
    gap: 12px;
  }
  
  .method-icon {
    width: 48px;
    height: 48px;
  }
  
  .method-name {
    font-size: 1rem;
  }
  
  .method-description {
    font-size: 0.85rem;
  }
  
  .methods-grid {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .payment-method-selector {
    padding: 20px;
  }
  
  .method-content {
    gap: 12px;
  }
  
  .method-icon {
    width: 44px;
    height: 44px;
  }
  
  .selector-title {
    font-size: 1.3rem;
  }
  
  .selector-subtitle {
    font-size: 0.9rem;
  }
}

/* Enhanced focus states */
.method-option:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .method-option,
  .icon-animate,
  .status-animate {
    animation: none;
    transition: none;
  }
}
</style>
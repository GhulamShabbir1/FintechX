<template>
  <div class="payment-method-selector">
    <div class="selector-header">
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
          'method-disabled': !method.available
        }"
        @click="selectMethod(method)"
      >
        <div class="method-icon">
          <q-icon :name="method.icon" size="32px" />
        </div>
        
        <div class="method-info">
          <div class="method-name">{{ method.name }}</div>
          <div class="method-description">{{ method.description }}</div>
        </div>
        
        <div class="method-status">
          <q-icon
            v-if="selectedMethod === method.id"
            name="check_circle"
            color="lime"
            size="24px"
          />
          <q-icon
            v-else-if="!method.available"
            name="block"
            color="grey"
            size="24px"
          />
          <q-icon
            v-else
            name="radio_button_unchecked"
            color="grey"
            size="24px"
          />
        </div>
      </div>
    </div>
    
    <!-- Additional payment info -->
    <div class="payment-info">
      <div class="info-item">
        <q-icon name="security" color="lime" size="16px" />
        <span>All payments are encrypted and secure</span>
      </div>
      <div class="info-item">
        <q-icon name="schedule" color="lime" size="16px" />
        <span>Instant processing for most methods</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch,computed } from 'vue'

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

// Computed properties
const availableMethods = computed(() => {
  const defaultMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: 'credit_card',
      available: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'PayPal, Apple Pay, Google Pay',
      icon: 'account_balance_wallet',
      available: true
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank account transfer',
      icon: 'account_balance',
      available: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, USDC',
      icon: 'currency_bitcoin',
      available: false
    }
  ]
  
  return props.methods.length > 0 ? props.methods : defaultMethods
})

// Methods
const selectMethod = (method) => {
  if (!method.available) return
  
  selectedMethod.value = method.id
  emit('update:modelValue', method.id)
  emit('method-selected', method.id)
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedMethod.value = newValue
})

watch(selectedMethod, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<style scoped>
.payment-method-selector {
  background: #121212;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.selector-header {
  text-align: center;
  margin-bottom: 24px;
}

.selector-title {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
}

.selector-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
  opacity: 0.8;
}

.methods-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.method-option:hover:not(.method-disabled) {
  background: #1f1f1f;
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.method-option.method-selected {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.2);
}

.method-option.method-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.method-option.method-disabled:hover {
  transform: none;
  box-shadow: none;
}

.method-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 8px;
  color: #bdf000;
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.method-description {
  font-size: 0.85rem;
  color: #ccc;
  opacity: 0.8;
}

.method-status {
  flex-shrink: 0;
}

.payment-info {
  padding-top: 20px;
  border-top: 1px solid rgba(189, 240, 0, 0.2);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .payment-method-selector {
    padding: 20px;
  }
  
  .method-option {
    padding: 14px;
    gap: 12px;
  }
  
  .method-icon {
    width: 40px;
    height: 40px;
  }
  
  .method-name {
    font-size: 0.95rem;
  }
  
  .method-description {
    font-size: 0.8rem;
  }
}

/* Animation for selection */
.method-option {
  position: relative;
}

.method-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(189, 240, 0, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.method-option.method-selected::before {
  opacity: 1;
}
</style>
<template>
  <div class="merchant-branding" :style="brandingStyles">
    <!-- Header with merchant logo and name -->
    <div class="branding-header">
      <div class="merchant-logo">
        <q-img
          :src="merchantLogo"
          :alt="merchantName"
          width="48px"
          height="48px"
          fit="contain"
          class="logo-image"
          @error="onLogoError"
        />
      </div>
      
      <div class="merchant-info">
        <h2 class="merchant-name">{{ merchantName }}</h2>
        <p class="merchant-tagline">{{ merchantTagline }}</p>
      </div>
    </div>
    
    <!-- Payment amount display -->
    <div class="payment-amount">
      <div class="amount-label">Payment Amount</div>
      <div class="amount-value">{{ formatAmount(amount) }}</div>
      <div class="amount-currency">{{ currency }}</div>
    </div>
    
    <!-- Order details if available -->
    <div v-if="orderDetails" class="order-details">
      <q-separator color="rgba(189, 240, 0, 0.3)" />
      <div class="order-info">
        <div class="order-item">
          <span class="label">Order ID:</span>
          <span class="value">{{ orderDetails.orderId }}</span>
        </div>
        <div class="order-item">
          <span class="label">Description:</span>
          <span class="value">{{ orderDetails.description }}</span>
        </div>
        <div v-if="orderDetails.items" class="order-item">
          <span class="label">Items:</span>
          <span class="value">{{ orderDetails.items.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  merchant: {
    type: Object,
    default: () => ({})
  },
  amount: {
    type: [Number, String],
    default: 0
  },
  orderDetails: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['branding-loaded'])

// Reactive data
const merchantLogo = ref('')
const merchantName = ref('Merchant')
const merchantTagline = ref('Secure Payment Gateway')
const currency = ref('USD')

// Computed properties
const brandingStyles = computed(() => {
  const merchant = props.merchant || {}
  return {
    '--primary-color': merchant.primaryColor || '#bdf000',
    '--secondary-color': merchant.secondaryColor || '#ffffff',
    '--accent-color': merchant.accentColor || '#00d4ff',
    '--background-color': merchant.backgroundColor || '#0a0a0a',
    '--text-color': merchant.textColor || '#ffffff'
  }
})

// Methods
const onLogoError = () => {
  merchantLogo.value = 'https://placehold.co/48x48/121018/bdf000?text=M'
}

const formatAmount = (amount) => {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return '0.00'
  return numAmount.toFixed(2)
}

const loadMerchantBranding = () => {
  const merchant = props.merchant
  
  if (merchant) {
    merchantName.value = merchant.name || 'Merchant'
    merchantTagline.value = merchant.tagline || 'Secure Payment Gateway'
    merchantLogo.value = merchant.logo || 'https://placehold.co/48x48/121018/bdf000?text=M'
    currency.value = merchant.currency || 'USD'
    
    // Emit branding loaded event
    emit('branding-loaded', {
      name: merchantName.value,
      logo: merchantLogo.value,
      primaryColor: merchant.primaryColor,
      secondaryColor: merchant.secondaryColor,
      accentColor: merchant.accentColor,
      backgroundColor: merchant.backgroundColor,
      textColor: merchant.textColor
    })
  }
}

// Watchers
watch(() => props.merchant, loadMerchantBranding, { immediate: true })

// Lifecycle
onMounted(() => {
  loadMerchantBranding()
})
</script>

<style scoped>
.merchant-branding {
  background: var(--background-color, #0a0a0a);
  color: var(--text-color, #ffffff);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.branding-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.merchant-logo {
  flex-shrink: 0;
}

.logo-image {
  border-radius: 8px;
  border: 2px solid rgba(189, 240, 0, 0.3);
}

.merchant-info {
  flex: 1;
}

.merchant-name {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #bdf000);
}

.merchant-tagline {
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
  opacity: 0.8;
}

.payment-amount {
  text-align: center;
  padding: 24px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  margin-bottom: 20px;
}

.amount-label {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary-color, #bdf000);
  margin-bottom: 4px;
  text-shadow: 0 0 20px rgba(189, 240, 0, 0.5);
}

.amount-currency {
  font-size: 1.1rem;
  color: #ccc;
  font-weight: 500;
}

.order-details {
  margin-top: 20px;
}

.order-info {
  padding: 16px 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item .label {
  color: #ccc;
  font-size: 0.9rem;
}

.order-item .value {
  color: var(--text-color, #ffffff);
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
  .merchant-branding {
    padding: 20px;
  }
  
  .branding-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .amount-value {
    font-size: 2.5rem;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
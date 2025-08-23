<template>
  <div class="merchant-branding" :style="brandingStyles">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="skeleton-header">
        <div class="skeleton-logo"></div>
        <div class="skeleton-info">
          <div class="skeleton-name"></div>
          <div class="skeleton-tagline"></div>
        </div>
      </div>
      <div class="skeleton-amount">
        <div class="skeleton-label"></div>
        <div class="skeleton-value"></div>
        <div class="skeleton-currency"></div>
      </div>
    </div>

    <!-- Main content -->
    <div v-else class="branding-content">
      <!-- Header with merchant logo and name -->
      <div class="branding-header animate-fade-in">
        <div class="merchant-logo">
          <q-img
            :src="merchantLogo"
            :alt="merchantName"
            width="56px"
            height="56px"
            fit="contain"
            class="logo-image"
            @error="onLogoError"
            transition="fade"
            :style="{ 
              borderColor: props.merchant?.primaryColor || 'rgba(189, 240, 0, 0.3)',
              boxShadow: `0 0 20px ${props.merchant?.primaryColor || '#bdf000'}40` 
            }"
          />
        </div>
        
        <div class="merchant-info">
          <h2 class="merchant-name">{{ merchantName }}</h2>
          <p class="merchant-tagline">{{ merchantTagline }}</p>
        </div>
      </div>
      
      <!-- Payment amount display -->
      <div class="payment-amount animate-fade-in" style="animation-delay: 0.2s">
        <div class="amount-label">Payment Amount</div>
        <div class="amount-value">{{ formatAmount(amount) }}</div>
        <div class="amount-currency">{{ currency }}</div>
      </div>
      
      <!-- Order details if available -->
      <div v-if="orderDetails" class="order-details animate-fade-in" style="animation-delay: 0.4s">
        <q-separator color="rgba(189, 240, 0, 0.3)" class="separator-animate" />
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

      <!-- Security badge -->
      <div class="security-badge animate-fade-in" style="animation-delay: 0.6s">
        <q-icon name="lock" size="16px" color="lime" />
        <span>Secure Payment</span>
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
const loading = ref(true)

// Computed properties
const brandingStyles = computed(() => {
  const merchant = props.merchant || {}
  const primaryColor = merchant.primaryColor || '#bdf000'
  
  return {
    '--primary-color': primaryColor,
    '--secondary-color': merchant.secondaryColor || '#ffffff',
    '--accent-color': merchant.accentColor || '#00d4ff',
    '--background-color': merchant.backgroundColor || 'rgba(10, 10, 10, 0.95)',
    '--text-color': merchant.textColor || '#ffffff',
    '--primary-rgb': hexToRgb(primaryColor) || '189, 240, 0'
  }
})

// Methods
const onLogoError = () => {
  merchantLogo.value = 'https://placehold.co/56x56/121018/bdf000?text=M'
}

const formatAmount = (amount) => {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return '0.00'
  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const hexToRgb = (hex) => {
  if (!hex) return '189, 240, 0'
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '189, 240, 0'
}

const loadMerchantBranding = async () => {
  loading.value = true
  
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const merchant = props.merchant
  
  if (merchant) {
    merchantName.value = merchant.name || 'Merchant'
    merchantTagline.value = merchant.tagline || 'Secure Payment Gateway'
    merchantLogo.value = merchant.logo || 'https://placehold.co/56x56/121018/bdf000?text=M'
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
  
  loading.value = false
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
  background: var(--background-color);
  color: var(--text-color);
  padding: 28px;
  border-radius: 20px;
  margin-bottom: 24px;
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(var(--primary-rgb), 0.1),
    0 0 30px rgba(var(--primary-rgb), 0.15);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.merchant-branding::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.merchant-branding:hover::before {
  opacity: 1;
}

.merchant-branding:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(var(--primary-rgb), 0.3),
    0 0 40px rgba(var(--primary-rgb), 0.25);
}

.branding-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.merchant-logo {
  flex-shrink: 0;
}

.logo-image {
  border-radius: 12px;
  border: 2px solid rgba(var(--primary-rgb), 0.3);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.logo-image:hover {
  transform: scale(1.05);
  border-color: rgba(var(--primary-rgb), 0.6);
}

.merchant-info {
  flex: 1;
}

.merchant-name {
  margin: 0 0 6px 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.merchant-tagline {
  margin: 0;
  font-size: 0.95rem;
  color: #ccc;
  opacity: 0.9;
  font-weight: 400;
}

.payment-amount {
  text-align: center;
  padding: 28px;
  background: rgba(var(--primary-rgb), 0.08);
  border-radius: 16px;
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.payment-amount:hover {
  background: rgba(var(--primary-rgb), 0.12);
  border-color: rgba(var(--primary-rgb), 0.3);
  transform: translateY(-2px);
}

.amount-label {
  font-size: 0.95rem;
  color: #ccc;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.amount-value {
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 6px;
  text-shadow: 0 0 30px rgba(var(--primary-rgb), 0.6);
  font-family: 'Inter', monospace;
}

.amount-currency {
  font-size: 1.2rem;
  color: #ccc;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.order-details {
  margin-top: 24px;
}

.order-info {
  padding: 20px 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
  transition: all 0.3s ease;
}

.order-item:hover {
  background: rgba(var(--primary-rgb), 0.05);
  border-radius: 8px;
  padding: 12px;
  margin: 0 -12px;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item .label {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.order-item .value {
  color: var(--text-color);
  font-weight: 600;
  font-family: 'Inter', monospace;
}

.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px;
  background: rgba(var(--primary-rgb), 0.1);
  border-radius: 12px;
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Loading state */
.loading-state {
  padding: 20px 0;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.skeleton-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-name {
  height: 24px;
  width: 60%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
  border-radius: 6px;
  margin-bottom: 8px;
}

.skeleton-tagline {
  height: 16px;
  width: 40%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-amount {
  text-align: center;
  padding: 28px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 24px;
}

.skeleton-label {
  height: 16px;
  width: 120px;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
  border-radius: 4px;
  margin: 0 auto 12px;
}

.skeleton-value {
  height: 48px;
  width: 160px;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
  border-radius: 8px;
  margin: 0 auto 8px;
}

.skeleton-currency {
  height: 20px;
  width: 60px;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
  border-radius: 4px;
  margin: 0 auto;
}

/* Animation Classes */
.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

.separator-animate {
  opacity: 0;
  animation: fadeIn 0.6s forwards 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes skeletonLoading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .merchant-branding {
    padding: 24px;
    border-radius: 16px;
  }
  
  .branding-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .payment-amount {
    padding: 24px;
  }
  
  .amount-value {
    font-size: 2.8rem;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .order-item:hover {
    margin: 0;
    padding: 12px 0;
  }
}

@media (max-width: 480px) {
  .merchant-branding {
    padding: 20px;
  }
  
  .merchant-name {
    font-size: 1.4rem;
  }
  
  .amount-value {
    font-size: 2.4rem;
  }
  
  .payment-amount {
    padding: 20px;
  }
}

/* Enhanced focus states */
.merchant-branding:focus-within {
  outline: 2px solid rgba(var(--primary-rgb), 0.5);
  outline-offset: 2px;
}
</style>
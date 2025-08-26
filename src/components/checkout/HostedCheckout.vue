<template>
  <q-page class="q-pa-md checkout-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <q-spinner-dots size="50px" color="lime" />
        <div class="loading-text">Loading merchant information...</div>
        <div class="loading-subtext">Preparing your checkout experience</div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <q-card class="error-card glass-card">
        <q-card-section class="text-center">
          <div class="error-icon">
            <q-icon name="error" size="64px" color="negative" />
          </div>
          <div class="text-h5 text-negative q-mt-md">Checkout Unavailable</div>
          <div class="text-subtitle1 q-mt-sm text-grey-6">
            Unable to load merchant information. Please check the URL and try again.
          </div>
          <q-btn
            label="Try Again"
            class="btn-primary q-mt-lg"
            @click="retryLoading"
            :loading="retrying"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Main content -->
    <div v-else class="q-mx-auto checkout-content" style="max-width: 520px;">
      <q-card class="glass-card elevated-hover animate-fade-in">
        <q-card-section class="row items-center merchant-header">
          <q-avatar square size="42px" class="q-mr-sm avatar-animate">
            <img 
              :src="branding.logo_url || 'https://via.placeholder.com/80x80'" 
              :alt="branding.name || 'Merchant'"
              @error="handleImageError"
            />
          </q-avatar>
          <div class="merchant-info">
            <div class="text-subtitle1 merchant-name">{{ branding.name || 'Merchant' }}</div>
            <div class="text-caption text-grey">Secure Checkout</div>
          </div>
          <div class="security-badge">
            <q-icon name="lock" size="16px" color="lime" />
            <span class="text-caption text-lime">Secure</span>
          </div>
        </q-card-section>
        
        <q-separator class="divider-animate" />
        
        <q-card-section class="checkout-form-section">
          <CheckoutForm
            :merchant-id="route.params.merchantId || route.query.merchantId"
            :amount="Number(route.query.amount || 0)"
            :currency="'$'"
            :description="route.query.description || ''"
            :merchant-name="branding.name || 'Merchant'"
            :merchant-logo="branding.logo_url"
          />
        </q-card-section>
        
        <!-- Trust indicators -->
        <q-card-section class="trust-indicators">
          <div class="trust-item">
            <q-icon name="security" size="16px" color="lime" />
            <span class="text-caption">SSL Encrypted</span>
          </div>
          <div class="trust-item">
            <q-icon name="verified_user" size="16px" color="lime" />
            <span class="text-caption">PCI Compliant</span>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../boot/axios'
import CheckoutForm from '../components/payments/CheckoutForm.vue'

const route = useRoute()
const branding = ref({})
const loading = ref(true)
const error = ref(false)
const retrying = ref(false)

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/80x80/121018/bdf000?text=M'
}

const retryLoading = async () => {
  retrying.value = true
  await loadBranding()
  retrying.value = false
}

const loadBranding = async () => {
  loading.value = true
  error.value = false
  
  const id = route.params.merchantId || route.query.merchantId
  if (!id) {
    error.value = true
    loading.value = false
    return
  }
  
  try {
    const { data } = await api.get(`/checkout/${id}`)
    branding.value = data
    
    // Add slight delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300))
    
  } catch (err) {
    console.error('Failed to fetch checkout branding:', err)
    error.value = true
    // Fallback branding
    branding.value = {
      name: 'Merchant',
      logo_url: 'https://placehold.co/80x80/121018/bdf000?text=M'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadBranding()
})
</script>

<style scoped>
.checkout-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #1a1a1a 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-container, .error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  animation: fadeInUp 0.8s ease-out;
}

.loading-text {
  color: #bdf000;
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 20px;
}

.loading-subtext {
  color: #888;
  font-size: 0.9rem;
  margin-top: 8px;
}

.error-card {
  max-width: 500px;
  width: 100%;
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: errorCardEnter 0.6s ease-out;
}

.error-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: pulse 2s ease-in-out infinite;
}

.glass-card {
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.elevated-hover {
  transition: all 0.3s ease;
}

.elevated-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(189, 240, 0, 0.3),
              0 0 30px rgba(189, 240, 0, 0.1);
  border-color: rgba(189, 240, 0, 0.4);
}

.merchant-header {
  position: relative;
  padding: 24px;
}

.merchant-info {
  flex: 1;
}

.merchant-name {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.3);
}

.checkout-form-section {
  padding: 24px;
}

.trust-indicators {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
  font-size: 0.8rem;
}

.text-grey {
  color: #999;
}

.text-lime {
  color: #bdf000;
}

.text-negative {
  color: #ff6b6b;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #09050d;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(189, 240, 0, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Animation Classes */
.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

.avatar-animate {
  transition: all 0.3s ease;
}

.avatar-animate:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(189, 240, 0, 0.3);
}

.divider-animate {
  opacity: 0;
  animation: fadeIn 0.6s forwards 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
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

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
  }
}

@keyframes errorCardEnter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive design */
@media (max-width: 600px) {
  .checkout-page {
    padding: 16px;
  }
  
  .glass-card {
    border-radius: 16px;
  }
  
  .merchant-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .security-badge {
    margin-top: 8px;
  }
  
  .checkout-form-section {
    padding: 20px;
  }
  
  .trust-indicators {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .loading-text {
    font-size: 1.1rem;
  }
  
  .loading-subtext {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .merchant-header {
    padding: 16px;
  }
  
  .checkout-form-section {
    padding: 16px;
  }
  
  .trust-indicators {
    padding: 12px 16px;
  }
  
  .btn-primary {
    padding: 10px 24px;
    min-width: 120px;
  }
}

/* Smooth scrolling */
.checkout-page {
  scroll-behavior: smooth;
}

/* Enhanced focus states */
.btn-primary:focus {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
  animation: pulse 0.6s ease;
}

/* Custom scrollbar */
.checkout-page::-webkit-scrollbar {
  width: 8px;
}

.checkout-page::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.checkout-page::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.3);
  border-radius: 4px;
}

.checkout-page::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.5);
}
</style>
<template>

  <q-page class="q-pa-md flex flex-center payment-status-page">
    <PaymentStatusComponent :payment-id="paymentId" />
  </q-page>

</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PaymentStatusComponent from '../components/payments/PaymentStatus.vue'

const route = useRoute()

// Extract payment ID from route params, handle both dynamic routes and query params
const paymentId = computed(() => {
  // First try route params (for /payments/status/:id)
  if (route.params.id && route.params.id !== 'failed') {
    return route.params.id
  }
  
  // Then try query params (for /payments/status?id=xxx)
  if (route.query.id) {
    return route.query.id
  }
  
  // Handle special case for failed payments
  if (route.params.id === 'failed' || route.query.status === 'failed') {
    return 'failed'
  }
  
  // Default fallback
  return null
})
</script>

<style scoped>

.payment-status-page {
  background: linear-gradient(135deg, #09050d 0%, #121018 100%);
  min-height: 100vh;
}

</style>
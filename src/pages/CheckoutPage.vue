<template>
  <q-page class="q-pa-md flex flex-center checkout-page">
    <CheckoutForm
      :merchant-id="merchantId"
      :amount="amount"
      :currency="currency"
      :description="description"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CheckoutForm from '../components/payments/CheckoutForm.vue'

const route = useRoute()

const merchantId = ref(null)
const amount = ref(0)
const currency = ref('$')
const description = ref('')

onMounted(() => {
  // Extract parameters from route query
  merchantId.value = route.query.merchantId || 'default-merchant-id' // Provide a default or handle error
  amount.value = parseInt(route.query.amount) || 10000 // Default to 100.00 if not provided (in cents)
  currency.value = route.query.currency || '$'
  description.value = route.query.description || 'Purchase from FinteckX Store'
})
</script>

<style scoped>
.checkout-page {
  background: linear-gradient(135deg, #09050d 0%, #121018 100%);
}
</style>
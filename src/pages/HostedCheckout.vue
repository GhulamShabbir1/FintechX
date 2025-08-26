<template>
  <q-page class="q-pa-md">
    <div class="q-mx-auto" style="max-width: 520px;">
      <q-card class="glass-card elevated-hover">
        <q-card-section class="row items-center">
          <q-avatar square size="42px" class="q-mr-sm">
            <img :src="branding.logo_url || 'https://via.placeholder.com/80x80'" />
          </q-avatar>
          <div>
            <div class="text-subtitle1">{{ branding.name || 'Merchant' }}</div>
            <div class="text-caption text-grey">Secure Checkout</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <CheckoutForm
            :merchant-id="merchantId"
            :amount="amount"
            :currency="currency"
            :description="description"
          />
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
const merchantId = ref('')
const amount = ref(0)
const currency = ref('$')
const description = ref('')

onMounted(async () => {
  merchantId.value = String(route.params.merchantId || '')
  amount.value = parseInt(route.query.amount) || 10000
  currency.value = route.query.currency || '$'
  description.value = route.query.description || 'Secure purchase'

  if (merchantId.value) {
    try {
      const { data } = await api.get(`/api/checkout/${merchantId.value}`)
      branding.value = data || {}
    } catch {
      branding.value = {}
    }
  }
})
</script>


<style scoped>
</style>

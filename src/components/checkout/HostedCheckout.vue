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
            :merchant-id="route.params.merchantId || route.query.merchantId"
            :amount="Number(route.query.amount || 0)"
            :currency="'$'"
            :description="route.query.description || ''"
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

onMounted(async () => {
  const id = route.params.merchantId || route.query.merchantId
  if (!id) return
  try {
    const { data } = await api.get(`/checkout/${id}`)
    branding.value = data
  } catch (error) {
    console.error('Failed to fetch checkout branding:', error)
    // Fallback branding
    branding.value = {
      name: 'Merchant',
      logo_url: 'https://placehold.co/80x80/121018/bdf000?text=M'
    }
  }
})
</script>

<style scoped>
.glass-card {
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 16px;
}

.elevated-hover {
  transition: all 0.3s ease;
}

.elevated-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(189, 240, 0, 3);
}

.text-grey {
  color: #999;
}
</style>
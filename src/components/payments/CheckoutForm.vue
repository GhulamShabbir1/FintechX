<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Left: Cart Summary -->
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-h6">Order Summary</div>
            <div class="text-subtitle2 text-grey">Review your items</div>
          </q-card-section>

          <q-separator />

          <q-list bordered class="rounded-borders">
            <q-item v-for="(item, i) in cartItems" :key="i">
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>Qty: {{ item.quantity }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-bold">${{ item.price * item.quantity }}</div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator />

          <q-card-section>
            <div class="row justify-between items-center">
              <div class="text-subtitle1">Subtotal</div>
              <div class="text-subtitle1">${{ subtotal }}</div>
            </div>
            <div class="row justify-between items-center text-grey">
              <div>Taxes</div>
              <div>${{ taxes }}</div>
            </div>
            <div class="row justify-between items-center text-bold q-mt-sm">
              <div>Total</div>
              <div>${{ total }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right: Payment Info -->
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-h6">Payment Information</div>
            <div class="text-subtitle2 text-grey">Choose your payment method</div>
          </q-card-section>

          <q-separator />

          <!-- Payment Method Selection -->
          <q-card-section>
            <q-option-group
              v-model="paymentMethod"
              :options="paymentOptions"
              type="radio"
              color="primary"
            />
          </q-card-section>

          <q-separator />

          <!-- Billing Details -->
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Billing Information</div>
            <q-input v-model="billing.name" label="Full Name" outlined dense />
            <q-input v-model="billing.email" label="Email Address" outlined dense class="q-mt-sm" />
            <q-input v-model="billing.address" label="Billing Address" outlined dense class="q-mt-sm" />
          </q-card-section>

          <q-separator />

          <!-- Checkout Button -->
          <q-card-actions align="right">
            <q-btn color="primary" label="Confirm & Pay" @click="checkout" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

// Dummy Cart Items
const cartItems = ref([
  { name: 'Product A', price: 50, quantity: 2 },
  { name: 'Product B', price: 30, quantity: 1 },
  { name: 'Product C', price: 20, quantity: 3 }
])

// Payment methods
const paymentMethod = ref('credit')
const paymentOptions = [
  { label: 'Credit Card', value: 'credit' },
  { label: 'PayPal', value: 'paypal' },
  { label: 'Bank Transfer', value: 'bank' }
]

// Billing info
const billing = ref({
  name: '',
  email: '',
  address: ''
})

// Totals
const subtotal = computed(() =>
  cartItems.value.reduce((acc, item) => acc + item.price * item.quantity, 0)
)
const taxes = computed(() => (subtotal.value * 0.1).toFixed(2)) // 10% tax
const total = computed(() => (subtotal.value + parseFloat(taxes.value)).toFixed(2))

// Checkout Action
function checkout() {
  if (!billing.value.name || !billing.value.email || !billing.value.address) {
    alert('Please fill in billing information')
    return
  }
  alert(`Payment successful with ${paymentMethod.value}! Total: $${total.value}`)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>

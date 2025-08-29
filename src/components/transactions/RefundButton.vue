<template>
  <div class="refund-button-container">
    <q-btn
      :label="buttonLabel"
      :icon="buttonIcon"
      :color="buttonColor"
      :loading="processing"
      :disabled="!canRefund"
      @click="showRefundModal = true"
      size="sm"
      outline
    />
    
    <!-- Refund Modal -->
    <q-dialog v-model="showRefundModal" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Process Refund</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="transaction-summary q-mb-lg">
            <div class="text-subtitle2 q-mb-sm">Transaction Details</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="detail-item">
                  <span class="label">Amount:</span>
                  <span class="value">{{ formatCurrency(transaction.amount) }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="detail-item">
                  <span class="label">Customer:</span>
                  <span class="value">{{ transaction.customer_name }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="detail-item">
                  <span class="label">Method:</span>
                  <span class="value">{{ transaction.method }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="detail-item">
                  <span class="label">Date:</span>
                  <span class="value">{{ formatDate(transaction.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <q-input
            v-model="refundAmount"
            type="number"
            label="Refund Amount"
            :hint="`Maximum: ${formatCurrency(transaction.amount)}`"
            :rules="[val => val > 0 || 'Amount must be greater than 0', 
                     val => val <= transaction.amount || 'Amount cannot exceed transaction amount']"
            outlined
            dense
            class="q-mb-md"
          />

          <q-select
            v-model="refundReason"
            :options="refundReasons"
            label="Refund Reason"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-input
            v-model="refundNote"
            type="textarea"
            label="Additional Notes (Optional)"
            outlined
            dense
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Process Refund"
            color="negative"
            @click="processRefund"
            :loading="processing"
            :disabled="!isFormValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Success Notification -->
    <q-dialog v-model="showSuccessModal" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="60px" color="green" class="q-mb-md" />
          <div class="text-h6">Refund Processed Successfully</div>
          <div class="text-body2 q-mt-sm">
            Refund ID: {{ refundResult?.refund_id }}<br>
            Amount: {{ formatCurrency(refundResult?.amount) }}
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat label="Close" color="primary" v-close-popup @click="onRefundSuccess" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'

const $q = useQuasar()

// Props
const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['refund-processed'])

// Reactive data
const showRefundModal = ref(false)
const showSuccessModal = ref(false)
const processing = ref(false)
const refundAmount = ref(0)
const refundReason = ref('')
const refundNote = ref('')
const refundResult = ref(null)

// Refund reasons
const refundReasons = [
  { label: 'Customer Request', value: 'customer_request' },
  { label: 'Duplicate Transaction', value: 'duplicate_transaction' },
  { label: 'Fraudulent Transaction', value: 'fraudulent_transaction' },
  { label: 'Product Not Received', value: 'product_not_received' },
  { label: 'Product Defective', value: 'product_defective' },
  { label: 'Service Not Rendered', value: 'service_not_rendered' },
  { label: 'Other', value: 'other' }
]

// Computed
const canRefund = computed(() => {
  return props.transaction.status === 'completed' && 
         props.transaction.amount > 0 &&
         !props.transaction.refunded
})

const buttonLabel = computed(() => {
  if (props.transaction.refunded) return 'Refunded'
  if (props.transaction.status !== 'completed') return 'Cannot Refund'
  return 'Refund'
})

const buttonIcon = computed(() => {
  if (props.transaction.refunded) return 'check_circle'
  if (props.transaction.status !== 'completed') return 'block'
  return 'refresh'
})

const buttonColor = computed(() => {
  if (props.transaction.refunded) return 'green'
  if (props.transaction.status !== 'completed') return 'grey'
  return 'orange'
})

const isFormValid = computed(() => {
  return refundAmount.value > 0 && 
         refundAmount.value <= props.transaction.amount &&
         refundReason.value
})

// Methods
const processRefund = async () => {
  try {
    processing.value = true
    
    const payload = {
      amount: refundAmount.value,
      reason: refundReason.value,
      note: refundNote.value
    }
    
    const response = await api.post(`/api/transactions/${props.transaction.id}/refund`, payload)
    
    if (response.data.success) {
      refundResult.value = response.data.data
      showRefundModal.value = false
      showSuccessModal.value = true
      
      $q.notify({
        type: 'positive',
        message: 'Refund processed successfully',
        position: 'top'
      })
    } else {
      throw new Error(response.data.message || 'Refund failed')
    }
    
  } catch (error) {
    console.error('Refund error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Failed to process refund',
      position: 'top'
    })
  } finally {
    processing.value = false
  }
}

const onRefundSuccess = () => {
  showSuccessModal.value = false
  emit('refund-processed', refundResult.value)
  
  // Reset form
  refundAmount.value = 0
  refundReason.value = ''
  refundNote.value = ''
  refundResult.value = null
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Initialize refund amount
const initializeRefundAmount = () => {
  refundAmount.value = props.transaction.amount
}

// Watch for modal open to initialize amount
watch(showRefundModal, (newVal) => {
  if (newVal) {
    initializeRefundAmount()
  }
})
</script>

<style scoped>
.refund-button-container {
  display: inline-block;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
}

.detail-item .value {
  font-weight: 600;
  color: #333;
}

.transaction-summary {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}
</style>
<template>
  <q-btn 
    dense 
    flat 
    color="negative" 
    icon="undo"
    label="Refund" 
    @click="confirmRefund" 
    :loading="loading"
    :disable="!canRefund"
    class="refund-btn"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { Dialog, Notify } from 'quasar'
import { useTransactionsStore } from '../../store/transactions'
import { pinia } from '../../store/pinia'

const props = defineProps({ 
  transaction: { 
    type: Object, 
    required: true 
  } 
})

const transactionsStore = useTransactionsStore(pinia)
const loading = ref(false)

// Computed properties
const canRefund = computed(() => {
  return props.transaction.status === 'success' && 
         !props.transaction.refunded &&
         !props.transaction.refund_in_progress
})

const confirmRefund = () => {
  if (!canRefund.value) return

  Dialog.create({
    title: 'Confirm Refund',
    message: `Are you sure you want to refund ${formatCurrency(props.transaction.amount)}?`,
    html: true,
    persistent: true,
    ok: {
      label: 'Refund',
      color: 'negative',
      icon: 'undo'
    },
    cancel: {
      label: 'Cancel',
      color: 'grey'
    }
  }).onOk(async () => {
    try {
      loading.value = true
      
      // Show refund amount input if partial refund is supported
      if (props.transaction.partial_refund_supported) {
        const refundAmount = await showRefundAmountDialog()
        if (!refundAmount) return
        
        await transactionsStore.refundTransaction(props.transaction.id, refundAmount)
      } else {
        await transactionsStore.refundTransaction(props.transaction.id)
      }
      
      Notify.create({ 
        type: 'positive', 
        message: 'Refund initiated successfully',
        position: 'top',
        timeout: 3000
      })
      
      // Emit event to refresh parent component
      emit('refunded', props.transaction.id)
      
    } catch (error) {
      console.error('Refund error:', error)
      Notify.create({ 
        type: 'negative', 
        message: error.response?.data?.message || 'Failed to initiate refund',
        position: 'top',
        timeout: 5000
      })
    } finally {
      loading.value = false
    }
  })
}

const showRefundAmountDialog = () => {
  return new Promise((resolve) => {
    Dialog.create({
      title: 'Refund Amount',
      message: 'Enter the amount to refund:',
      html: `
        <div class="refund-amount-dialog">
          <div class="current-amount">
            <strong>Current Amount:</strong> ${formatCurrency(props.transaction.amount)}
          </div>
          <div class="refund-input">
            <label>Refund Amount (in cents):</label>
            <input 
              type="number" 
              id="refundAmount" 
              min="1" 
              max="${props.transaction.amount}" 
              value="${props.transaction.amount}"
              class="q-input"
              style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
            />
          </div>
          <div class="refund-note">
            <small>Note: Partial refunds may take longer to process</small>
          </div>
        </div>
      `,
      ok: {
        label: 'Refund',
        color: 'negative'
      },
      cancel: {
        label: 'Cancel',
        color: 'grey'
      },
      persistent: true,
      beforeOk: () => {
        const input = document.getElementById('refundAmount')
        const amount = parseInt(input.value)
        if (amount > 0 && amount <= props.transaction.amount) {
          resolve(amount)
        } else {
          Notify.create({
            type: 'negative',
            message: 'Please enter a valid refund amount',
            position: 'top'
          })
          resolve(null)
        }
      }
    }).onCancel(() => resolve(null))
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

// Emits
const emit = defineEmits(['refunded'])
</script>

<style scoped>
.refund-btn {
  transition: all 0.2s ease;
}

.refund-btn:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.1);
  transform: scale(1.05);
}

.refund-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dialog Styles */
:deep(.refund-amount-dialog) {
  padding: 16px;
}

:deep(.current-amount) {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  text-align: center;
}

:deep(.refund-input) {
  margin-bottom: 16px;
}

:deep(.refund-input label) {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

:deep(.refund-note) {
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>
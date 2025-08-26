<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent maximized>
    <q-card class="transaction-detail-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="header-left">
            <h3 class="modal-title">Transaction Details</h3>
            <div class="transaction-id">ID: {{ transaction?.id || 'N/A' }}</div>
          </div>
          <div class="header-right">
            <q-btn @click="emit('update:modelValue', false)" flat round icon="close" color="white" />
          </div>
        </div>
      </q-card-section>

      <!-- Content -->
      <q-card-section class="modal-content">
        <div v-if="transaction" class="transaction-details">
          <!-- Status Banner -->
          <div class="status-banner" :class="getStatusClass(transaction.status)">
            <div class="status-content">
              <q-icon :name="getStatusIcon(transaction.status)" size="md" />
              <div class="status-text">
                <div class="status-title">{{ getStatusTitle(transaction.status) }}</div>
                <div class="status-subtitle">{{ getStatusDescription(transaction.status) }}</div>
              </div>
            </div>
          </div>

          <!-- Main Details Grid -->
          <div class="details-grid">
            <!-- Amount Section -->
            <div class="detail-section amount-section">
              <h4 class="section-title">Payment Amount</h4>
              <div class="amount-display">
                <span class="currency">{{ getCurrencySymbol(transaction.currency) }}</span>
                <span class="amount">{{ formatAmount(transaction.amount) }}</span>
              </div>
              <div class="amount-details">
                <div class="detail-row">
                  <span class="label">Processing Fee:</span>
                  <span class="value">{{ formatCurrency(transaction.processing_fee || 0) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Net Amount:</span>
                  <span class="value">{{ formatCurrency(transaction.net_amount || transaction.amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="detail-section">
              <h4 class="section-title">Customer Information</h4>
              <div class="customer-info">
                <div class="customer-avatar">
                  <q-avatar size="48px" color="lime">
                    <q-icon name="person" color="black" />
                  </q-avatar>
                </div>
                <div class="customer-details">
                  <div class="customer-name">{{ transaction.customer?.name || 'Anonymous' }}</div>
                  <div class="customer-email">{{ transaction.customer?.email || 'No email provided' }}</div>
                  <div class="customer-phone" v-if="transaction.customer?.phone">
                    {{ transaction.customer.phone }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="detail-section">
              <h4 class="section-title">Payment Method</h4>
              <div class="payment-method">
                <div class="method-icon">
                  <q-icon :name="getMethodIcon(transaction.method)" size="lg"
                    :color="getMethodColor(transaction.method)" />
                </div>
                <div class="method-details">
                  <div class="method-name">{{ getMethodName(transaction.method) }}</div>
                  <div class="method-meta" v-if="transaction.card_last4">
                    •••• •••• •••• {{ transaction.card_last4 }}
                  </div>
                  <div class="method-meta" v-if="transaction.card_brand">
                    {{ transaction.card_brand }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Merchant Information -->
            <div class="detail-section">
              <h4 class="section-title">Merchant Information</h4>
              <div class="merchant-info">
                <div class="merchant-avatar">
                  <q-avatar size="48px" square>
                    <img :src="transaction.merchant?.logo_url || placeholderLogo" />
                  </q-avatar>
                </div>
                <div class="merchant-details">
                  <div class="merchant-name">{{ transaction.merchant?.business_name || 'Unknown Merchant' }}</div>
                  <div class="merchant-email">{{ transaction.merchant?.email || 'No email' }}</div>
                  <div class="merchant-website" v-if="transaction.merchant?.website">
                    <a :href="transaction.merchant.website" target="_blank">{{ transaction.merchant.website }}</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Timeline -->
            <div class="detail-section timeline-section">
              <h4 class="section-title">Transaction Timeline</h4>
              <div class="timeline">
                <div v-for="(event, index) in transaction.timeline || getDefaultTimeline(transaction)" :key="index"
                  class="timeline-item" :class="{ active: event.completed }">
                  <div class="timeline-icon">
                    <q-icon :name="event.icon" :color="event.completed ? 'green' : 'grey'" />
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">{{ event.title }}</div>
                    <div class="timeline-time">{{ formatDateTime(event.timestamp) }}</div>
                    <div class="timeline-description" v-if="event.description">{{ event.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="detail-section">
              <h4 class="section-title">Additional Details</h4>
              <div class="additional-details">
                <div class="detail-row">
                  <span class="label">Transaction Date:</span>
                  <span class="value">{{ formatDateTime(transaction.created_at) }}</span>
                </div>
                <div class="detail-row" v-if="transaction.updated_at">
                  <span class="label">Last Updated:</span>
                  <span class="value">{{ formatDateTime(transaction.updated_at) }}</span>
                </div>
                <div class="detail-row" v-if="transaction.description">
                  <span class="label">Description:</span>
                  <span class="value">{{ transaction.description }}</span>
                </div>
                <div class="detail-row" v-if="transaction.metadata">
                  <span class="label">Metadata:</span>
                  <span class="value">
                    <pre class="metadata-json">{{ JSON.stringify(transaction.metadata, null, 2) }}</pre>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="loading-state">
          <q-spinner color="lime" size="48px" />
          <div class="loading-text">Loading transaction details...</div>
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-card-section class="modal-footer">
        <div class="footer-actions">
          <div class="action-left">
            <q-btn @click="downloadReceipt" :loading="downloading" icon="download" label="Download Receipt" outline
              color="lime" />
            <q-btn @click="copyTransactionId" icon="content_copy" label="Copy ID" flat color="grey" />
          </div>

          <div class="action-right">
            <q-btn v-if="canRefund" @click="showRefundDialog = true" icon="money_off" label="Refund Transaction"
              color="orange" />
            <q-btn @click="emit('update:modelValue', false)" label="Close" flat color="grey" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Refund Dialog -->
    <q-dialog v-model="showRefundDialog" persistent>
      <q-card class="refund-dialog">
        <q-card-section class="refund-header">
          <h4>Initiate Refund</h4>
          <p>Refund amount for transaction {{ transaction?.id }}</p>
        </q-card-section>

        <q-card-section>
          <div class="refund-options">
            <div class="refund-option">
              <q-radio v-model="refundType" val="full" label="Full Refund" color="lime" />
              <div class="refund-amount">{{ formatCurrency(transaction?.amount || 0) }}</div>
            </div>

            <div class="refund-option">
              <q-radio v-model="refundType" val="partial" label="Partial Refund" color="lime" />
              <q-input v-if="refundType === 'partial'" v-model.number="partialAmount" type="number"
                label="Refund Amount (cents)" outlined dense :min="1" :max="transaction?.amount || 0"
                class="partial-amount-input" />
            </div>
          </div>

          <div class="refund-reason">
            <q-input v-model="refundReason" label="Refund Reason (optional)" outlined dense type="textarea" rows="3"
              placeholder="Please provide a reason for the refund..." />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showRefundDialog = false" />
          <q-btn color="orange" label="Process Refund" @click="processRefund" :loading="processingRefund"
            :disable="!canProcessRefund" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Notify } from 'quasar'
import api from '../../boot/axios'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  transaction: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'refund'])

const downloading = ref(false)
const showRefundDialog = ref(false)
const processingRefund = ref(false)
const refundType = ref('full')
const partialAmount = ref(0)
const refundReason = ref('')

const placeholderLogo = 'https://placehold.co/48x48/121018/bdf000?text=FX'

const canRefund = computed(() => {
  return props.transaction?.status === 'completed' &&
    !props.transaction?.refunded &&
    props.transaction?.amount > 0
})
const canProcessRefund = computed(() => {
  if (refundType.value === 'full') return true
  return partialAmount.value > 0 && partialAmount.value <= (props.transaction?.amount || 0)
})

const formatAmount = (amount) => (amount / 100).toFixed(2)
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
const formatDateTime = (dateString) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
const getCurrencySymbol = (currency) => ({ USD: '$', EUR: '€', GBP: '£', JPY: '¥' }[currency] || '$')

const getStatusClass = (status) => ({
  completed: 'status-success',
  pending: 'status-pending',
  failed: 'status-failed',
  refunded: 'status-refunded',
  cancelled: 'status-cancelled'
}[status] || 'status-unknown')

const getStatusIcon = (status) => ({
  completed: 'check_circle',
  pending: 'hourglass_empty',
  failed: 'error',
  refunded: 'money_off',
  cancelled: 'cancel'
}[status] || 'help')

const getStatusTitle = (status) => ({
  completed: 'Payment Completed',
  pending: 'Payment Pending',
  failed: 'Payment Failed',
  refunded: 'Payment Refunded',
  cancelled: 'Payment Cancelled'
}[status] || 'Unknown Status')

const getStatusDescription = (status) => ({
  completed: 'The payment has been successfully processed',
  pending: 'The payment is being processed',
  failed: 'The payment could not be completed',
  refunded: 'The payment has been refunded to the customer',
  cancelled: 'The payment was cancelled'
}[status] || 'Status information unavailable')

const getMethodIcon = (method) => ({
  card: 'credit_card',
  apple_pay: 'phone_iphone',
  google_pay: 'android',
  paypal: 'payment',
  bank_transfer: 'account_balance'
}[method] || 'payment')

const getMethodColor = (method) => ({
  card: 'blue',
  apple_pay: 'black',
  google_pay: 'green',
  paypal: 'blue',
  bank_transfer: 'purple'
}[method] || 'grey')

const getMethodName = (method) => ({
  card: 'Credit Card',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  paypal: 'PayPal',
  bank_transfer: 'Bank Transfer'
}[method] || 'Unknown Method')

const getDefaultTimeline = (transaction) => {
  const timeline = [
    { title: 'Transaction Created', timestamp: transaction.created_at, icon: 'receipt', completed: true, description: 'Payment request initiated' }
  ]
  if (transaction.status === 'completed') {
    timeline.push({ title: 'Payment Processed', timestamp: transaction.updated_at || transaction.created_at, icon: 'check_circle', completed: true, description: 'Payment successfully completed' })
  } else if (transaction.status === 'failed') {
    timeline.push({ title: 'Payment Failed', timestamp: transaction.updated_at || transaction.created_at, icon: 'error', completed: true, description: 'Payment processing failed' })
  }
  return timeline
}

const downloadReceipt = async () => {
  if (!props.transaction) return
  try {
    downloading.value = true
    const response = await api.get(`/api/transactions/${props.transaction.id}/receipt`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `receipt_${props.transaction.id}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to download receipt' })
  } finally {
    downloading.value = false
  }
}

const copyTransactionId = () => {
  if (!props.transaction?.id) return
  navigator.clipboard.writeText(String(props.transaction.id))
  Notify.create({ type: 'positive', message: 'Transaction ID copied' })
}

const processRefund = async () => {
  if (!props.transaction) return
  try {
    processingRefund.value = true
    const refundAmount = refundType.value === 'full' ? props.transaction.amount : partialAmount.value
    await api.post(`/api/transactions/${props.transaction.id}/refund`, {
      amount: refundAmount,
      reason: refundReason.value
    })
    Notify.create({ type: 'positive', message: 'Refund initiated successfully' })
    emit('refund', props.transaction.id, refundAmount)
    showRefundDialog.value = false
    refundType.value = 'full'
    partialAmount.value = 0
    refundReason.value = ''
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to process refund' })
  } finally {
    processingRefund.value = false
  }
}

watch(refundType, (newType) => {
  if (newType === 'partial' && props.transaction) {
    partialAmount.value = Math.floor(props.transaction.amount / 2)
  }
})
</script>

<style scoped>
.transaction-detail-modal {
  background: linear-gradient(135deg, #000000 0%, #121018 100%);
  color: #ffffff;
  min-height: 100vh;
}

.modal-header {
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  color: #bdf000;
}

.modal-content {
  padding-top: 0;
}

.status-banner {
  border: 1px solid;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.status-success {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.status-pending {
  background: rgba(255, 152, 0, 0.1);
  border-color: rgba(255, 152, 0, 0.3);
}

.status-failed {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
}

.status-refunded {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.status-cancelled {
  background: rgba(158, 158, 158, 0.1);
  border-color: rgba(158, 158, 158, 0.3);
}

.details-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(189, 240, 0, 0.15);
  border-radius: 12px;
  padding: 16px;
}

.amount-section .amount-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.amount-section .currency {
  font-size: 20px;
}

.amount-section .amount {
  font-size: 36px;
  font-weight: 800;
  color: #bdf000;
}

.profile-stats,
.amount-details,
.additional-details {
  margin-top: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}

.detail-row:last-child {
  border-bottom: none;
}

.section-title {
  margin: 0 0 12px 0;
  color: #bdf000;
}

.timeline {
  display: grid;
  gap: 10px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  padding: 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.timeline-item.active {
  background: rgba(189, 240, 0, 0.06);
  border-color: rgba(189, 240, 0, 0.2);
}

.modal-footer {
  border-top: 1px solid rgba(189, 240, 0, 0.15);
}

.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-text {
  margin-top: 12px;
  color: #bdf000;
}

/* Responsive */
@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
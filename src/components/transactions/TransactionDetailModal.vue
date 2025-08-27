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
                </div>
              </div>
            </div>

            <!-- Transaction Timeline -->
            <div class="detail-section full-width">
              <h4 class="section-title">Transaction Timeline</h4>
              <div class="timeline">
                <div class="timeline-item" v-for="(event, index) in transaction.timeline" :key="index">
                  <div class="timeline-icon">
                    <q-icon :name="getTimelineIcon(event.type)" :color="getTimelineColor(event.type)" />
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">{{ event.title }}</div>
                    <div class="timeline-time">{{ formatDateTime(event.timestamp) }}</div>
                    <div class="timeline-description" v-if="event.description">
                      {{ event.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="detail-section full-width">
              <h4 class="section-title">Actions</h4>
              <div class="action-buttons">
                <q-btn
                  v-if="transaction.status === 'success'"
                  color="orange"
                  icon="undo"
                  label="Initiate Refund"
                  @click="initiateRefund"
                  :loading="refunding"
                />
                <q-btn
                  color="blue"
                  icon="download"
                  label="Download Receipt"
                  @click="downloadReceipt"
                />
                <q-btn
                  color="grey"
                  icon="print"
                  label="Print Details"
                  @click="printDetails"
                />
                <q-btn
                  color="lime"
                  icon="share"
                  label="Share Transaction"
                  @click="shareTransaction"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'
import api from '../../boot/axios'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  transaction: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Reactive data
const refunding = ref(false)
const placeholderLogo = 'https://dummyimage.com/200x200/121018/bdf000.png&text=Logo'

// Methods
const getStatusClass = (status) => {
  const classes = {
    success: 'status-success',
    pending: 'status-pending',
    failed: 'status-failed',
    refunded: 'status-refunded',
    cancelled: 'status-cancelled'
  }
  return classes[status] || 'status-unknown'
}

const getStatusIcon = (status) => {
  const icons = {
    success: 'check_circle',
    pending: 'hourglass_empty',
    failed: 'error',
    refunded: 'undo',
    cancelled: 'cancel'
  }
  return icons[status] || 'help'
}

const getStatusTitle = (status) => {
  const titles = {
    success: 'Payment Successful',
    pending: 'Payment Pending',
    failed: 'Payment Failed',
    refunded: 'Payment Refunded',
    cancelled: 'Payment Cancelled'
  }
  return titles[status] || 'Unknown Status'
}

const getStatusDescription = (status) => {
  const descriptions = {
    success: 'Your payment has been processed successfully',
    pending: 'Your payment is being processed',
    failed: 'Your payment could not be processed',
    refunded: 'Your payment has been refunded',
    cancelled: 'Your payment was cancelled'
  }
  return descriptions[status] || 'Status information unavailable'
}

const getCurrencySymbol = (currency) => {
  const symbols = {
    usd: '$',
    eur: '€',
    gbp: '£',
    inr: '₹'
  }
  return symbols[currency?.toLowerCase()] || '$'
}

const formatAmount = (amount) => {
  return (amount / 100).toFixed(2)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const getMethodIcon = (method) => {
  const icons = {
    card: 'credit_card',
    bank_transfer: 'account_balance',
    wallet: 'account_balance_wallet',
    upi: 'smartphone'
  }
  return icons[method] || 'payment'
}

const getMethodColor = (method) => {
  const colors = {
    card: 'blue',
    bank_transfer: 'green',
    wallet: 'purple',
    upi: 'orange'
  }
  return colors[method] || 'grey'
}

const getMethodName = (method) => {
  const names = {
    card: 'Credit/Debit Card',
    bank_transfer: 'Bank Transfer',
    wallet: 'Digital Wallet',
    upi: 'UPI Payment'
  }
  return names[method] || 'Unknown Method'
}

const getTimelineIcon = (type) => {
  const icons = {
    created: 'add_circle',
    processing: 'sync',
    completed: 'check_circle',
    failed: 'error',
    refunded: 'undo'
  }
  return icons[type] || 'info'
}

const getTimelineColor = (type) => {
  const colors = {
    created: 'blue',
    processing: 'orange',
    completed: 'green',
    failed: 'red',
    refunded: 'grey'
  }
  return colors[type] || 'grey'
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleString()
}

const initiateRefund = async () => {
  try {
    refunding.value = true
    await api.post(`/api/transactions/${props.transaction.id}/refund`)
    Notify.create({
      type: 'positive',
      message: 'Refund initiated successfully',
      position: 'top'
    })
    emit('update:modelValue', false)
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to initiate refund',
      position: 'top'
    })
  } finally {
    refunding.value = false
  }
}

const downloadReceipt = () => {
  // Implement receipt download
  console.log('Downloading receipt for transaction:', props.transaction.id)
}

const printDetails = () => {
  window.print()
}

const shareTransaction = () => {
  // Implement sharing functionality
  console.log('Sharing transaction:', props.transaction.id)
}
</script>

<style scoped>
.transaction-detail-modal {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  color: #ffffff;
  max-width: 1200px;
  margin: 0 auto;
}

.modal-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.transaction-id {
  color: #cfcfcf;
  font-size: 0.875rem;
}

.modal-content {
  padding: 32px;
  max-height: 80vh;
  overflow-y: auto;
}

/* Status Banner */
.status-banner {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 32px;
  border: 1px solid;
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
  background: rgba(158, 158, 158, 0.1);
  border-color: rgba(158, 158, 158, 0.3);
}

.status-cancelled {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-subtitle {
  color: #cfcfcf;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #bdf000;
}

/* Amount Section */
.amount-display {
  text-align: center;
  margin-bottom: 20px;
}

.currency {
  font-size: 2rem;
  color: #cfcfcf;
  margin-right: 8px;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: #bdf000;
}

.amount-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #cfcfcf;
}

.value {
  font-weight: 600;
  color: #ffffff;
}

/* Customer Info */
.customer-info, .payment-method, .merchant-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-avatar, .merchant-avatar {
  flex-shrink: 0;
}

.customer-details, .merchant-details {
  flex: 1;
}

.customer-name, .merchant-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.customer-email, .customer-phone, .merchant-email {
  color: #cfcfcf;
  font-size: 0.875rem;
}

/* Payment Method */
.method-icon {
  flex-shrink: 0;
}

.method-details {
  flex: 1;
}

.method-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.method-meta {
  color: #cfcfcf;
  font-size: 0.875rem;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.timeline-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.timeline-time {
  color: #cfcfcf;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.timeline-description {
  color: #cfcfcf;
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .amount {
    font-size: 2rem;
  }
  
  .currency {
    font-size: 1.5rem;
  }
}
</style>
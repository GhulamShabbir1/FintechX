<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="transactions-header text-white" reveal>
      <q-toolbar class="q-py-sm">
        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="receipt_long" class="q-mr-sm text-lime" />
          <span class="text-weight-bold text-lime">Transactions</span>
        </q-toolbar-title>
        
        <q-space />
        
        <!-- Quick Actions -->
        <q-btn flat round dense icon="add" color="lime" @click="showNewTransactionDialog = true">
          <q-tooltip>New Transaction</q-tooltip>
        </q-btn>
        
        <q-btn flat round dense icon="download" color="lime" @click="exportTransactions">
          <q-tooltip>Export Transactions</q-tooltip>
        </q-btn>
        
        <q-btn flat round dense icon="refresh" color="lime" @click="refreshTransactions">
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Page Content -->
    <q-page class="transactions-page">
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <q-spinner-dots color="lime" size="60px" />
        <p class="loading-text">Loading transactions...</p>
      </div>

      <!-- Main Content -->
      <div class="transactions-content">
        <!-- Stats Cards -->
        <div class="stats-section q-mb-xl animate-fade-in" style="animation-delay: 0.1s">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="receipt_long" size="48px" color="lime" class="q-mb-md" />
                  <div class="text-h4 text-lime">{{ transactionStats.total }}</div>
                  <div class="text-caption">Total Transactions</div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="check_circle" size="48px" color="green" class="q-mb-md" />
                  <div class="text-h4 text-green">{{ transactionStats.completed }}</div>
                  <div class="text-caption">Completed</div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="pending" size="48px" color="orange" class="q-mb-md" />
                  <div class="text-h4 text-orange">{{ transactionStats.pending }}</div>
                  <div class="text-caption">Pending</div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="trending_up" size="48px" color="lime" class="q-mb-md" />
                  <div class="text-h4 text-lime">{{ formatCurrency(transactionStats.totalAmount) }}</div>
                  <div class="text-caption">Total Amount</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="filters-section q-mb-lg animate-fade-in" style="animation-delay: 0.2s">
          <q-card class="lime-glow">
            <q-card-section>
              <div class="row q-col-gutter-md items-center">
                <!-- Search -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="filters.search"
                    placeholder="Search transactions..."
                    dense
                    outlined
                    clearable
                    @update:model-value="onSearch"
                    class="search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
                
                <!-- Status Filter -->
                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filters.status"
                    :options="statusOptions"
                    label="Status"
                    dense
                    outlined
                    clearable
                    @update:model-value="onFilter"
                    class="filter-select"
                  />
                </div>
                
                <!-- Payment Method Filter -->
                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filters.paymentMethod"
                    :options="paymentMethodOptions"
                    label="Payment Method"
                    dense
                    outlined
                    clearable
                    @update:model-value="onFilter"
                    class="filter-select"
                  />
                </div>
                
                <!-- Date Range Filter -->
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="dateRangeText"
                    label="Date Range"
                    dense
                    outlined
                    readonly
                    @click="showDatePicker = true"
                    class="date-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="clear" @click="clearDateRange" class="cursor-pointer" />
                    </template>
                  </q-input>
                </div>
                
                <!-- Clear Filters -->
                <div class="col-12 col-md-1">
                  <q-btn
                    flat
                    round
                    dense
                    icon="clear_all"
                    color="grey"
                    @click="clearAllFilters"
                    class="clear-filters-btn"
                  >
                    <q-tooltip>Clear All Filters</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Transactions Table -->
        <div class="table-section animate-fade-in" style="animation-delay: 0.3s">
          <q-card class="lime-glow">
            <q-card-section>
              <q-table
                :rows="paginatedTransactions"
                :columns="transactionColumns"
                :pagination="pagination"
                :loading="loading"
                row-key="id"
                class="transactions-table"
                @request="onRequest"
              >
                <!-- Status Column -->
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip :color="getStatusColor(props.value)" text-color="white"
                      :icon="getStatusIcon(props.value)" size="sm" class="status-chip">
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>

                <!-- Amount Column -->
                <template v-slot:body-cell-amount="props">
                  <q-td :props="props">
                    <span class="amount-value">{{ formatCurrency(props.value) }}</span>
                  </q-td>
                </template>

                <!-- Payment Method Column -->
                <template v-slot:body-cell-payment_method="props">
                  <q-td :props="props">
                    <div class="payment-method">
                      <q-icon :name="getPaymentMethodIcon(props.value)" size="16px" />
                      <span class="method-name">{{ props.value }}</span>
                    </div>
                  </q-td>
                </template>

                <!-- Actions Column -->
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <div class="action-buttons">
                      <q-btn flat round dense icon="visibility" color="blue" 
                        @click="viewTransaction(props.row)" size="sm" class="action-btn">
                        <q-tooltip>View Details</q-tooltip>
                      </q-btn>
                      
                      <!-- Refund Button -->
                      <q-btn v-if="props.row.status === 'completed'" flat round dense icon="money_off" 
                        color="orange" @click="openRefundDialog(props.row)" size="sm" class="action-btn">
                        <q-tooltip>Refund</q-tooltip>
                      </q-btn>
                      
                      <!-- Cancel Button -->
                      <q-btn v-if="props.row.status === 'pending'" flat round dense icon="cancel" 
                        color="red" @click="cancelTransaction(props.row)" size="sm" class="action-btn">
                        <q-tooltip>Cancel</q-tooltip>
                      </q-btn>
                      
                      <!-- Retry Button -->
                      <q-btn v-if="props.row.status === 'failed'" flat round dense icon="refresh" 
                        color="blue" @click="retryTransaction(props.row)" size="sm" class="action-btn">
                        <q-tooltip>Retry</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>

    <!-- Date Range Picker Dialog -->
    <q-dialog v-model="showDatePicker">
      <q-card class="date-picker-dialog">
        <q-card-section>
          <div class="text-h6">Select Date Range</div>
        </q-card-section>
        
        <q-card-section>
          <q-date
            v-model="dateRange"
            range
            color="lime"
            class="date-picker"
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Apply" @click="applyDateRange" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Transaction Dialog -->
    <q-dialog v-model="showNewTransactionDialog" persistent>
      <q-card class="new-transaction-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">New Transaction</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="createNewTransaction" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newTransaction.customer_name"
                  label="Customer Name *"
                  filled
                  required
                  :rules="[val => !!val || 'Customer name is required']"
                />
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newTransaction.customer_email"
                  label="Customer Email *"
                  filled
                  type="email"
                  required
                  :rules="[val => !!val || 'Customer email is required']"
                />
              </div>
            </div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="newTransaction.amount"
                  label="Amount *"
                  filled
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  :rules="[val => val > 0 || 'Amount must be greater than 0']"
                />
              </div>
              
              <div class="col-12 col-md-6">
                <q-select
                  v-model="newTransaction.payment_method"
                  :options="paymentMethodOptions"
                  label="Payment Method *"
                  filled
                  required
                  :rules="[val => !!val || 'Payment method is required']"
                />
              </div>
            </div>
            
            <q-input
              v-model="newTransaction.description"
              label="Description"
              filled
              type="textarea"
              hint="Optional: Transaction description"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Create Transaction" @click="createNewTransaction" 
            :loading="creatingTransaction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Refund Dialog -->
    <q-dialog v-model="showRefundDialog" persistent>
      <q-card class="refund-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Refund Transaction</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="processRefund" class="q-gutter-md">
            <div class="refund-info q-mb-md">
              <p><strong>Transaction ID:</strong> {{ selectedTransaction?.transaction_id }}</p>
              <p><strong>Amount:</strong> {{ formatCurrency(selectedTransaction?.amount) }}</p>
              <p><strong>Customer:</strong> {{ selectedTransaction?.customer_name }}</p>
            </div>
            
            <q-input
              v-model.number="refundData.amount"
              label="Refund Amount *"
              filled
              type="number"
              step="0.01"
              :min="0.01"
              :max="selectedTransaction?.amount"
              required
              :rules="[
                val => val > 0 || 'Amount must be greater than 0',
                val => val <= (selectedTransaction?.amount || 0) || 'Amount cannot exceed transaction amount'
              ]"
            />
            
            <q-input
              v-model="refundData.reason"
              label="Refund Reason *"
              filled
              type="textarea"
              required
              :rules="[val => !!val || 'Refund reason is required']"
              hint="Please provide a reason for the refund"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="orange" label="Process Refund" @click="processRefund" 
            :loading="processingRefund" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Transaction Details Dialog -->
    <q-dialog v-model="showTransactionDetails" maximized>
      <q-card class="transaction-details-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Transaction Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div v-if="selectedTransaction" class="transaction-details">
            <!-- Transaction Header -->
            <div class="transaction-header q-mb-lg">
              <div class="row items-center">
                <div class="col">
                  <h3 class="transaction-id">{{ selectedTransaction.transaction_id }}</h3>
                  <p class="transaction-date">{{ formatDate(selectedTransaction.created_at) }}</p>
                </div>
                <div class="col-auto">
                  <q-chip :color="getStatusColor(selectedTransaction.status)" text-color="white"
                    :icon="getStatusIcon(selectedTransaction.status)" size="lg">
                    {{ selectedTransaction.status }}
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Transaction Info Grid -->
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-card class="info-card">
                  <q-card-section>
                    <h4 class="card-title">Customer Information</h4>
                    <div class="info-item">
                      <span class="label">Name:</span>
                      <span class="value">{{ selectedTransaction.customer_name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Email:</span>
                      <span class="value">{{ selectedTransaction.customer_email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Phone:</span>
                      <span class="value">{{ selectedTransaction.customer_phone || 'N/A' }}</span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              
              <div class="col-12 col-md-6">
                <q-card class="info-card">
                  <q-card-section>
                    <h4 class="card-title">Payment Details</h4>
                    <div class="info-item">
                      <span class="label">Amount:</span>
                      <span class="value amount">{{ formatCurrency(selectedTransaction.amount) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Method:</span>
                      <span class="value">{{ selectedTransaction.payment_method }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Currency:</span>
                      <span class="value">{{ selectedTransaction.currency || 'USD' }}</span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="row q-col-gutter-lg q-mt-lg">
              <div class="col-12">
                <q-card class="info-card">
                  <q-card-section>
                    <h4 class="card-title">Transaction Details</h4>
                    <div class="info-item">
                      <span class="label">Description:</span>
                      <span class="value">{{ selectedTransaction.description || 'No description' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Merchant:</span>
                      <span class="value">{{ selectedTransaction.merchant_name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Gateway:</span>
                      <span class="value">{{ selectedTransaction.gateway || 'N/A' }}</span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Timeline -->
            <div class="row q-col-gutter-lg q-mt-lg">
              <div class="col-12">
                <q-card class="info-card">
                  <q-card-section>
                    <h4 class="card-title">Transaction Timeline</h4>
                    <div class="timeline">
                      <div class="timeline-item" v-for="(event, index) in selectedTransaction.timeline" :key="index">
                        <div class="timeline-icon">
                          <q-icon :name="getTimelineIcon(event.type)" :color="getTimelineColor(event.type)" />
                        </div>
                        <div class="timeline-content">
                          <div class="timeline-title">{{ event.title }}</div>
                          <div class="timeline-description">{{ event.description }}</div>
                          <div class="timeline-time">{{ formatTime(event.timestamp) }}</div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useTransactionsStore } from '../store/transactions'
import { pinia } from '../store/pinia'

const $q = useQuasar()
const transactionsStore = useTransactionsStore(pinia)

// Reactive data
const loading = ref(false)
const showDatePicker = ref(false)
const showNewTransactionDialog = ref(false)
const showRefundDialog = ref(false)
const showTransactionDetails = ref(false)
const creatingTransaction = ref(false)
const processingRefund = ref(false)

// Selected transaction for actions
const selectedTransaction = ref(null)

// New transaction form
const newTransaction = ref({
  customer_name: '',
  customer_email: '',
  amount: null,
  payment_method: '',
  description: ''
})

// Refund form
const refundData = ref({
  amount: null,
  reason: ''
})

// Date range
const dateRange = ref({ from: '', to: '' })

// Computed properties
const transactionStats = computed(() => transactionsStore.transactionStats)
const paginatedTransactions = computed(() => transactionsStore.paginatedTransactions)
const pagination = computed(() => transactionsStore.pagination)
const filters = computed(() => transactionsStore.filters)

const dateRangeText = computed(() => {
  if (!dateRange.value.from && !dateRange.value.to) return ''
  if (dateRange.value.from && dateRange.value.to) {
    return `${formatDate(dateRange.value.from)} - ${formatDate(dateRange.value.to)}`
  }
  return dateRange.value.from || dateRange.value.to
})

// Options for filters
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' }
]

const paymentMethodOptions = [
  { label: 'All Methods', value: '' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'Digital Wallet', value: 'digital_wallet' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'UPI', value: 'upi' },
  { label: 'Cash', value: 'cash' }
]

// Table columns
const transactionColumns = [
  { name: 'transaction_id', label: 'Transaction ID', field: 'transaction_id', align: 'left', sortable: true },
  { name: 'customer_name', label: 'Customer', field: 'customer_name', align: 'left', sortable: true },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right', sortable: true },
  { name: 'payment_method', label: 'Payment Method', field: 'payment_method', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'created_at', label: 'Date', field: 'created_at', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Methods
const loadTransactions = async () => {
  try {
    loading.value = true
    await transactionsStore.loadTransactions()
  } catch (error) {
    console.error('Failed to load transactions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load transactions',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  transactionsStore.updateFilters({ search: filters.value.search })
  loadTransactions()
}

const onFilter = () => {
  loadTransactions()
}

const onRequest = (props) => {
  transactionsStore.updatePagination({
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage
  })
  loadTransactions()
}

const applyDateRange = () => {
  if (dateRange.value.from && dateRange.value.to) {
    transactionsStore.updateFilters({
      dateRange: {
        from: new Date(dateRange.value.from),
        to: new Date(dateRange.value.to)
      }
    })
    loadTransactions()
  }
}

const clearDateRange = () => {
  dateRange.value = { from: '', to: '' }
  transactionsStore.updateFilters({ dateRange: null })
  loadTransactions()
}

const clearAllFilters = () => {
  transactionsStore.clearFilters()
  dateRange.value = { from: '', to: '' }
  loadTransactions()
}

const refreshTransactions = () => {
  loadTransactions()
}

const exportTransactions = async () => {
  try {
    const result = await transactionsStore.exportTransactions('csv')
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Transactions exported successfully',
        position: 'top'
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Export failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export transactions',
      position: 'top'
    })
  }
}

const createNewTransaction = async () => {
  try {
    creatingTransaction.value = true
    
    // Validate form
    if (!newTransaction.value.customer_name || !newTransaction.value.customer_email || 
        !newTransaction.value.amount || !newTransaction.value.payment_method) {
      throw new Error('Please fill in all required fields')
    }

    const result = await transactionsStore.createTransaction({
      customer_name: newTransaction.value.customer_name,
      customer_email: newTransaction.value.customer_email,
      amount: parseFloat(newTransaction.value.amount) * 100, // Convert to cents
      payment_method: newTransaction.value.payment_method,
      description: newTransaction.value.description,
      currency: 'USD'
    })

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Transaction created successfully',
        position: 'top'
      })
      
      showNewTransactionDialog.value = false
      
      // Reset form
      newTransaction.value = {
        customer_name: '',
        customer_email: '',
        amount: null,
        payment_method: '',
        description: ''
      }
      
      // Reload transactions
      await loadTransactions()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Failed to create transaction:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to create transaction',
      position: 'top'
    })
  } finally {
    creatingTransaction.value = false
  }
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetails.value = true
}

// FIXED: Renamed this function to avoid naming conflict
const openRefundDialog = (transaction) => {
  selectedTransaction.value = transaction
  refundData.value.amount = transaction.amount / 100 // Convert from cents
  refundData.value.reason = ''
  showRefundDialog.value = true
}

const processRefund = async () => {
  try {
    processingRefund.value = true
    
    if (!refundData.value.amount || !refundData.value.reason) {
      throw new Error('Please fill in all required fields')
    }

    const result = await transactionsStore.refundTransaction(selectedTransaction.value.id, {
      amount: parseFloat(refundData.value.amount) * 100, // Convert to cents
      reason: refundData.value.reason
    })

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Refund processed successfully',
        position: 'top'
      })
      
      showRefundDialog.value = false
      await loadTransactions()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Failed to process refund:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to process refund',
      position: 'top'
    })
  } finally {
    processingRefund.value = false
  }
}

const cancelTransaction = async (transaction) => {
  try {
    const { reason } = await $q.dialog({
      title: 'Cancel Transaction',
      message: `Are you sure you want to cancel transaction ${transaction.transaction_id}?`,
      prompt: {
        model: '',
        type: 'text',
        label: 'Cancellation Reason (optional)'
      },
      cancel: true,
      persistent: true
    })
    
    const result = await transactionsStore.cancelTransaction(transaction.id, reason || 'Cancelled by merchant')
    
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Transaction cancelled successfully',
        position: 'top'
      })
      
      await loadTransactions()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    if (error) {
      console.error('Failed to cancel transaction:', error)
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to cancel transaction',
        position: 'top'
      })
    }
  }
}

const retryTransaction = async (transaction) => {
  try {
    const result = await $q.dialog({
      title: 'Retry Transaction',
      message: `Are you sure you want to retry transaction ${transaction.transaction_id}?`,
      cancel: true,
      persistent: true
    })
    
    if (result) {
      // Implement retry logic here
      $q.notify({
        type: 'info',
        message: 'Retry functionality coming soon',
        position: 'top'
      })
    }
  } catch (error) {
    console.log("here is you error ",error)
  }
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'grey',
    refunded: 'purple'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'pending',
    processing: 'sync',
    completed: 'check_circle',
    failed: 'error',
    cancelled: 'cancel',
    refunded: 'money_off'
  }
  return icons[status] || 'help'
}

const getPaymentMethodIcon = (method) => {
  const icons = {
    credit_card: 'credit_card',
    debit_card: 'credit_card',
    digital_wallet: 'account_balance_wallet',
    bank_transfer: 'account_balance',
    upi: 'smartphone',
    cash: 'attach_money'
  }
  return icons[method] || 'payment'
}

const getTimelineIcon = (type) => {
  const icons = {
    created: 'add_circle',
    processing: 'sync',
    completed: 'check_circle',
    failed: 'error',
    cancelled: 'cancel',
    refunded: 'money_off'
  }
  return icons[type] || 'info'
}

const getTimelineColor = (type) => {
  const colors = {
    created: 'blue',
    processing: 'orange',
    completed: 'green',
    failed: 'red',
    cancelled: 'grey',
    refunded: 'purple'
  }
  return colors[type] || 'grey'
}

const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100) // Convert from cents
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
/* Base styles */
.transactions-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.transactions-header {
  background: #1a1a1a;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.transactions-content {
  padding: 24px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-text {
  color: #bdf000;
  margin-top: 20px;
  font-size: 1.2rem;
}

/* Stats Section */
.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.2);
}

/* Filters Section */
.filters-section {
  margin-bottom: 24px;
}

.search-input,
.filter-select,
.date-input {
  background: rgba(255, 255, 255, 0.05);
}

.clear-filters-btn {
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* Table Section */
.transactions-table {
  background: transparent;
}

.transactions-table .q-table__top {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 16px;
}

.transactions-table .q-table__bottom {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  margin-top: 16px;
  padding: 16px;
}

.transactions-table .q-table__thead th {
  background: rgba(189, 240, 0, 0.1);
  color: #ffffff;
  font-weight: 600;
  border-bottom: 2px solid rgba(189, 240, 0, 0.2);
  padding: 16px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.transactions-table .q-table__tbody tr:hover {
  background: rgba(189, 240, 0, 0.05);
}

.transactions-table .q-table__tbody td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 12px 16px;
  vertical-align: middle;
}

/* Status Chips */
.status-chip {
  font-weight: 600;
  text-transform: capitalize;
  border-radius: 16px;
}

/* Amount Values */
.amount-value {
  font-weight: 600;
  color: #4caf50;
}

/* Payment Method */
.payment-method {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-name {
  font-size: 0.9rem;
  text-transform: capitalize;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Date Picker Dialog */
.date-picker-dialog {
  min-width: 400px;
  background: #1a1a1a;
  color: #ffffff;
}

.date-picker {
  background: transparent;
}

/* New Transaction Dialog */
.new-transaction-dialog {
  min-width: 600px;
  background: #1a1a1a;
  color: #ffffff;
}

.new-transaction-dialog .q-card-section {
  padding: 24px;
}

.new-transaction-dialog .text-h6 {
  color: #bdf000;
  font-weight: 600;
}

.new-transaction-dialog .q-input {
  margin-bottom: 16px;
}

.new-transaction-dialog .q-input__control {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.new-transaction-dialog .q-field__control {
  background: transparent;
}

.new-transaction-dialog .q-field__native {
  color: #ffffff;
}

.new-transaction-dialog .q-field__label {
  color: #bdf000;
}

.new-transaction-dialog .q-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* Refund Dialog */
.refund-dialog {
  min-width: 500px;
  background: #1a1a1a;
  color: #ffffff;
}

.refund-dialog .q-card-section {
  padding: 24px;
}

.refund-dialog .text-h6 {
  color: #ff9800;
  font-weight: 600;
}

.refund-info {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.refund-info p {
  margin: 8px 0;
  color: #ffffff;
}

.refund-info strong {
  color: #ff9800;
}

/* Transaction Details Dialog */
.transaction-details-dialog {
  background: #1a1a1a;
  color: #ffffff;
}

.transaction-details-dialog .q-card-section {
  padding: 24px;
}

.transaction-details-dialog .text-h6 {
  color: #bdf000;
  font-weight: 600;
}

.transaction-header {
  border-bottom: 2px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 16px;
}

.transaction-id {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.transaction-date {
  color: #999;
  margin: 0;
  font-size: 0.9rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  height: 100%;
}

.info-card .q-card-section {
  padding: 20px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #bdf000;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 600;
  color: 'text-grey-6';
  text-transform: capitalize;
}

.info-item .value {
  color: #ffffff;
  font-weight: 500;
}

.info-item .value.amount {
  color: #4caf50;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Timeline */
.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(189, 240, 0, 0.2);
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(189, 240, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.timeline-description {
  color: #ccc;
  margin-bottom: 8px;
  line-height: 1.4;
}

.timeline-time {
  font-size: 0.8rem;
  color: #999;
}

/* Animations */
.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
  background: #121212;
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 1200px) {
  .transactions-content {
    padding: 20px;
  }
  
  .stat-card {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .transactions-content {
    padding: 16px;
  }
  
  .filters-section .row {
    flex-direction: column;
  }
  
  .filters-section .col {
    margin-bottom: 16px;
  }
  
  .new-transaction-dialog,
  .refund-dialog {
    min-width: 90vw;
    margin: 16px;
  }
  
  .transaction-details-dialog {
    margin: 16px;
  }
  
  .transaction-header .row {
    flex-direction: column;
    text-align: center;
  }
  
  .transaction-header .col-auto {
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .stats-section .row {
    flex-direction: column;
  }
  
  .stat-card {
    margin-bottom: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .stat-card,
  .action-btn {
    animation: none;
    transition: none;
  }
  
  .animate-fade-in {
    opacity: 1;
    transform: none;
  }
  
  .stat-card:hover,
  .action-btn:hover {
    transform: none;
  }
}

/* Enhanced focus states */
.stat-card:focus-visible,
.action-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Smooth scrolling */
.transactions-page {
  scroll-behavior: smooth;
}

/* Performance optimizations */
.stat-card,
.action-btn,
.info-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
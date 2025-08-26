<template>
  <div class="transaction-table-container">
    <!-- Filters Panel -->
    <q-card class="filters-card glass-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Search Input -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.search"
              dense
              outlined
              placeholder="Search transactions..."
              clearable
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Status Filter -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              dense
              outlined
              label="Status"
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- Date Range -->
          <div class="col-12 col-md-3">
            <q-btn
              :label="dateRangeLabel"
              :color="filters.dateRange ? 'lime' : 'grey'"
              outline
              dense
              @click="showDatePicker = true"
              class="full-width"
            />
          </div>

          <!-- Amount Range -->
          <div class="col-12 col-md-2">
            <q-btn
              :label="amountRangeLabel"
              :color="filters.amountRange ? 'lime' : 'grey'"
              outline
              dense
              @click="showAmountFilter = true"
              class="full-width"
            />
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="active-filters q-mt-md">
          <div class="text-caption text-grey-6 q-mb-sm">Active Filters:</div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="filter in activeFiltersList"
              :key="filter.key"
              class="col-auto"
            >
              <q-chip
                :label="filter.label"
                removable
                @remove="removeFilter(filter.key)"
                color="lime"
                text-color="dark"
                size="sm"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Transactions Table -->
    <q-card class="table-card glass-card">
      <q-table
        :rows="transactions"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :filter="tableFilter"
        @request="onRequest"
        class="transactions-table"
      >
        <!-- Custom Header -->
        <template #top>
          <div class="row items-center justify-between full-width">
            <div class="text-h6 text-lime">Transactions</div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                label="Export CSV"
                icon="download"
                color="lime"
                outline
                dense
                @click="exportTransactions"
                :loading="exporting"
              />
              <q-btn
                label="Refresh"
                icon="refresh"
                color="grey"
                outline
                dense
                @click="fetchTransactions"
                :loading="loading"
              />
            </div>
          </div>
        </template>

        <!-- Custom Cell Renderers -->
        <template #body-cell-merchant="props">
          <q-td :props="props">
            <div class="merchant-cell">
              <q-avatar size="32px" class="q-mr-sm">
                <img :src="props.row.merchant?.logo || placeholderLogo" />
              </q-avatar>
              <div>
                <div class="text-weight-medium">{{ props.row.merchant?.name || 'Unknown' }}</div>
                <div class="text-caption text-grey-6">{{ props.row.merchant?.id }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-customer="props">
          <q-td :props="props">
            <div class="customer-cell">
              <div class="text-weight-medium">{{ props.row.customer?.name || 'Anonymous' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.customer?.email }}</div>
            </div>
          </q-td>
        </template>

        <template #body-cell-amount="props">
          <q-td :props="props">
            <div class="amount-cell">
              <div class="text-weight-bold" :class="getAmountColor(props.row.amount)">
                {{ formatAmount(props.row.amount) }}
              </div>
              <div class="text-caption text-grey-6">{{ props.row.currency }}</div>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :label="formatStatus(props.row.status)"
              :color="getStatusColor(props.row.status)"
              text-color="white"
              size="sm"
              class="status-chip"
            />
          </q-td>
        </template>

        <template #body-cell-paymentMethod="props">
          <q-td :props="props">
            <div class="payment-method-cell">
              <q-icon :name="getPaymentMethodIcon(props.row.paymentMethod)" size="20px" />
              <span class="q-ml-sm">{{ formatPaymentMethod(props.row.paymentMethod) }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-createdAt="props">
          <q-td :props="props">
            <div class="date-cell">
              <div class="text-weight-medium">{{ formatDate(props.row.createdAt) }}</div>
              <div class="text-caption text-grey-6">{{ formatTime(props.row.createdAt) }}</div>
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="actions-cell">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                color="lime"
                @click="viewTransaction(props.row)"
                class="action-btn"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              
              <q-btn
                v-if="props.row.status === 'completed'"
                flat
                round
                dense
                icon="receipt"
                color="blue"
                @click="downloadReceipt(props.row)"
                class="action-btn"
              >
                <q-tooltip>Download Receipt</q-tooltip>
              </q-btn>
              
              <q-btn
                v-if="canRefund(props.row)"
                flat
                round
                dense
                icon="undo"
                color="orange"
                @click="initiateRefund(props.row)"
                class="action-btn"
              >
                <q-tooltip>Refund</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                color="grey"
                @click="showContextMenu($event, props.row)"
                class="action-btn"
              >
                <q-tooltip>More Options</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="empty-state text-center q-pa-lg">
            <q-icon name="receipt_long" size="64px" color="grey-6" />
            <div class="text-h6 text-grey-6 q-mt-md">No transactions found</div>
            <div class="text-caption text-grey-5 q-mt-sm">
              Try adjusting your filters or search terms
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Date Range Picker Dialog -->
    <q-dialog v-model="showDatePicker">
      <q-card class="date-picker-modal glass-card">
        <q-card-section>
          <div class="text-h6">Select Date Range</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="filters.dateRange.from"
                type="date"
                outlined
                dense
                label="From Date"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="filters.dateRange.to"
                type="date"
                outlined
                dense
                label="To Date"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Clear" color="grey" @click="clearDateRange" />
          <q-btn label="Apply" color="lime" @click="applyDateRange" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Amount Range Filter Dialog -->
    <q-dialog v-model="showAmountFilter">
      <q-card class="amount-filter-modal glass-card">
        <q-card-section>
          <div class="text-h6">Set Amount Range</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="filters.amountRange.min"
                type="number"
                outlined
                dense
                label="Min Amount"
                step="0.01"
                min="0"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="filters.amountRange.max"
                type="number"
                outlined
                dense
                label="Max Amount"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Clear" color="grey" @click="clearAmountRange" />
          <q-btn label="Apply" color="lime" @click="applyAmountRange" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Transaction Detail Modal -->
    <TransactionDetailModal
      v-model="showDetailModal"
      :transaction="selectedTransaction"
      @refund-success="handleRefundSuccess"
    />

    <!-- Context Menu -->
    <q-menu
      ref="contextMenu"
      :model-value="showContextMenu"
      @update:model-value="showContextMenu = false"
    >
      <q-list style="min-width: 150px">
        <q-item clickable v-close-popup @click="viewTransaction(contextMenuTransaction)">
          <q-item-section avatar>
            <q-icon name="visibility" />
          </q-item-section>
          <q-item-section>View Details</q-item-section>
        </q-item>
        
        <q-item 
          v-if="canRefund(contextMenuTransaction)"
          clickable 
          v-close-popup 
          @click="initiateRefund(contextMenuTransaction)"
        >
          <q-item-section avatar>
            <q-icon name="undo" />
          </q-item-section>
          <q-item-section>Refund</q-item-section>
        </q-item>
        
        <q-item 
          v-if="contextMenuTransaction?.status === 'completed'"
          clickable 
          v-close-popup 
          @click="downloadReceipt(contextMenuTransaction)"
        >
          <q-item-section avatar>
            <q-icon name="receipt" />
          </q-item-section>
          <q-item-section>Download Receipt</q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item clickable v-close-popup @click="copyTransactionId(contextMenuTransaction)">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>Copy ID</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'
import TransactionDetailModal from './TransactionDetailModal.vue'

// Props
const props = defineProps({
  merchantId: {
    type: String,
    default: ''
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 30000 // 30 seconds
  }
})

// Emits
const emit = defineEmits([
  'transaction-selected',
  'refund-initiated',
  'export-completed'
])

// Quasar
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const exporting = ref(false)
const transactions = ref([])
const selectedTransaction = ref(null)
const showDetailModal = ref(false)
const showDatePicker = ref(false)
const showAmountFilter = ref(false)
const showContextMenu = ref(false)
const contextMenuTransaction = ref(null)

// Filters
const filters = ref({
  search: '',
  status: '',
  dateRange: {
    from: '',
    to: ''
  },
  amountRange: {
    min: null,
    max: null
  },
  merchantId: props.merchantId
})

// Pagination
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

// Computed
const statusOptions = computed(() => [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' }
])

const tableFilter = computed(() => {
  return {
    search: filters.value.search,
    status: filters.value.status,
    dateFrom: filters.value.dateRange.from,
    dateTo: filters.value.dateRange.to,
    amountMin: filters.value.amountRange.min,
    amountMax: filters.value.amountRange.max,
    merchantId: filters.value.merchantId
  }
})

const hasActiveFilters = computed(() => {
  return filters.value.search ||
         filters.value.status ||
         filters.value.dateRange.from ||
         filters.value.dateRange.to ||
         filters.value.amountRange.min ||
         filters.value.amountRange.max
})

const activeFiltersList = computed(() => {
  const active = []
  
  if (filters.value.search) {
    active.push({ key: 'search', label: `Search: "${filters.value.search}"` })
  }
  
  if (filters.value.status) {
    const statusLabel = statusOptions.value.find(s => s.value === filters.value.status)?.label
    active.push({ key: 'status', label: `Status: ${statusLabel}` })
  }
  
  if (filters.value.dateRange.from || filters.value.dateRange.to) {
    const from = filters.value.dateRange.from || 'Any'
    const to = filters.value.dateRange.to || 'Any'
    active.push({ key: 'dateRange', label: `Date: ${from} to ${to}` })
  }
  
  if (filters.value.amountRange.min || filters.value.amountRange.max) {
    const min = filters.value.amountRange.min || 'Any'
    const max = filters.value.amountRange.max || 'Any'
    active.push({ key: 'amountRange', label: `Amount: ${min} - ${max}` })
  }
  
  return active
})

const dateRangeLabel = computed(() => {
  if (filters.value.dateRange.from && filters.value.dateRange.to) {
    return `${filters.value.dateRange.from} - ${filters.value.dateRange.to}`
  }
  return 'Date Range'
})

const amountRangeLabel = computed(() => {
  if (filters.value.amountRange.min || filters.value.amountRange.max) {
    const min = filters.value.amountRange.min || 'Any'
    const max = filters.value.amountRange.max || 'Any'
    return `${min} - ${max}`
  }
  return 'Amount Range'
})

const placeholderLogo = computed(() => {
  return 'https://placehold.co/32x32/121018/bdf000?text=M'
})

// Table columns
const columns = [
  {
    name: 'id',
    label: 'Transaction ID',
    field: 'id',
    align: 'left',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'merchant',
    label: 'Merchant',
    field: row => row.merchant?.name || 'Unknown',
    align: 'left',
    sortable: true,
    style: 'width: 200px'
  },
  {
    name: 'customer',
    label: 'Customer',
    field: row => row.customer?.name || 'Anonymous',
    align: 'left',
    sortable: true,
    style: 'width: 180px'
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'paymentMethod',
    label: 'Payment Method',
    field: 'paymentMethod',
    align: 'left',
    sortable: true,
    style: 'width: 150px'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'createdAt',
    label: 'Date & Time',
    field: 'createdAt',
    align: 'left',
    sortable: true,
    style: 'width: 160px'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    sortable: false,
    style: 'width: 120px'
  }
]

// Methods
const fetchTransactions = async () => {
  loading.value = true
  
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...tableFilter.value
    }
    
    const response = await api.get('/api/transactions', { params })
    transactions.value = response.data.transactions
    pagination.value.rowsNumber = response.data.total
    
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load transactions',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const onRequest = (props) => {
  pagination.value = props.pagination
  fetchTransactions()
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
  emit('transaction-selected', transaction)
}

const initiateRefund = (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
  emit('refund-initiated', transaction)
}

const handleRefundSuccess = () => {
  // Refresh the table to show updated status
  fetchTransactions()
  $q.notify({
    type: 'positive',
    message: 'Refund initiated successfully',
    position: 'top'
  })
}

const downloadReceipt = () => {
  // Implementation for downloading receipt
  $q.notify({
    type: 'info',
    message: 'Receipt download feature coming soon',
    position: 'top'
  })
}

const showContextMenu = (event, transaction) => {
  contextMenuTransaction.value = transaction
  showContextMenu.value = true
}

const copyTransactionId = (transaction) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(transaction.id)
    $q.notify({
      type: 'positive',
      message: 'Transaction ID copied to clipboard',
      position: 'top'
    })
  }
}

const removeFilter = (filterKey) => {
  if (filterKey === 'search') {
    filters.value.search = ''
  } else if (filterKey === 'status') {
    filters.value.status = ''
  } else if (filterKey === 'dateRange') {
    filters.value.dateRange = { from: '', to: '' }
  } else if (filterKey === 'amountRange') {
    filters.value.amountRange = { min: null, max: null }
  }
}

const applyDateRange = () => {
  showDatePicker.value = false
  fetchTransactions()
}

const clearDateRange = () => {
  filters.value.dateRange = { from: '', to: '' }
}

const applyAmountRange = () => {
  showAmountFilter.value = false
  fetchTransactions()
}

const clearAmountRange = () => {
  filters.value.amountRange = { min: null, max: null }
}

const exportTransactions = async () => {
  exporting.value = true
  
  try {
    const params = {
      format: 'csv',
      ...tableFilter.value
    }
    
    const response = await api.get('/api/transactions/export', { 
      params,
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    $q.notify({
      type: 'positive',
      message: 'Transactions exported successfully',
      position: 'top'
    })
    
    emit('export-completed')
    
  } catch (error) {
    console.error('Failed to export transactions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export transactions',
      position: 'top'
    })
  } finally {
    exporting.value = false
  }
}

// Utility methods
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2)
}

const getAmountColor = (amount) => {
  if (amount > 0) return 'text-positive'
  if (amount < 0) return 'text-negative'
  return 'text-grey'
}

const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    refunded: 'purple',
    cancelled: 'grey'
  }
  return colorMap[status] || 'grey'
}

const formatPaymentMethod = (method) => {
  const methodMap = {
    card: 'Credit Card',
    wallet: 'Digital Wallet',
    bank: 'Bank Transfer',
    crypto: 'Cryptocurrency'
  }
  return methodMap[method] || method
}

const getPaymentMethodIcon = (method) => {
  const iconMap = {
    card: 'credit_card',
    wallet: 'account_balance_wallet',
    bank: 'account_balance',
    crypto: 'currency_bitcoin'
  }
  return iconMap[method] || 'payment'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleTimeString()
}

const canRefund = (transaction) => {
  return transaction?.status === 'completed' && 
         !transaction?.refunded &&
         transaction?.amount > 0
}

// Watchers
watch(filters, () => {
  pagination.value.page = 1
  fetchTransactions()
}, { deep: true })

watch(() => props.merchantId, (newId) => {
  filters.value.merchantId = newId
  fetchTransactions()
})

// Lifecycle
onMounted(() => {
  fetchTransactions()
  
  // Auto-refresh if enabled
  if (props.autoRefresh) {
    const interval = setInterval(fetchTransactions, props.refreshInterval)
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})
</script>

<style scoped>
.transaction-table-container {
  padding: 20px;
}

.filters-card {
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(189, 240, 0.1);
}

.search-input {
  background: rgba(255, 255, 255, 0.05);
}

.active-filters {
  border-top: 1px solid rgba(189, 240, 0.1);
  padding-top: 16px;
}

.table-card {
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(189, 240, 0.1);
}

.transactions-table {
  background: transparent;
}

.merchant-cell,
.customer-cell {
  display: flex;
  align-items: center;
}

.amount-cell {
  text-align: right;
}

.status-chip {
  font-weight: 500;
}

.payment-method-cell {
  display: flex;
  align-items: center;
}

.date-cell {
  text-align: left;
}

.actions-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.empty-state {
  color: #9e9e9e;
}

.date-picker-modal,
.amount-filter-modal {
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  min-width: 400px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .transaction-table-container {
    padding: 16px;
  }
  
  .filters-card .row {
    flex-direction: column;
  }
  
  .filters-card .col {
    margin-bottom: 16px;
  }
  
  .date-picker-modal,
  .amount-filter-modal {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .transaction-table-container {
    padding: 12px;
  }
  
  .actions-cell {
    flex-direction: column;
    gap: 2px;
  }
}
</style>

<template>
  <div class="transaction-table-container">
    <!-- Filters and Search Bar -->
    <div class="filters-section q-mb-md">
      <q-card class="filters-card glass-card">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Search -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="filters.search"
                dense
                outlined
                placeholder="Search transactions..."
                clearable
                class="search-input"
                @update:model-value="handleSearch"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="lime" />
                </template>
              </q-input>
            </div>

            <!-- Status Filter -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                dense
                outlined
                label="Status"
                emit-value
                map-options
                @update:model-value="handleFilterChange"
              />
            </div>

            <!-- Date Range -->
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.dateRange"
                dense
                outlined
                label="Date Range"
                readonly
                @click="showDatePicker = true"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="lime" />
                </template>
                <template v-slot:append>
                  <q-icon name="calendar_today" color="lime" />
                </template>
              </q-input>
            </div>

            <!-- Merchant Filter -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="filters.merchantId"
                :options="merchantOptions"
                dense
                outlined
                label="Merchant"
                emit-value
                map-options
                @update:model-value="handleFilterChange"
              />
            </div>

            <!-- Amount Range -->
            <div class="col-12 col-md-1">
              <q-btn
                icon="tune"
                color="lime"
                flat
                round
                dense
                @click="showAmountFilter = true"
              />
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="active-filters q-mt-sm">
            <q-chip
              v-for="filter in activeFiltersList"
              :key="filter.key"
              removable
              color="lime"
              text-color="dark"
              @remove="removeFilter(filter.key)"
            >
              {{ filter.label }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Transactions Table -->
    <q-card class="table-card glass-card">
      <q-card-section class="table-header">
        <div class="row items-center justify-between">
          <div class="col">
            <h5 class="table-title q-my-none">
              Transactions
              <span v-if="totalCount" class="text-caption text-grey">
                ({{ totalCount }} total)
              </span>
            </h5>
          </div>
          <div class="col-auto">
            <q-btn
              icon="file_download"
              label="Export CSV"
              color="lime"
              flat
              @click="exportTransactions"
              :loading="exporting"
            />
          </div>
        </div>
      </q-card-section>

      <q-table
        :rows="transactions"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        class="transactions-table"
      >
        <!-- Amount Column -->
        <template #body-cell-amount="props">
          <q-td :props="props">
            <div class="amount-cell">
              <span class="currency">{{ props.row.currency || '$' }}</span>
              <span class="amount" :class="getAmountClass(props.row.amount)">
                {{ formatAmount(props.row.amount) }}
              </span>
            </div>
          </q-td>
        </template>

        <!-- Status Column -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="getStatusColor(props.row.status)"
              :text-color="getStatusTextColor(props.row.status)"
              size="sm"
              class="status-chip"
            >
              {{ formatStatus(props.row.status) }}
            </q-chip>
          </q-td>
        </template>

        <!-- Date Column -->
        <template #body-cell-createdAt="props">
          <q-td :props="props">
            <div class="date-cell">
              <div class="date">{{ formatDate(props.row.createdAt) }}</div>
              <div class="time">{{ formatTime(props.row.createdAt) }}</div>
            </div>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="actions-cell">
              <q-btn
                dense
                flat
                round
                icon="visibility"
                color="lime"
                @click="viewTransaction(props.row)"
                class="action-btn"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              
              <q-btn
                v-if="canRefund(props.row)"
                dense
                flat
                round
                icon="undo"
                color="orange"
                @click="initiateRefund(props.row)"
                class="action-btn"
              >
                <q-tooltip>Refund</q-tooltip>
              </q-btn>

              <q-btn
                dense
                flat
                round
                icon="more_vert"
                color="grey"
                @click="showTransactionMenu(props.row, $event)"
                class="action-btn"
              >
                <q-tooltip>More Options</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="no-data">
            <q-icon name="receipt_long" size="64px" color="grey-6" />
            <div class="text-h6 text-grey-6 q-mt-md">No transactions found</div>
            <div class="text-caption text-grey-5">
              Try adjusting your filters or search terms
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Date Range Picker Dialog -->
    <q-dialog v-model="showDatePicker">
      <q-card class="date-picker-dialog">
        <q-card-section>
          <div class="text-h6">Select Date Range</div>
        </q-card-section>
        <q-card-section>
          <q-date
            v-model="filters.dateRange"
            range
            color="lime"
            @update:model-value="handleDateRangeChange"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Apply" color="lime" @click="applyDateRange" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Amount Filter Dialog -->
    <q-dialog v-model="showAmountFilter">
      <q-card class="amount-filter-dialog">
        <q-card-section>
          <div class="text-h6">Amount Range</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="filters.minAmount"
                type="number"
                dense
                outlined
                label="Min Amount"
                step="0.01"
                min="0"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="filters.maxAmount"
                type="number"
                dense
                outlined
                label="Max Amount"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Apply" color="lime" @click="applyAmountFilter" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Transaction Detail Modal -->
    <TransactionDetailModal
      v-model="showDetailModal"
      :transaction="selectedTransaction"
      @refund="handleRefundSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'
import TransactionDetailModal from './TransactionDetailModal.vue'

// Props
const props = defineProps({
  merchantId: {
    type: String,
    default: null
  },
  autoRefresh: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['transaction-viewed', 'refund-initiated'])

// Quasar
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const exporting = ref(false)
const transactions = ref([])
const totalCount = ref(0)
const merchants = ref([])
const showDatePicker = ref(false)
const showAmountFilter = ref(false)
const showDetailModal = ref(false)
const selectedTransaction = ref(null)

// Filters
const filters = ref({
  search: '',
  status: '',
  dateRange: { from: '', to: '' },
  merchantId: props.merchantId || '',
  minAmount: null,
  maxAmount: null
})

// Pagination
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

// Options
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' }
]

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
    field: row => row.merchant?.business_name || 'N/A',
    align: 'left',
    sortable: true
  },
  {
    name: 'customer',
    label: 'Customer',
    field: row => row.customer?.email || row.customer?.name || 'N/A',
    align: 'left',
    sortable: true
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
    name: 'method',
    label: 'Payment Method',
    field: 'payment_method',
    align: 'left',
    sortable: true,
    style: 'width: 140px'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true,
    style: 'width: 100px'
  },
  {
    name: 'createdAt',
    label: 'Date & Time',
    field: 'createdAt',
    align: 'left',
    sortable: true,
    style: 'width: 140px'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    style: 'width: 120px'
  }
]

// Computed
const hasActiveFilters = computed(() => {
  return filters.value.search || 
         filters.value.status || 
         filters.value.merchantId || 
         filters.value.minAmount || 
         filters.value.maxAmount ||
         (filters.value.dateRange.from && filters.value.dateRange.to)
})

const activeFiltersList = computed(() => {
  const active = []
  
  if (filters.value.search) {
    active.push({ key: 'search', label: `Search: "${filters.value.search}"` })
  }
  
  if (filters.value.status) {
    const status = statusOptions.find(s => s.value === filters.value.status)
    if (status) {
      active.push({ key: 'status', label: `Status: ${status.label}` })
    }
  }
  
  if (filters.value.merchantId) {
    const merchant = merchants.value.find(m => m.id === filters.value.merchantId)
    if (merchant) {
      active.push({ key: 'merchantId', label: `Merchant: ${merchant.business_name}` })
    }
  }
  
  if (filters.value.minAmount || filters.value.maxAmount) {
    const range = []
    if (filters.value.minAmount) range.push(`Min: $${filters.value.minAmount}`)
    if (filters.value.maxAmount) range.push(`Max: $${filters.value.maxAmount}`)
    active.push({ key: 'amount', label: `Amount: ${range.join(', ')}` })
  }
  
  if (filters.value.dateRange.from && filters.value.dateRange.to) {
    active.push({ 
      key: 'dateRange', 
      label: `Date: ${filters.value.dateRange.from} to ${filters.value.dateRange.to}` 
    })
  }
  
  return active
})

const merchantOptions = computed(() => {
  const options = [{ label: 'All Merchants', value: '' }]
  merchants.value.forEach(merchant => {
    options.push({
      label: merchant.business_name,
      value: merchant.id
    })
  })
  return options
})

// Methods
const fetchTransactions = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      ...filters.value
    }

    // Clean up params
    if (params.dateRange.from && params.dateRange.to) {
      params.fromDate = params.dateRange.from
      params.toDate = params.dateRange.to
    }
    delete params.dateRange

    const response = await api.get('/api/transactions', { params })
    transactions.value = response.data.transactions || response.data
    totalCount.value = response.data.total || response.data.length || 0
    pagination.value.rowsNumber = totalCount.value
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

const fetchMerchants = async () => {
  try {
    const response = await api.get('/api/merchants')
    merchants.value = response.data
  } catch (error) {
    console.error('Failed to fetch merchants:', error)
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchTransactions()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchTransactions()
}

const handleDateRangeChange = () => {
  // Date range is updated automatically
}

const applyDateRange = () => {
  handleFilterChange()
}

const applyAmountFilter = () => {
  handleFilterChange()
}

const removeFilter = (key) => {
  if (key === 'search') filters.value.search = ''
  else if (key === 'status') filters.value.status = ''
  else if (key === 'merchantId') filters.value.merchantId = props.merchantId || ''
  else if (key === 'amount') {
    filters.value.minAmount = null
    filters.value.maxAmount = null
  }
  else if (key === 'dateRange') {
    filters.value.dateRange = { from: '', to: '' }
  }
  handleFilterChange()
}

const onRequest = (props) => {
  pagination.value = props.pagination
  fetchTransactions()
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
  emit('transaction-viewed', transaction)
}

const canRefund = (transaction) => {
  return transaction.status === 'completed' && 
         !transaction.refunded &&
         transaction.amount > 0
}

const initiateRefund = (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
  emit('refund-initiated', transaction)
}

const handleRefundSuccess = (transaction) => {
  // Refresh the table to show updated status
  fetchTransactions()
  $q.notify({
    type: 'positive',
    message: 'Refund initiated successfully',
    position: 'top'
  })
}

const showTransactionMenu = (transaction, event) => {
  // Show context menu with additional options
  $q.menu({
    target: event.target,
    items: [
      {
        label: 'View Details',
        icon: 'visibility',
        action: () => viewTransaction(transaction)
      },
      {
        label: 'Copy Transaction ID',
        icon: 'content_copy',
        action: () => {
          navigator.clipboard.writeText(transaction.id)
          $q.notify({
            type: 'positive',
            message: 'Transaction ID copied to clipboard',
            position: 'top'
          })
        }
      },
      {
        label: 'Download Receipt',
        icon: 'receipt',
        action: () => downloadReceipt(transaction)
      }
    ]
  })
}

const downloadReceipt = (transaction) => {
  // Implementation for downloading receipt
  $q.notify({
    type: 'info',
    message: 'Receipt download feature coming soon',
    position: 'top'
  })
}

const exportTransactions = async () => {
  exporting.value = true
  try {
    const params = { ...filters.value, format: 'csv' }
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

const getAmountClass = (amount) => {
  if (!amount || amount === 0) return 'amount-zero'
  return amount > 0 ? 'amount-positive' : 'amount-negative'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    processing: 'blue',
    completed: 'positive',
    failed: 'negative',
    refunded: 'grey',
    cancelled: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusTextColor = (status) => {
  return status === 'completed' ? 'white' : 'dark'
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Watchers
watch(() => props.merchantId, (newId) => {
  if (newId !== filters.value.merchantId) {
    filters.value.merchantId = newId
    fetchTransactions()
  }
})

// Auto-refresh
let refreshInterval
if (props.autoRefresh) {
  refreshInterval = setInterval(fetchTransactions, 30000) // Refresh every 30 seconds
}

// Lifecycle
onMounted(() => {
  fetchMerchants()
  fetchTransactions()
})

// Cleanup
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.transaction-table-container {
  width: 100%;
}

.filters-card {
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
}

.search-input {
  background: rgba(255, 255, 255, 0.05);
}

.table-card {
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
}

.table-header {
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.table-title {
  color: #ffffff;
  font-weight: 600;
}

.transactions-table {
  background: transparent;
}

.amount-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.currency {
  font-size: 12px;
  color: #bdf000;
  font-weight: 500;
}

.amount {
  font-weight: 600;
  font-size: 14px;
}

.amount-positive {
  color: #4caf50;
}

.amount-negative {
  color: #f44336;
}

.amount-zero {
  color: #9e9e9e;
}

.status-chip {
  font-weight: 500;
  min-width: 80px;
  justify-content: center;
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date {
  font-weight: 500;
  color: #ffffff;
}

.time {
  font-size: 12px;
  color: #9e9e9e;
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

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
}

.date-picker-dialog,
.amount-filter-dialog {
  min-width: 400px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filters-section .row {
    flex-direction: column;
  }
  
  .col-12 {
    margin-bottom: 16px;
  }
  
  .table-card {
    overflow-x: auto;
  }
}
</style>

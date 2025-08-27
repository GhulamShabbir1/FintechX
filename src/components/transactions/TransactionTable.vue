<template>
  <div class="transaction-table-container">
    <!-- Filters and Search -->
    <div class="table-filters q-mb-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
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
        
        <div class="col-12 col-md-2">
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
        
        <div class="col-12 col-md-2">
          <q-select
            v-model="filters.method"
            :options="methodOptions"
            dense
            outlined
            label="Payment Method"
            clearable
            emit-value
            map-options
          />
        </div>
        
        <div class="col-12 col-md-2">
          <q-input
            v-model="filters.fromDate"
            type="date"
            dense
            outlined
            label="From Date"
            clearable
          />
        </div>
        
        <div class="col-12 col-md-2">
          <q-input
            v-model="filters.toDate"
            type="date"
            dense
            outlined
            label="To Date"
            clearable
          />
        </div>
        
        <div class="col-12 col-md-1">
          <q-btn
            color="lime"
            icon="refresh"
            dense
            @click="refreshData"
            :loading="loading"
            class="refresh-btn"
          />
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards q-mb-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3" v-for="summary in summaryData" :key="summary.title">
          <q-card class="summary-card">
            <q-card-section class="text-center">
              <div class="summary-icon" :style="{ backgroundColor: summary.color + '20' }">
                <q-icon :name="summary.icon" :color="summary.color" size="24px" />
              </div>
              <div class="summary-value">{{ summary.value }}</div>
              <div class="summary-title">{{ summary.title }}</div>
              <div class="summary-change" :class="summary.trend">
                {{ summary.change }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <q-card class="table-card">
      <q-table
        :rows="transactions"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        class="transactions-table"
        flat
        bordered
      >
        <!-- Custom cell templates -->
        <template #body-cell-amount="props">
          <q-td :props="props">
            <div class="amount-cell">
              <span class="currency">{{ getCurrencySymbol(props.row.currency) }}</span>
              <span class="amount">{{ formatAmount(props.row.amount) }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="getStatusColor(props.row.status)"
              :label="props.row.status"
              size="sm"
              class="status-chip"
            />
          </q-td>
        </template>

        <template #body-cell-customer="props">
          <q-td :props="props">
            <div class="customer-cell">
              <q-avatar size="32px" class="q-mr-sm">
                <q-icon name="person" />
              </q-avatar>
              <div>
                <div class="customer-name">{{ props.row.customer?.name || 'Anonymous' }}</div>
                <div class="customer-email">{{ props.row.customer?.email || 'No email' }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-created_at="props">
          <q-td :props="props">
            <div class="date-cell">
              <div class="date">{{ formatDate(props.row.created_at) }}</div>
              <div class="time">{{ formatTime(props.row.created_at) }}</div>
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
                @click="$emit('view', props.row)"
                class="action-btn"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              
              <q-btn
                v-if="props.row.status === 'success'"
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
                icon="download"
                color="blue"
                @click="downloadReceipt(props.row)"
                class="action-btn"
              >
                <q-tooltip>Download Receipt</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="no-data">
            <q-icon name="receipt" size="64px" color="grey-6" />
            <div class="no-data-text">No transactions found</div>
            <div class="no-data-subtext">Try adjusting your filters or search criteria</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Export Options -->
    <div class="export-actions q-mt-lg">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-btn
            outline
            color="lime"
            icon="file_download"
            label="Export CSV"
            @click="exportCsv"
            :loading="exporting"
          />
        </div>
        
        <div class="col-auto">
          <q-btn
            outline
            color="lime"
            icon="print"
            label="Print Report"
            @click="printReport"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTransactionsStore } from '../../store/transactions'
import { Notify } from 'quasar'
import { pinia } from '../../store/pinia'

const transactionsStore = useTransactionsStore(pinia)

// Emits
defineEmits(['view'])

// Reactive data
const loading = ref(false)
const exporting = ref(false)
const transactions = ref([])
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

// Filters
const filters = reactive({
  search: '',
  status: '',
  method: '',
  fromDate: '',
  toDate: ''
})

// Options
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' }
]

const methodOptions = [
  { label: 'All Methods', value: '' },
  { label: 'Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Wallet', value: 'wallet' },
  { label: 'UPI', value: 'upi' }
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
    name: 'customer',
    label: 'Customer',
    field: 'customer',
    align: 'left',
    sortable: false,
    style: 'width: 200px'
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
    label: 'Method',
    field: 'method',
    align: 'center',
    sortable: true,
    style: 'width: 100px'
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
    name: 'created_at',
    label: 'Date & Time',
    field: 'created_at',
    align: 'left',
    sortable: true,
    style: 'width: 150px'
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

// Computed properties
const summaryData = computed(() => [
  {
    title: 'Total Transactions',
    value: pagination.value.rowsNumber,
    icon: 'receipt',
    color: 'lime',
    change: '+12.5%',
    trend: 'positive'
  },
  {
    title: 'Total Revenue',
    value: formatCurrency(calculateTotalRevenue()),
    icon: 'trending_up',
    color: 'green',
    change: '+8.2%',
    trend: 'positive'
  },
  {
    title: 'Success Rate',
    value: calculateSuccessRate() + '%',
    icon: 'check_circle',
    color: 'blue',
    change: '+2.1%',
    trend: 'positive'
  },
  {
    title: 'Average Amount',
    value: formatCurrency(calculateAverageAmount()),
    icon: 'account_balance',
    color: 'purple',
    change: '+5.3%',
    trend: 'positive'
  }
])

// Methods
const loadTransactions = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      sort_by: pagination.value.sortBy,
      sort_desc: pagination.value.descending,
      search: filters.search,
      status: filters.status,
      method: filters.method,
      from_date: filters.fromDate,
      to_date: filters.toDate
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key] && params[key] !== 0) delete params[key]
    })
    
    const response = await transactionsStore.fetchForMerchant(params)
    
    if (response.transactions) {
      transactions.value = response.transactions
      pagination.value.rowsNumber = response.total || response.transactions.length
    } else {
      transactions.value = Array.isArray(response) ? response : []
      pagination.value.rowsNumber = transactions.value.length
    }
    
  } catch {
    Notify.create({
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
  loadTransactions()
}

const refreshData = () => {
  loadTransactions()
}

const initiateRefund = async (transaction) => {
  try {
    await transactionsStore.refundTransaction(transaction.id)
    Notify.create({
      type: 'positive',
      message: 'Refund initiated successfully',
      position: 'top'
    })
    loadTransactions()
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to initiate refund',
      position: 'top'
    })
  }
}

const downloadReceipt = (transaction) => {
  // Implement receipt download
  console.log('Downloading receipt for transaction:', transaction.id)
}

const exportCsv = async () => {
  try {
    exporting.value = true
    
    const params = {
      search: filters.search,
      status: filters.status,
      method: filters.method,
      from_date: filters.fromDate,
      to_date: filters.toDate
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key] && params[key] !== 0) delete params[key]
    })
    
    await transactionsStore.exportCsv(params)
    
    Notify.create({
      type: 'positive',
      message: 'CSV exported successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Export error:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export CSV',
      position: 'top'
    })
  } finally {
    exporting.value = false
  }
}

const printReport = () => {
  window.print()
}

// Utility methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const formatAmount = (amount) => {
  return (amount / 100).toFixed(2)
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

const getStatusColor = (status) => {
  const colors = {
    success: 'green',
    pending: 'orange',
    failed: 'red',
    refunded: 'grey',
    cancelled: 'red'
  }
  return colors[status] || 'grey'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString()
}

const calculateTotalRevenue = () => {
  return transactions.value
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
}

const calculateSuccessRate = () => {
  if (transactions.value.length === 0) return 0
  const successful = transactions.value.filter(t => t.status === 'success').length
  return Math.round((successful / transactions.value.length) * 100)
}

const calculateAverageAmount = () => {
  if (transactions.value.length === 0) return 0
  const total = transactions.value.reduce((sum, t) => sum + (t.amount || 0), 0)
  return Math.round(total / transactions.value.length)
}

// Watchers
watch(filters, () => {
  pagination.value.page = 1
  loadTransactions()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
.transaction-table-container {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  padding: 24px;
}

/* Filters */
.table-filters {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
}

.search-input :deep(.q-field__native) {
  color: #ffffff !important;
}

.refresh-btn {
  background: rgba(189, 240, 0.1);
}

/* Summary Cards */
.summary-cards {
  margin-bottom: 32px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  border-color: rgba(189, 240, 0.3);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.summary-title {
  font-size: 0.875rem;
  color: #cfcfcf;
  margin-bottom: 8px;
}

.summary-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.summary-change.positive {
  color: #4caf50;
}

.summary-change.negative {
  color: #f44336;
}

/* Table Card */
.table-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.transactions-table {
  background: transparent;
}

.transactions-table :deep(.q-table__top) {
  background: transparent;
}

.transactions-table :deep(.q-table__container) {
  background: transparent;
}

.transactions-table :deep(.q-table__thead) {
  background: rgba(255, 255, 255, 0.05);
}

.transactions-table :deep(.q-table__thead th) {
  color: #ffffff;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.transactions-table :deep(.q-table__tbody tr) {
  background: transparent;
  transition: all 0.2s ease;
}

.transactions-table :deep(.q-table__tbody tr:hover) {
  background: rgba(189, 240, 0.05);
}

.transactions-table :deep(.q-table__tbody td) {
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Custom Cell Styles */
.amount-cell {
  text-align: right;
}

.currency {
  color: #cfcfcf;
  margin-right: 4px;
}

.amount {
  color: #bdf000;
  font-weight: 600;
}

.status-chip {
  font-weight: 500;
}

.customer-cell {
  display: flex;
  align-items: center;
}

.customer-name {
  font-weight: 500;
  color: #ffffff;
}

.customer-email {
  font-size: 0.75rem;
  color: #cfcfcf;
}

.date-cell {
  text-align: left;
}

.date {
  font-weight: 500;
  color: #ffffff;
}

.time {
  font-size: 0.75rem;
  color: #cfcfcf;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
}

.action-btn:hover {
  background: rgba(189, 240, 0.1);
}

/* No Data State */
.no-data {
  text-align: center;
  padding: 48px 24px;
}

.no-data-text {
  font-size: 1.25rem;
  color: #ffffff;
  margin: 16px 0 8px 0;
}

.no-data-subtext {
  color: #cfcfcf;
}

/* Export Actions */
.export-actions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}


/* Responsive */
@media (max-width: 768px) {
  .transaction-table-container {
    padding: 16px;
  }
  
  .table-filters {
    padding: 16px;
  }
  
  .summary-cards .row {
    margin: 0;
  }
  
  .summary-cards .col-md-3 {
    margin-bottom: 16px;
  }
  
  .actions-cell {
    flex-direction: column;
    gap: 4px;
  }
  
  .customer-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
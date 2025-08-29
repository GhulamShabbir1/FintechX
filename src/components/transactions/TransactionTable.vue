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
            @update:model-value="debouncedSearch"
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
            @update:model-value="applyFilters"
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
            @update:model-value="applyFilters"
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
            @update:model-value="applyFilters"
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
            @update:model-value="applyFilters"
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

    <!-- Export Actions -->
    <div class="export-actions q-mb-md">
      <q-btn
        color="lime"
        icon="download"
        label="Export CSV"
        @click="exportCSV"
        :loading="exporting"
        class="q-mr-md"
      />
      <q-btn
        color="secondary"
        icon="print"
        label="Print Report"
        @click="printReport"
      />
    </div>

    <!-- Transactions Table -->
    <q-table
      :rows="transactions"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @request="onRequest"
      class="transactions-table"
    >
      <!-- Status Column -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.value)"
            :label="props.value"
            size="sm"
            :icon="getStatusIcon(props.value)"
          />
        </q-td>
      </template>

      <!-- Amount Column -->
      <template v-slot:body-cell-amount="props">
        <q-td :props="props">
          <span class="text-weight-medium">
            {{ formatCurrency(props.value) }}
          </span>
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="blue"
              @click="viewTransaction(props.row)"
              size="sm"
            >
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
            
            <q-btn
              v-if="props.row.status === 'completed'"
              flat
              round
              dense
              icon="refresh"
              color="orange"
              @click="initiateRefund(props.row)"
              size="sm"
            >
              <q-tooltip>Initiate Refund</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Transaction Detail Modal -->
    <TransactionDetailModal
      v-model="showDetailModal"
      :transaction="selectedTransaction"
      @refund-requested="onRefundRequested"
    />

    <!-- Refund Modal -->
    <q-dialog v-model="showRefundModal" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Initiate Refund</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="refundAmount"
            type="number"
            label="Refund Amount"
            :hint="`Max: ${formatCurrency(selectedTransaction?.amount || 0)}`"
            outlined
            dense
          />
          <q-input
            v-model="refundReason"
            type="textarea"
            label="Refund Reason"
            outlined
            dense
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Process Refund"
            color="negative"
            @click="processRefund"
            :loading="processingRefund"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { debounce } from 'lodash-es'
import api from '../../boot/axios'
import TransactionDetailModal from './TransactionDetailModal.vue'

const $q = useQuasar()

// Reactive data
const loading = ref(false)
const exporting = ref(false)
const processingRefund = ref(false)
const transactions = ref([])
const showDetailModal = ref(false)
const showRefundModal = ref(false)
const selectedTransaction = ref(null)
const refundAmount = ref(0)
const refundReason = ref('')

// Filters
const filters = ref({
  search: '',
  status: '',
  method: '',
  fromDate: '',
  toDate: ''
})

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

// Options
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' }
]

const methodOptions = [
  { label: 'Card', value: 'card' },
  { label: 'UPI', value: 'upi' },
  { label: 'Wallet', value: 'wallet' },
  { label: 'Bank Transfer', value: 'bank_transfer' }
]

// Table columns
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'customer_name', label: 'Customer', field: 'customer_name', sortable: true, align: 'left' },
  { name: 'amount', label: 'Amount', field: 'amount', sortable: true, align: 'right' },
  { name: 'method', label: 'Method', field: 'method', sortable: true, align: 'center' },
  { name: 'status', label: 'Status', field: 'status', sortable: true, align: 'center' },
  { name: 'created_at', label: 'Date', field: 'created_at', sortable: true, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

// Computed
const summaryData = computed(() => [
  {
    title: 'Total Transactions',
    value: transactions.value.length,
    icon: 'receipt_long',
    color: 'blue',
    change: '+12%',
    trend: 'positive'
  },
  {
    title: 'Total Revenue',
    value: formatCurrency(transactions.value.reduce((sum, t) => sum + (t.amount || 0), 0)),
    icon: 'attach_money',
    color: 'green',
    change: '+8%',
    trend: 'positive'
  },
  {
    title: 'Success Rate',
    value: `${Math.round((transactions.value.filter(t => t.status === 'completed').length / transactions.value.length) * 100)}%`,
    icon: 'check_circle',
    color: 'lime',
    change: '+2%',
    trend: 'positive'
  },
  {
    title: 'Pending',
    value: transactions.value.filter(t => t.status === 'pending').length,
    icon: 'pending',
    color: 'orange',
    change: '-5%',
    trend: 'negative'
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
      sort_desc: pagination.value.descending ? 1 : 0,
      ...filters.value
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key] && params[key] !== 0) delete params[key]
    })
    
    const response = await api.get('/api/merchant/transactions', { params })
    
    if (response.data.success) {
      transactions.value = response.data.transactions || []
      pagination.value.rowsNumber = response.data.total || transactions.value.length
    } else {
      throw new Error(response.data.message || 'Failed to load transactions')
    }
    
  } catch (error) {
    console.error('Error loading transactions:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to load transactions',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const applyFilters = () => {
  pagination.value.page = 1
  loadTransactions()
}

const refreshData = () => {
  loadTransactions()
}

const onRequest = (props) => {
  pagination.value = props.pagination
  loadTransactions()
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

const initiateRefund = (transaction) => {
  selectedTransaction.value = transaction
  refundAmount.value = transaction.amount
  refundReason.value = ''
  showRefundModal.value = true
}

const processRefund = async () => {
  try {
    processingRefund.value = true
    
    const response = await api.post(`/api/transactions/${selectedTransaction.value.id}/refund`, {
      amount: refundAmount.value,
      reason: refundReason.value
    })
    
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: 'Refund initiated successfully',
        position: 'top'
      })
      
      showRefundModal.value = false
      loadTransactions() // Refresh data
    } else {
      throw new Error(response.data.message || 'Refund failed')
    }
    
  } catch (error) {
    console.error('Refund error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to process refund',
      position: 'top'
    })
  } finally {
    processingRefund.value = false
  }
}

const exportCSV = async () => {
  try {
    exporting.value = true
    
    const params = { ...filters.value }
    Object.keys(params).forEach(key => {
      if (!params[key] && params[key] !== 0) delete params[key]
    })
    
    const response = await api.get('/api/merchant/transactions/export', {
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
      message: 'CSV exported successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Export error:', error)
    $q.notify({
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

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
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
    refunded: 'refresh'
  }
  return icons[status] || 'help'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100) // Assuming amount is in cents
}

const onRefundRequested = () => {
  showDetailModal.value = false
  loadTransactions()
}

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
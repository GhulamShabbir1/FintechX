<template>
  <div class="stats-dashboard">
    <!-- KPI Summary Cards -->
    <div class="kpi-summary q-mb-lg">
      <TopKpiCards 
        :data="kpiData" 
        :loading="kpiLoading"
        @refresh="refreshKpiData"
      />
    </div>

    <!-- Filters Panel -->
    <div class="filters-section q-mb-lg">
      <FiltersPanel 
        v-model="dashboardFilters"
        @filter-change="handleFilterChange"
        :merchants="merchants"
        :loading="filtersLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Revenue Chart -->
      <div class="chart-card">
        <div class="card-header">
          <div class="header-content">
            <h3 class="card-title">Revenue Trends</h3>
            <div class="period-selector">
              <q-btn-toggle
                v-model="chartPeriods.revenue"
                :options="periodOptions"
                dense
                flat
                color="lime"
                @update:model-value="updateRevenueChart"
              />
            </div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshRevenueData" />
            <q-btn flat round dense icon="more_vert" color="lime" @click="showRevenueMenu" />
          </div>
        </div>
        <div class="chart-container">
          <RevenueChart 
            :data="revenueData" 
            :loading="revenueLoading"
            :period="chartPeriods.revenue"
            @period-change="updateRevenueChart"
          />
        </div>
      </div>

      <!-- Payment Methods Distribution -->
      <div class="chart-card">
        <div class="card-header">
          <div class="header-content">
            <h3 class="card-title">Payment Methods</h3>
            <div class="chart-type-selector">
              <q-btn-toggle
                v-model="chartTypes.methods"
                :options="[
                  { label: 'Pie', value: 'pie' },
                  { label: 'Bar', value: 'bar' }
                ]"
                dense
                flat
                color="lime"
                @update:model-value="updateMethodsChart"
              />
            </div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshMethodsData" />
            <q-btn flat round dense icon="more_vert" color="lime" @click="showMethodsMenu" />
          </div>
        </div>
        <div class="chart-container">
          <MethodsDistributionCharts 
            :data="methodsData" 
            :loading="methodsLoading"
            :chart-type="chartTypes.methods"
            @chart-type-change="updateMethodsChart"
          />
        </div>
      </div>

      <!-- Transaction Trends -->
      <div class="chart-card full-width">
        <div class="card-header">
          <div class="header-content">
            <h3 class="card-title">Transaction Trends</h3>
            <div class="trend-selector">
              <q-select
                v-model="selectedTrends"
                :options="trendOptions"
                dense
                outlined
                multiple
                use-chips
                color="lime"
                @update:model-value="updateTrendsChart"
              />
            </div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshTrendsData" />
            <q-btn flat round dense icon="more_vert" color="lime" @click="showTrendsMenu" />
          </div>
        </div>
        <div class="chart-container">
          <TransactionTrendsChart 
            :data="trendsData" 
            :loading="trendsLoading"
            :selected-metrics="selectedTrends"
            @metrics-change="updateTrendsChart"
          />
        </div>
      </div>

      <!-- Average Checkout Time -->
      <div class="chart-card">
        <div class="card-header">
          <div class="header-content">
            <h3 class="card-title">Checkout Time</h3>
            <div class="time-unit-selector">
              <q-select
                v-model="timeUnit"
                :options="timeUnitOptions"
                dense
                outlined
                color="lime"
                @update:model-value="updateCheckoutTimeChart"
              />
            </div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshCheckoutTimeData" />
            <q-btn flat round dense icon="more_vert" color="lime" @click="showCheckoutTimeMenu" />
          </div>
        </div>
        <div class="chart-container">
          <AvgCheckoutTimeChart 
            :data="checkoutTimeData" 
            :labels="checkoutTimeLabels"
            :loading="checkoutTimeLoading"
            :time-unit="timeUnit"
            @time-unit-change="updateCheckoutTimeChart"
          />
        </div>
      </div>

      <!-- Top Geographies -->
      <div class="chart-card">
        <div class="card-header">
          <div class="header-content">
            <h3 class="card-title">Top Geographies</h3>
            <div class="geo-limit-selector">
              <q-input
                v-model.number="geoLimit"
                type="number"
                dense
                outlined
                label="Top N"
                min="5"
                max="20"
                color="lime"
                @update:model-value="updateGeographyChart"
              />
            </div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshGeographyData" />
            <q-btn flat round dense icon="more_vert" color="lime" @click="showGeographyMenu" />
          </div>
        </div>
        <div class="chart-container">
          <HorizontalBarChart 
            :data="geographyData" 
            :labels="geographyLabels"
            :loading="geographyLoading"
            :limit="geoLimit"
            title="Geographic Distribution"
            @limit-change="updateGeographyChart"
          />
        </div>
      </div>

      <!-- Customer Analytics -->
      <div class="chart-card full-width">
        <div class="card-header">
          <div class="header-content">
            <h3 class="card-title">Customer Analytics</h3>
            <div class="customer-metric-selector">
              <q-select
                v-model="customerMetric"
                :options="customerMetricOptions"
                dense
                outlined
                color="lime"
                @update:model-value="updateCustomerAnalytics"
              />
            </div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshCustomerData" />
            <q-btn flat round dense icon="more_vert" color="lime" @click="showCustomerMenu" />
          </div>
        </div>
        <div class="chart-container">
          <HistogramChart 
            :data="customerData" 
            :loading="customerLoading"
            :metric="customerMetric"
            title="Customer Distribution"
            @metric-change="updateCustomerAnalytics"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="overallLoading" class="loading-overlay">
      <q-spinner-dots color="lime" size="50px" />
      <p class="loading-text">Loading analytics data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-overlay">
      <q-card class="error-card glass-card">
        <q-card-section class="text-center">
          <div class="error-icon">
            <q-icon name="error" size="64px" color="negative" />
          </div>
          <div class="text-h5 text-negative q-mt-md">Failed to Load Data</div>
          <div class="text-subtitle1 q-mt-sm text-grey-6">
            {{ error }}
          </div>
          <q-btn
            label="Retry"
            class="btn-primary q-mt-lg"
            @click="retryLoading"
            :loading="retrying"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Export Options -->
    <div class="export-section q-mt-lg">
      <q-card class="export-card glass-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="col">
              <h6 class="export-title q-my-none">Export Analytics</h6>
              <p class="export-subtitle">Download reports and data for further analysis</p>
            </div>
            <div class="col-auto">
              <q-btn
                icon="file_download"
                label="Export All Data"
                color="lime"
                flat
                @click="exportAllData"
                :loading="exporting"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'
import TopKpiCards from './TopKpiCards.vue'
import FiltersPanel from './FiltersPanel.vue'
import RevenueChart from './charts/RevenueChart.vue'
import MethodsDistributionCharts from './charts/MethodsDistributionCharts.vue'
import TransactionTrendsChart from './charts/TransactionTrendsChart.vue'
import AvgCheckoutTimeChart from './charts/AvgCheckoutTimeChart.vue'
import HorizontalBarChart from './charts/HorizontalBarChart.vue'
import HistogramChart from './charts/HistogramChart.vue'

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
const emit = defineEmits(['data-loaded', 'filter-changed', 'export-requested'])

// Quasar
const $q = useQuasar()

// Reactive data
const overallLoading = ref(false)
const retrying = ref(false)
const exporting = ref(false)
const error = ref(null)

// KPI Data
const kpiLoading = ref(false)
const kpiData = ref({
  totalRevenue: 0,
  totalTransactions: 0,
  successRate: 0,
  averageOrderValue: 0
})

// Chart Data
const revenueLoading = ref(false)
const methodsLoading = ref(false)
const trendsLoading = ref(false)
const checkoutTimeLoading = ref(false)
const geographyLoading = ref(false)
const customerLoading = ref(false)
const filtersLoading = ref(false)

const revenueData = ref([])
const methodsData = ref([])
const trendsData = ref([])
const checkoutTimeData = ref([])
const checkoutTimeLabels = ref([])
const geographyData = ref([])
const geographyLabels = ref([])
const customerData = ref([])

// Filters
const dashboardFilters = ref({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  merchantId: props.merchantId || '',
  currency: 'USD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
})

// Chart Configuration
const chartPeriods = ref({
  revenue: 'monthly',
  trends: 'weekly',
  checkoutTime: 'daily'
})

const chartTypes = ref({
  methods: 'pie',
  geography: 'bar'
})

const selectedTrends = ref(['successful', 'failed'])
const timeUnit = ref('minutes')
const geoLimit = ref(10)
const customerMetric = ref('order_value')

// Options
const periodOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' }
]

const timeUnitOptions = [
  { label: 'Seconds', value: 'seconds' },
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours', value: 'hours' }
]

const customerMetricOptions = [
  { label: 'Order Value', value: 'order_value' },
  { label: 'Frequency', value: 'frequency' },
  { label: 'Recency', value: 'recency' },
  { label: 'Lifetime Value', value: 'lifetime_value' }
]

const trendOptions = [
  { label: 'Successful', value: 'successful' },
  { label: 'Failed', value: 'failed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' }
]

// Merchants for filter
const merchants = ref([])

// Computed
const hasFilters = computed(() => {
  return dashboardFilters.value.startDate && 
         dashboardFilters.value.endDate
})

// Methods
const fetchAllData = async () => {
  if (!hasFilters.value) return
  
  overallLoading.value = true
  error.value = null
  
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId,
      currency: dashboardFilters.value.currency,
      timezone: dashboardFilters.value.timezone
    }
    
    // Fetch all data in parallel
    const [
      kpiResponse,
      revenueResponse,
      methodsResponse,
      trendsResponse,
      checkoutTimeResponse,
      geographyResponse,
      customerResponse
    ] = await Promise.all([
      api.get('/api/stats/kpi', { params }),
      api.get('/api/stats/revenue', { params }),
      api.get('/api/stats/methods', { params }),
      api.get('/api/stats/transactions', { params }),
      api.get('/api/stats/checkout-time', { params }),
      api.get('/api/stats/geography', { params }),
      api.get('/api/stats/customers', { params })
    ])
    
    // Update data
    kpiData.value = kpiResponse.data
    revenueData.value = revenueResponse.data
    methodsData.value = methodsResponse.data
    trendsData.value = trendsResponse.data
    checkoutTimeData.value = checkoutTimeResponse.data.values || []
    checkoutTimeLabels.value = checkoutTimeResponse.data.labels || []
    geographyData.value = geographyResponse.data.values || []
    geographyLabels.value = geographyResponse.data.labels || []
    customerData.value = customerResponse.data
    
    emit('data-loaded', {
      kpi: kpiData.value,
      revenue: revenueData.value,
      methods: methodsData.value,
      trends: trendsData.value,
      checkoutTime: checkoutTimeData.value,
      geography: geographyData.value,
      customer: customerData.value
    })
    
  } catch (err) {
    console.error('Failed to fetch stats data:', err)
    error.value = err.response?.data?.message || 'Failed to load analytics data'
    
    // Load demo data on error
    loadDemoData()
  } finally {
    overallLoading.value = false
  }
}

const fetchMerchants = async () => {
  try {
    const response = await api.get('/api/merchants')
    merchants.value = response.data
  } catch (err) {
    console.error('Failed to fetch merchants:', err)
  }
}

const loadDemoData = () => {
  // Demo KPI data
  kpiData.value = {
    totalRevenue: 1250000,
    totalTransactions: 15420,
    successRate: 96.8,
    averageOrderValue: 81.1
  }
  
  // Demo revenue data
  revenueData.value = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 68000 }
  ]
  
  // Demo methods data
  methodsData.value = [
    { method: 'Credit Card', percentage: 45, count: 6939 },
    { method: 'Debit Card', percentage: 28, count: 4318 },
    { method: 'Digital Wallet', percentage: 18, count: 2776 },
    { method: 'Bank Transfer', percentage: 9, count: 1387 }
  ]
  
  // Demo trends data
  trendsData.value = [
    { month: 'Jan', successful: 120, failed: 8, pending: 5 },
    { month: 'Feb', successful: 135, failed: 6, pending: 3 },
    { month: 'Mar', successful: 142, failed: 12, pending: 7 },
    { month: 'Apr', successful: 158, failed: 9, pending: 4 },
    { month: 'May', successful: 165, failed: 7, pending: 2 },
    { month: 'Jun', successful: 184, failed: 11, pending: 6 }
  ]
  
  // Demo checkout time data
  checkoutTimeData.value = [2.3, 2.1, 2.5, 2.0, 1.8, 2.2, 1.9]
  checkoutTimeLabels.value = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Demo geography data
  geographyData.value = [45, 32, 28, 22, 18]
  geographyLabels.value = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia']
  
  // Demo customer data
  customerData.value = {
    distribution: [120, 85, 65, 45, 30, 20, 15],
    labels: ['$0-50', '$51-100', '$101-200', '$201-500', '$501-1000', '$1001-2000', '$2000+']
  }
}

const handleFilterChange = (newFilters) => {
  dashboardFilters.value = { ...newFilters }
  emit('filter-changed', newFilters)
  fetchAllData()
}

const refreshKpiData = async () => {
  kpiLoading.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId
    }
    const response = await api.get('/api/stats/kpi', { params })
    kpiData.value = response.data
  } catch (err) {
    console.error('Failed to refresh KPI data:', err)
  } finally {
    kpiLoading.value = false
  }
}

const refreshRevenueData = async () => {
  revenueLoading.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId,
      period: chartPeriods.value.revenue
    }
    const response = await api.get('/api/stats/revenue', { params })
    revenueData.value = response.data
  } catch (err) {
    console.error('Failed to refresh revenue data:', err)
  } finally {
    revenueLoading.value = false
  }
}

const refreshMethodsData = async () => {
  methodsLoading.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId
    }
    const response = await api.get('/api/stats/methods', { params })
    methodsData.value = response.data
  } catch (err) {
    console.error('Failed to refresh methods data:', err)
  } finally {
    methodsLoading.value = false
  }
}

const refreshTrendsData = async () => {
  trendsLoading.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId,
      metrics: selectedTrends.value
    }
    const response = await api.get('/api/stats/transactions', { params })
    trendsData.value = response.data
  } catch (err) {
    console.error('Failed to refresh trends data:', err)
  } finally {
    trendsLoading.value = false
  }
}

const refreshCheckoutTimeData = async () => {
  checkoutTimeLoading.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId,
      timeUnit: timeUnit.value
    }
    const response = await api.get('/api/stats/checkout-time', { params })
    checkoutTimeData.value = response.data.values || []
    checkoutTimeLabels.value = response.data.labels || []
  } catch (err) {
    console.error('Failed to refresh checkout time data:', err)
  } finally {
    checkoutTimeLoading.value = false
  }
}

const refreshGeographyData = async () => {
  geographyLoading.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId,
      limit: geoLimit.value
    }
    const response = await api.get('/api/stats/geography', { params })
    geographyData.value = response.data.values || []
    geographyLabels.value = response.data.labels || []
  } catch (err) {
    console.error('Failed to refresh geography data:', err)
  } finally {
    geographyLoading.value = false
  }
}

const refreshCustomerData = async () => {
  customerLoading.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId,
      metric: customerMetric.value
    }
    const response = await api.get('/api/stats/customers', { params })
    customerData.value = response.data
  } catch (err) {
    console.error('Failed to refresh customer data:', err)
  } finally {
    customerLoading.value = false
  }
}

const updateRevenueChart = (period) => {
  chartPeriods.value.revenue = period
  refreshRevenueData()
}

const updateMethodsChart = (chartType) => {
  chartTypes.value.methods = chartType
}

const updateTrendsChart = (metrics) => {
  selectedTrends.value = metrics
  refreshTrendsData()
}

const updateCheckoutTimeChart = (unit) => {
  timeUnit.value = unit
  refreshCheckoutTimeData()
}

const updateGeographyChart = (limit) => {
  geoLimit.value = limit
  refreshGeographyData()
}

const updateCustomerAnalytics = (metric) => {
  customerMetric.value = metric
  refreshCustomerData()
}

const retryLoading = async () => {
  retrying.value = true
  error.value = null
  await fetchAllData()
  retrying.value = false
}

const exportAllData = async () => {
  exporting.value = true
  try {
    const params = {
      startDate: dashboardFilters.value.startDate,
      endDate: dashboardFilters.value.endDate,
      merchantId: dashboardFilters.value.merchantId,
      format: 'xlsx'
    }
    
    const response = await api.get('/api/stats/export', { 
      params,
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `analytics-${dashboardFilters.value.startDate}-to-${dashboardFilters.value.endDate}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    emit('export-requested', params)
    
    $q.notify({
      type: 'positive',
      message: 'Analytics data exported successfully',
      position: 'top'
    })
  } catch (err) {
    console.error('Failed to export data:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to export analytics data',
      position: 'top'
    })
  } finally {
    exporting.value = false
  }
}

// Menu handlers
const showRevenueMenu = () => {
  $q.menu({
    target: event.target,
    items: [
      { label: 'Download Data', icon: 'download', action: () => downloadChartData('revenue') },
      { label: 'Share Chart', icon: 'share', action: () => shareChart('revenue') }
    ]
  })
}

const showMethodsMenu = () => {
  $q.menu({
    target: event.target,
    items: [
      { label: 'Download Data', icon: 'download', action: () => downloadChartData('methods') },
      { label: 'Share Chart', icon: 'share', action: () => shareChart('methods') }
    ]
  })
}

const showTrendsMenu = () => {
  $q.menu({
    target: event.target,
    items: [
      { label: 'Download Data', icon: 'download', action: () => downloadChartData('trends') },
      { label: 'Share Chart', icon: 'share', action: () => shareChart('trends') }
    ]
  })
}

const showCheckoutTimeMenu = () => {
  $q.menu({
    target: event.target,
    items: [
      { label: 'Download Data', icon: 'download', action: () => downloadChartData('checkoutTime') },
      { label: 'Share Chart', icon: 'share', action: () => shareChart('checkoutTime') }
    ]
  })
}

const showGeographyMenu = () => {
  $q.menu({
    target: event.target,
    items: [
      { label: 'Download Data', icon: 'download', action: () => downloadChartData('geography') },
      { label: 'Share Chart', icon: 'share', action: () => shareChart('geography') }
    ]
  })
}

const showCustomerMenu = () => {
  $q.menu({
    target: event.target,
    items: [
      { label: 'Download Data', icon: 'download', action: () => downloadChartData('customer') },
      { label: 'Share Chart', icon: 'share', action: () => shareChart('customer') }
    ]
  })
}

const downloadChartData = (chartType) => {
  // Implementation for downloading specific chart data
  $q.notify({
    type: 'info',
    message: `${chartType} data download coming soon`,
    position: 'top'
  })
}

const shareChart = (chartType) => {
  // Implementation for sharing charts
  $q.notify({
    type: 'info',
    message: `${chartType} sharing feature coming soon`,
    position: 'top'
  })
}

// Watchers
watch(() => props.merchantId, (newId) => {
  if (newId !== dashboardFilters.value.merchantId) {
    dashboardFilters.value.merchantId = newId
    fetchAllData()
  }
})

// Auto-refresh
let refreshInterval
if (props.autoRefresh) {
  refreshInterval = setInterval(fetchAllData, 300000) // Refresh every 5 minutes
}

// Lifecycle
onMounted(() => {
  fetchMerchants()
  fetchAllData()
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.stats-dashboard {
  position: relative;
  min-height: 400px;
}

.kpi-summary {
  margin-bottom: 24px;
}

.filters-section {
  margin-bottom: 24px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  background: rgba(18, 18, 18, 0.8);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.chart-card:hover {
  border-color: rgba(189, 240, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.period-selector,
.chart-type-selector,
.trend-selector,
.time-unit-selector,
.geo-limit-selector,
.customer-metric-selector {
  min-width: 120px;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
}

.loading-text {
  color: #bdf000;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
}

.error-card {
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(10px);
}

.error-icon {
  margin-bottom: 16px;
}

.export-section {
  margin-top: 24px;
}

.export-card {
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
}

.export-title {
  color: #ffffff;
  font-weight: 600;
  margin: 0;
}

.export-subtitle {
  color: #9e9e9e;
  margin: 8px 0 0 0;
  font-size: 14px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .chart-card {
    padding: 20px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .period-selector,
  .chart-type-selector,
  .trend-selector,
  .time-unit-selector,
  .geo-limit-selector,
  .customer-metric-selector {
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .chart-card {
    padding: 16px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
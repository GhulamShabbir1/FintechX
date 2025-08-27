<template>
  <div class="stats-dashboard">
    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Revenue Chart -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">Revenue Trends</h3>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshData" />
            <q-btn flat round dense icon="more_vert" color="lime" />
          </div>
        </div>
        <div class="chart-container">
          <RevenueChart :data="revenueData" />
        </div>
      </div>

      <!-- Payment Methods Distribution -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">Payment Methods</h3>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshData" />
            <q-btn flat round dense icon="more_vert" color="lime" />
          </div>
        </div>
        <div class="chart-container">
          <MethodsDistributionCharts :data="methodsData" />
        </div>
      </div>

      <!-- Transaction Trends -->
      <div class="chart-card full-width">
        <div class="card-header">
          <h3 class="card-title">Transaction Trends</h3>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshData" />
            <q-btn flat round dense icon="more_vert" color="lime" />
          </div>
        </div>
        <div class="chart-container">
          <TransactionTrendsChart :data="trendsData" />
        </div>
      </div>

      <!-- Average Checkout Time -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">Checkout Time</h3>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshData" />
            <q-btn flat round dense icon="more_vert" color="lime" />
          </div>
        </div>
        <div class="chart-container">
          <AvgCheckoutTimeChart :data="checkoutTimeData" :labels="checkoutTimeLabels" />
        </div>
      </div>

      <!-- Top Geographies -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">Top Geographies</h3>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="refreshData" />
            <q-btn flat round dense icon="more_vert" color="lime" />
          </div>
        </div>
        <div class="chart-container">
          <HorizontalBarChart 
            :data="geographyData" 
            :labels="geographyLabels"
            title="Geographic Distribution"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="50px" />
      <p class="loading-text">Loading analytics data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRefs, onMounted } from 'vue'
import api from '../../boot/axios'
import RevenueChart from './charts/RevenueChart.vue'
import MethodsDistributionCharts from './charts/MethodsDistributionCharts.vue'
import TransactionTrendsChart from './charts/TransactionTrendsChart.vue'
import AvgCheckoutTimeChart from './charts/AvgCheckoutTimeChart.vue'
import HorizontalBarChart from './charts/HorizontalBarChart.vue'

// Props
const props = defineProps({ 
  filters: { 
    type: Object, 
    default: () => ({}) 
  } 
})

// Reactive data
const loading = ref(false)
const revenueData = ref([])
const methodsData = ref([])
const trendsData = ref([])
const checkoutTimeData = ref([])
const checkoutTimeLabels = ref([])
const geographyData = ref([])
const geographyLabels = ref([])

// Destructure props for watchers
const { filters } = toRefs(props)

// Methods
const loadRevenueData = async () => {
  try {
    const { data } = await api.get('/api/stats/revenue', { params: filters.value })
    revenueData.value = data.data || []
  } catch (error) {
    console.error('Error loading revenue data:', error)
    revenueData.value = generateMockRevenueData()
  }
}

const loadMethodsData = async () => {
  try {
    const { data } = await api.get('/api/stats/methods', { params: filters.value })
    methodsData.value = data.data || []
  } catch (error) {
    console.error('Error loading methods data:', error)
    methodsData.value = generateMockMethodsData()
  }
}

const loadTrendsData = async () => {
  try {
    const { data } = await api.get('/api/stats/transactions', { params: filters.value })
    trendsData.value = data.data || []
  } catch (error) {
    console.error('Error loading trends data:', error)
    trendsData.value = generateMockTrendsData()
  }
}

const loadCheckoutTimeData = async () => {
  try {
    const { data } = await api.get('/api/stats/checkout-time', { params: filters.value })
    checkoutTimeData.value = data.data || []
    checkoutTimeLabels.value = data.labels || []
  } catch (error) {
    console.error('Error loading checkout time data:', error)
    const mockData = generateMockCheckoutTimeData()
    checkoutTimeData.value = mockData.data
    checkoutTimeLabels.value = mockData.labels
  }
}

const loadGeographyData = async () => {
  try {
    const { data } = await api.get('/api/stats/geography', { params: filters.value })
    geographyData.value = data.data || []
    geographyLabels.value = data.labels || []
  } catch (error) {
    console.error('Error loading geography data:', error)
    const mockData = generateMockGeographyData()
    geographyData.value = mockData.data
    geographyLabels.value = mockData.labels
  }
}

const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadRevenueData(),
      loadMethodsData(),
      loadTrendsData(),
      loadCheckoutTimeData(),
      loadGeographyData()
    ])
  } catch (error) {
    console.error('Error loading stats data:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadAllData()
}

// Mock data generators for development
const generateMockRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map(month => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    transactions: Math.floor(Math.random() * 1000) + 200
  }))
}

const generateMockMethodsData = () => [
  { method: 'Card', percentage: 65, count: 1300 },
  { method: 'Bank Transfer', percentage: 20, count: 400 },
  { method: 'Wallet', percentage: 10, count: 200 },
  { method: 'UPI', percentage: 5, count: 100 }
]

const generateMockTrendsData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(day => ({
    day,
    successful: Math.floor(Math.random() * 100) + 50,
    failed: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 30) + 10
  }))
}

const generateMockCheckoutTimeData = () => {
  const timeRanges = ['0-30s', '30-60s', '1-2m', '2-5m', '5m+']
  return {
    data: timeRanges.map(() => Math.floor(Math.random() * 100) + 20),
    labels: timeRanges
  }
}

const generateMockGeographyData = () => {
  const countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'India', 'Australia']
  return {
    data: countries.map(() => Math.floor(Math.random() * 1000) + 100),
    labels: countries
  }
}

// Watchers
watch(filters, () => {
  loadAllData()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.stats-dashboard {
  position: relative;
  min-height: 600px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.chart-card:hover {
  border-color: rgba(189, 240, 0.3);
  transform: translateY(-2px);
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

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  color: #cfcfcf;
}

.loading-overlay {
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
  border-radius: 16px;
  z-index: 10;
}

.loading-text {
  color: #ffffff;
  margin-top: 16px;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .chart-card {
    padding: 16px;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>
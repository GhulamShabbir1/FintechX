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

const { filters } = toRefs(props)

// Reactive data
const loading = ref(false)
const revenueData = ref([])
const methodsData = ref([])
const trendsData = ref([])
const checkoutTimeData = ref([])
const checkoutTimeLabels = ref([])
const geographyData = ref([])
const geographyLabels = ref([])

// Methods
const fetchAll = async () => {
  loading.value = true
  try {
    const params = { 
      startDate: filters.value.startDate, 
      endDate: filters.value.endDate, 
      merchantId: filters.value.merchantId 
    }
    
    const [r, m, t, c, g] = await Promise.all([
      api.get('/stats/revenue', { params }),
      api.get('/stats/methods', { params }),
      api.get('/stats/transactions', { params }),
      api.get('/stats/checkout-time', { params }),
      api.get('/stats/geography', { params })
    ])
    
    revenueData.value = r.data
    methodsData.value = m.data
    trendsData.value = t.data
    checkoutTimeData.value = c.data.values || []
    checkoutTimeLabels.value = c.data.labels || []
    geographyData.value = g.data.values || []
    geographyLabels.value = g.data.labels || []
  } catch (error) {
    console.error('Failed to fetch stats data:', error)
    // Use demo data on error
    loadDemoData()
  } finally {
    loading.value = false
  }
}

const loadDemoData = () => {
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
    { method: 'Credit Card', percentage: 45 },
    { method: 'Debit Card', percentage: 28 },
    { method: 'Digital Wallet', percentage: 18 },
    { method: 'Bank Transfer', percentage: 9 }
  ]
  
  // Demo trends data
  trendsData.value = [
    { month: 'Jan', successful: 120, failed: 8 },
    { month: 'Feb', successful: 135, failed: 6 },
    { month: 'Mar', successful: 142, failed: 12 },
    { month: 'Apr', successful: 158, failed: 9 },
    { month: 'May', successful: 165, failed: 7 },
    { month: 'Jun', successful: 184, failed: 11 }
  ]
  
  // Demo checkout time data
  checkoutTimeData.value = [2.3, 2.1, 2.5, 2.0, 1.8, 2.2, 1.9]
  checkoutTimeLabels.value = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Demo geography data
  geographyData.value = [45, 32, 28, 22, 18]
  geographyLabels.value = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia']
}

const refreshData = () => {
  fetchAll()
}

// Watch for filter changes
watch(filters, fetchAll, { deep: true, immediate: true })

// Initialize
onMounted(() => {
  fetchAll()
})
</script>

<style scoped>
.stats-dashboard {
  position: relative;
  min-height: 400px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  background: #121212;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s ease;
}

.chart-card:hover {
  border-color: rgba(189, 240, 0, 0.2);
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

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  height: 300px;
  position: relative;
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
  z-index: 10;
  border-radius: 16px;
}

.loading-text {
  color: #bdf000;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
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
}

@media (max-width: 480px) {
  .chart-card {
    padding: 16px;
  }
  
  .chart-container {
    height: 200px;
  }
}
</style>
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
import { ref, watch, toRefs, onMounted, computed } from 'vue'
import { useStatsStore } from '../../store/stats'
import { pinia } from '../../store/pinia'
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

// Store
const stats = useStatsStore(pinia)

// Reactive/computed bindings from store
const loading = computed(() => stats.loading)
const revenueData = computed(() => stats.revenue)
const methodsData = computed(() => stats.methods)
const trendsData = computed(() => stats.transactions)
const checkoutTimeData = computed(() => stats.checkoutTime.values)
const checkoutTimeLabels = computed(() => stats.checkoutTime.labels)
const geographyData = computed(() => stats.geography.values)
const geographyLabels = computed(() => stats.geography.labels)

// Destructure props for watchers
const { filters } = toRefs(props)

// Methods
const loadAllData = async () => {
  await stats.loadAll(filters.value)
}

const refreshData = () => {
  loadAllData()
}

// Mock generators removed; store already handles fallbacks if needed

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
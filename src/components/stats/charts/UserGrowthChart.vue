<template>
  <div class="user-growth-chart">
    <div v-if="loading" class="chart-loading">
      <q-spinner-dots color="lime" size="30px" />
      <p>Loading user growth data...</p>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="chart-empty">
      <q-icon name="people" size="48px" color="grey-5" />
      <p>No user growth data available</p>
    </div>
    
    <div v-else class="chart-content">
      <div class="chart-container">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>
      
      <!-- Growth Metrics -->
      <div class="growth-metrics">
        <div class="metric-item">
          <div class="metric-icon">
            <q-icon name="store" color="lime" size="20px" />
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ merchantGrowth }}%</span>
            <span class="metric-label">Merchant Growth</span>
          </div>
        </div>
        
        <div class="metric-item">
          <div class="metric-icon">
            <q-icon name="people" color="blue" size="20px" />
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ customerGrowth }}%</span>
            <span class="metric-label">Customer Growth</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartCanvas = ref(null)
const chartInstance = ref(null)

// Process data for chart
const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return []
  
  return props.data.map(item => ({
    date: item.date || item.month || 'Unknown',
    merchants: item.merchants || item.value || 0,
    customers: item.customers || 0
  }))
})

// Calculate growth rates
const merchantGrowth = computed(() => {
  if (chartData.value.length < 2) return 0
  
  const current = chartData.value[chartData.value.length - 1].merchants
  const previous = chartData.value[chartData.value.length - 2].merchants
  
  if (previous === 0) return current > 0 ? 100 : 0
  
  return Math.round(((current - previous) / previous) * 100)
})

const customerGrowth = computed(() => {
  if (chartData.value.length < 2) return 0
  
  const current = chartData.value[chartData.value.length - 1].customers
  const previous = chartData.value[chartData.value.length - 2].customers
  
  if (previous === 0) return current > 0 ? 100 : 0
  
  return Math.round(((current - previous) / previous) * 100)
})

// Create chart
const createChart = () => {
  if (!chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  
  // Destroy existing chart
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  
  // Create new chart
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.value.map(item => item.date),
      datasets: [
        {
          label: 'Merchants',
          data: chartData.value.map(item => item.merchants),
          backgroundColor: 'rgba(189, 240, 0, 0.8)',
          borderColor: '#bdf000',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: 'y'
        },
        {
          label: 'Customers',
          data: chartData.value.map(item => item.customers),
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
          borderColor: '#2196f3',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#bdf000',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || ''
              const value = context.parsed.y || 0
              return `${label}: ${value.toLocaleString()}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#999',
            font: { size: 11 }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#999',
            font: { size: 11 }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#999',
            font: { size: 11 }
          }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      }
    }
  })
}

// Watch for data changes
watch(() => props.data, () => {
  if (props.data && props.data.length > 0) {
    createChart()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  if (props.data && props.data.length > 0) {
    createChart()
  }
})
</script>

<style scoped>
.user-growth-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.chart-loading p,
.chart-empty p {
  margin: 12px 0 0 0;
  font-size: 0.9rem;
}

.chart-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
}

.growth-metrics {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.1);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.metric-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 180px;
  }
  
  .growth-metrics {
    padding: 12px;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .metric-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style>
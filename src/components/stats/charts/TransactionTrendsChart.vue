<template>
  <div class="transaction-trends-chart">
    <div v-if="loading" class="chart-loading">
      <q-spinner-dots color="lime" size="30px" />
      <p>Loading transaction trends...</p>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="chart-empty">
      <q-icon name="trending_up" size="48px" color="grey-5" />
      <p>No transaction trend data available</p>
    </div>
    
    <div v-else class="chart-content">
      <!-- Chart Controls -->
      <div class="chart-controls">
        <q-btn-toggle
          v-model="selectedMetric"
          :options="metricOptions"
          color="lime"
          text-color="white"
          class="metric-toggle"
        />
      </div>
      
      <div class="chart-container">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>
      
      <!-- Trend Indicators -->
      <div class="trend-indicators">
        <div class="trend-item">
          <q-icon name="trending_up" color="green" size="20px" />
          <span class="trend-text">Volume: {{ volumeTrend }}</span>
        </div>
        <div class="trend-item">
          <q-icon name="speed" color="blue" size="20px" />
          <span class="trend-text">Frequency: {{ frequencyTrend }}</span>
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
const selectedMetric = ref('volume')

// Metric options for toggle
const metricOptions = [
  { label: 'Volume', value: 'volume' },
  { label: 'Count', value: 'count' },
  { label: 'Average', value: 'average' }
]

// Process data for chart
const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return []
  
  return props.data.map(item => ({
    date: item.date || item.month || 'Unknown',
    volume: item.volume || item.amount || 0,
    count: item.count || item.transactions || 0,
    average: item.average || item.avg_amount || 0
  }))
})

// Calculate trend indicators
const volumeTrend = computed(() => {
  if (chartData.value.length < 2) return 'Stable'
  
  const current = chartData.value[chartData.value.length - 1].volume
  const previous = chartData.value[chartData.value.length - 2].volume
  
  if (previous === 0) return current > 0 ? 'Growing' : 'Stable'
  
  const change = ((current - previous) / previous) * 100
  
  if (change > 10) return 'Strong Growth'
  if (change > 5) return 'Growing'
  if (change > -5) return 'Stable'
  if (change > -10) return 'Declining'
  return 'Strong Decline'
})

const frequencyTrend = computed(() => {
  if (chartData.value.length < 2) return 'Stable'
  
  const current = chartData.value[chartData.value.length - 1].count
  const previous = chartData.value[chartData.value.length - 2].count
  
  if (previous === 0) return current > 0 ? 'Increasing' : 'Stable'
  
  const change = ((current - previous) / previous) * 100
  
  if (change > 15) return 'Rapid Increase'
  if (change > 5) return 'Increasing'
  if (change > -5) return 'Stable'
  if (change > -15) return 'Decreasing'
  return 'Rapid Decrease'
})

// Get current metric data
const currentMetricData = computed(() => {
  return chartData.value.map(item => item[selectedMetric.value])
})

// Get current metric label
const currentMetricLabel = computed(() => {
  const labels = {
    volume: 'Transaction Volume',
    count: 'Transaction Count',
    average: 'Average Transaction'
  }
  return labels[selectedMetric.value]
})

// Get current metric color
const currentMetricColor = computed(() => {
  const colors = {
    volume: '#bdf000',
    count: '#2196f3',
    average: '#9c27b0'
  }
  return colors[selectedMetric.value]
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
      datasets: [{
        label: currentMetricLabel.value,
        data: currentMetricData.value,
        backgroundColor: currentMetricColor.value + '40',
        borderColor: currentMetricColor.value,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: currentMetricColor.value,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y || 0
              if (selectedMetric.value === 'volume') {
                return `${currentMetricLabel.value}: $${(value / 100).toFixed(2)}`
              }
              return `${currentMetricLabel.value}: ${value}`
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
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#999',
            font: {
              size: 11
            },
            callback: function(value) {
              if (selectedMetric.value === 'volume') {
                return '$' + (value / 100).toFixed(0)
              }
              return value.toLocaleString()
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
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

// Watch for metric changes
watch(selectedMetric, () => {
  if (props.data && props.data.length > 0) {
    createChart()
  }
})

// Lifecycle
onMounted(() => {
  if (props.data && props.data.length > 0) {
    createChart()
  }
})
</script>

<style scoped>
.transaction-trends-chart {
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

.chart-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.metric-toggle {
  border-radius: 8px;
  overflow: hidden;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
}

.trend-indicators {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0.1);
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-text {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    height: 180px;
  }
  
  .trend-indicators {
    padding: 12px;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .trend-item {
    font-size: 0.8rem;
  }
}
</style>
<template>
  <div class="checkout-time-chart">
    <div v-if="loading" class="chart-loading">
      <q-spinner-dots color="lime" size="30px" />
      <p>Loading checkout data...</p>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="chart-empty">
      <q-icon name="timer" size="48px" color="grey-5" />
      <p>No checkout time data available</p>
    </div>
    
    <div v-else class="chart-content">
      <!-- Performance Summary -->
      <div class="performance-summary">
        <div class="summary-item">
          <q-icon name="speed" color="green" size="24px" />
          <div class="summary-content">
            <span class="summary-value">{{ averageCheckoutTime }}s</span>
            <span class="summary-label">Average Time</span>
          </div>
        </div>
        <div class="summary-item">
          <q-icon name="check_circle" color="lime" size="24px" />
          <div class="summary-content">
            <span class="summary-value">{{ completionRate }}%</span>
            <span class="summary-label">Completion Rate</span>
          </div>
        </div>
      </div>
      
      <div class="chart-container">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>
      
      <!-- Time Distribution -->
      <div class="time-distribution">
        <h4 class="distribution-title">Time Distribution</h4>
        <div class="distribution-bars">
          <div v-for="(range, index) in timeRanges" :key="index" class="distribution-bar">
            <div class="bar-label">{{ range.label }}</div>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: range.percentage + '%', backgroundColor: range.color }"></div>
            </div>
            <div class="bar-value">{{ range.percentage }}%</div>
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
    time: item.time || item.duration || 0,
    count: item.count || item.transactions || 0,
    success: item.success || item.completed || 0
  }))
})

// Calculate performance metrics
const averageCheckoutTime = computed(() => {
  if (chartData.value.length === 0) return 0
  
  const totalTime = chartData.value.reduce((sum, item) => sum + (item.time * item.count), 0)
  const totalCount = chartData.value.reduce((sum, item) => sum + item.count, 0)
  
  return totalCount > 0 ? Math.round(totalTime / totalCount) : 0
})

const completionRate = computed(() => {
  if (chartData.value.length === 0) return 0
  
  const totalSuccess = chartData.value.reduce((sum, item) => sum + item.success, 0)
  const totalCount = chartData.value.reduce((sum, item) => sum + item.count, 0)
  
  return totalCount > 0 ? Math.round((totalSuccess / totalCount) * 100) : 0
})

// Time range distribution
const timeRanges = computed(() => {
  if (chartData.value.length === 0) return []
  
  const ranges = [
    { min: 0, max: 30, label: '0-30s', color: '#4caf50' },
    { min: 31, max: 60, label: '31-60s', color: '#8bc34a' },
    { min: 61, max: 120, label: '1-2m', color: '#ffc107' },
    { min: 121, max: 300, label: '2-5m', color: '#ff9800' },
    { min: 301, max: Infinity, label: '5m+', color: '#f44336' }
  ]
  
  const total = chartData.value.reduce((sum, item) => sum + item.count, 0)
  
  return ranges.map(range => {
    const count = chartData.value.reduce((sum, item) => {
      if (item.time >= range.min && item.time <= range.max) {
        return sum + item.count
      }
      return sum
    }, 0)
    
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
    
    return {
      ...range,
      count,
      percentage
    }
  })
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
    type: 'line',
    data: {
      labels: chartData.value.map(item => `${item.time}s`),
      datasets: [
        {
          label: 'Transaction Count',
          data: chartData.value.map(item => item.count),
          borderColor: '#bdf000',
          backgroundColor: 'rgba(189, 240, 0, 1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#bdf000',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Successful Transactions',
          data: chartData.value.map(item => item.success),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#4caf50',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
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
          borderColor: '#bdf000',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || ''
              const value = context.parsed.y || 0
              return `${label}: ${value}`
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

// Lifecycle
onMounted(() => {
  if (props.data && props.data.length > 0) {
    createChart()
  }
})
</script>

<style scoped>
.checkout-time-chart {
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

.performance-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 1);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.summary-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
}

.time-distribution {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.distribution-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  text-align: center;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 60px;
  font-size: 0.8rem;
  color: #999;
  text-align: right;
  flex-shrink: 0;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s ease;
}

.bar-value {
  width: 40px;
  font-size: 0.8rem;
  color: #ffffff;
  font-weight: 600;
  text-align: right;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    height: 180px;
  }
  
  .performance-summary {
    padding: 12px;
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-item {
    justify-content: center;
  }
  
  .bar-label {
    width: 50px;
    font-size: 0.7rem;
  }
  
  .bar-value {
    width: 35px;
    font-size: 0.7rem;
  }
}
</style>
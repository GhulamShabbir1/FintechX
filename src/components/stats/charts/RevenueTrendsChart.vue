<template>
  <div class="revenue-trends-chart">
    <div v-if="loading" class="chart-loading">
      <q-spinner-dots color="lime" size="30px" />
      <p>Loading revenue data...</p>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="chart-empty">
      <q-icon name="trending_up" size="48px" color="grey-5" />
      <p>No revenue data available</p>
    </div>
    
    <div v-else class="chart-content">
      <div class="chart-container">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>
      
      <!-- Summary Stats -->
      <div class="chart-summary">
        <div class="summary-item">
          <span class="summary-label">Total Revenue</span>
          <span class="summary-value">{{ formatCurrency(totalRevenue) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Growth</span>
          <span class="summary-value" :class="growthClass">{{ growthRate }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Transactions</span>
          <span class="summary-value">{{ totalTransactions }}</span>
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
    revenue: item.revenue || item.amount || 0,
    transactions: item.transactions || item.count || 0
  }))
})

// Calculate summary stats
const totalRevenue = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.revenue, 0)
})

const totalTransactions = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.transactions, 0)
})

const growthRate = computed(() => {
  if (chartData.value.length < 2) return 0
  
  const current = chartData.value[chartData.value.length - 1].revenue
  const previous = chartData.value[chartData.value.length - 2].revenue
  
  if (previous === 0) return current > 0 ? 100 : 0
  
  return Math.round(((current - previous) / previous) * 100)
})

const growthClass = computed(() => {
  if (growthRate.value > 0) return 'text-positive'
  if (growthRate.value < 0) return 'text-negative'
  return 'text-grey'
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
      labels: chartData.value.map(item => item.date),
      datasets: [
        {
          label: 'Revenue',
          data: chartData.value.map(item => item.revenue),
          borderColor: '#bdf000',
          backgroundColor: 'rgba(189, 240, 0, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#bdf000',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          yAxisID: 'y'
        },
        {
          label: 'Transactions',
          data: chartData.value.map(item => item.transactions),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#2196f3',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
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
              if (label === 'Revenue') {
                return `${label}: $${(value / 100).toFixed(2)}`
              }
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
            font: { size: 11 },
            callback: function(value) {
              return '$' + (value / 100).toFixed(0)
            }
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
        duration: 1000,
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}
</script>

<style scoped>
.revenue-trends-chart {
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

.chart-summary {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.1);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.text-positive { color: #4caf50; }
.text-negative { color: #f44336; }
.text-grey { color: #999; }

@media (max-width: 768px) {
  .chart-container {
    height: 180px;
  }
  
  .chart-summary {
    padding: 12px;
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-value {
    font-size: 1rem;
  }
}
</style>
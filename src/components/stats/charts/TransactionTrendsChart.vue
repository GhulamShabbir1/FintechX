<template>
  <q-card class="lime-glow q-pa-md trends-chart-card">
    <div class="chart-header">
      <div class="text-subtitle1 q-mb-sm chart-title">Transactions: Success vs Failed</div>
      <q-icon name="stacked_bar_chart" color="lime" size="sm" class="chart-icon" />
    </div>
    
    <div class="chart-container">
      <canvas ref="el" height="130"></canvas>
    </div>

    <div class="chart-footer" v-if="showStats">
      <div class="stat-item" v-for="stat in transactionStats" :key="stat.label">
        <div class="stat-color" :style="{ backgroundColor: stat.color }"></div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-percentage" :style="{ color: stat.color }">{{ stat.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="chart-legend" v-if="showLegend">
      <div class="legend-item" v-for="(dataset, index) in enhancedDatasets" :key="index">
        <div class="legend-color" :style="{ backgroundColor: dataset.backgroundColor }"></div>
        <div class="legend-label">{{ dataset.label }}</div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div class="chart-loading" v-if="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading transaction data...</div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  showStats: { type: Boolean, default: true },
  showLegend: { type: Boolean, default: true },
  loading: { type: Boolean, default: false }
})

const el = ref(null)
let chart = null

// Default datasets if none provided
const defaultDatasets = [
  {
    label: 'Successful',
    data: [120, 150, 180, 200, 170, 190, 210],
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderColor: 'rgba(76, 175, 80, 1)',
    borderWidth: 1,
    borderRadius: 4,
    hoverBackgroundColor: 'rgba(76, 175, 80, 1)',
    hoverBorderColor: '#ffffff'
  },
  {
    label: 'Failed',
    data: [15, 12, 18, 10, 14, 8, 11],
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    borderColor: 'rgba(244, 67, 54, 1)',
    borderWidth: 1,
    borderRadius: 4,
    hoverBackgroundColor: 'rgba(244, 67, 54, 1)',
    hoverBorderColor: '#ffffff'
  }
]

// Default labels if none provided
const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Computed properties
const enhancedDatasets = computed(() => {
  return props.datasets.length > 0 ? props.datasets : defaultDatasets
})

const transactionStats = computed(() => {
  const successData = enhancedDatasets.value[0]?.data || []
  const failedData = enhancedDatasets.value[1]?.data || []
  
  const totalSuccess = successData.reduce((sum, val) => sum + val, 0)
  const totalFailed = failedData.reduce((sum, val) => sum + val, 0)
  const totalTransactions = totalSuccess + totalFailed
  
  const successPercentage = totalTransactions > 0 ? ((totalSuccess / totalTransactions) * 100).toFixed(1) : 0
  const failedPercentage = totalTransactions > 0 ? ((totalFailed / totalTransactions) * 100).toFixed(1) : 0

  return [
    {
      label: 'Successful',
      value: totalSuccess,
      percentage: successPercentage,
      color: '#4CAF50'
    },
    {
      label: 'Failed',
      value: totalFailed,
      percentage: failedPercentage,
      color: '#F44336'
    },
    {
      label: 'Total',
      value: totalTransactions,
      percentage: '100%',
      color: '#bdf000'
    }
  ]
})

// Methods
const createHoverGradient = (baseColor, ctx, chartArea) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  gradient.addColorStop(0, baseColor.replace('0.8', '0.6'))
  gradient.addColorStop(0.5, baseColor)
  gradient.addColorStop(1, baseColor.replace('0.8', '1)'))
  return gradient
}

const build = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  
  const ctx = el.value.getContext('2d')
  
  const chartDatasets = enhancedDatasets.value
  const chartLabels = props.labels.length > 0 ? props.labels : defaultLabels

  // Enhance datasets with gradients
  const enhancedChartDatasets = chartDatasets.map(dataset => ({
    ...dataset,
    backgroundColor: function(context) {
      const chart = context.chart
      const { ctx, chartArea } = chart
      if (!chartArea) return dataset.backgroundColor
      return createHoverGradient(dataset.backgroundColor, ctx, chartArea)
    },
    barPercentage: 0.7,
    categoryPercentage: 0.8
  }))

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: enhancedChartDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
        onProgress: function() {
          // Smooth animation progress
        },
        onComplete: function() {
          // Animation complete callback
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.06)',
            drawBorder: false
          },
          ticks: {
            color: '#a0a0a0',
            font: {
              size: 11
            }
          }
        },
        y: {
          stacked: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.06)',
            drawBorder: false
          },
          ticks: {
            color: '#a0a0a0',
            font: {
              size: 11
            },
            precision: 0
          },
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false,
          position: 'top',
          labels: {
            color: '#a0a0a0',
            font: {
              size: 11
            },
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(18, 18, 18, 0.95)',
          titleColor: '#bdf000',
          bodyColor: '#ffffff',
          borderColor: 'rgba(189, 240, 0, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} transactions`
            },
            labelColor: function(context) {
              return {
                borderColor: context.dataset.borderColor,
                backgroundColor: context.dataset.backgroundColor,
                borderWidth: 2,
                borderRadius: 2
              }
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      onHover: (event, chartElements) => {
        if (chartElements.length) {
          event.native.target.style.cursor = 'pointer'
        } else {
          event.native.target.style.cursor = 'default'
        }
      },
      onClick: (event, chartElements) => {
        if (chartElements.length) {
          const element = chartElements[0]
          console.log('Chart element clicked:', element)
        }
      }
    }
  })
}

// Watch for data changes with smooth updates
watch(() => [props.labels, props.datasets], () => {
  if (chart) {
    const chartDatasets = props.datasets.length > 0 ? props.datasets : defaultDatasets
    const chartLabels = props.labels.length > 0 ? props.labels : defaultLabels
    
    chart.data.labels = chartLabels
    chart.data.datasets = chartDatasets
    chart.update('active')
  }
}, { deep: true })

watch(() => props.loading, (newVal) => {
  if (!newVal && chart) {
    // Refresh chart when loading completes
    setTimeout(() => {
      chart.update()
    }, 100)
  }
})

onMounted(() => {
  build()
  
  // Add resize observer for responsive chart
  const resizeObserver = new ResizeObserver(() => {
    if (chart) {
      setTimeout(() => {
        chart.resize()
      }, 100)
    }
  })
  
  if (el.value) {
    resizeObserver.observe(el.value.parentElement)
  }
})

onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>

<style scoped>
.trends-chart-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #0a0a0a 0%, #121018 100%);
  color: #fff;
  border: 1px solid rgba(189, 240, 0, 0.28);
  box-shadow: 
    0 10px 28px rgba(0,0,0,0.35),
    0 0 0 1px rgba(189,240,0,0.28),
    0 0 24px rgba(189,240,0,0.18);
  transition: all 0.3s ease;
  height: 400px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.trends-chart-card:hover {
  box-shadow: 
    0 15px 35px rgba(0,0,0,0.4),
    0 0 0 1px rgba(189,240,0,0.35),
    0 0 30px rgba(189,240,0,0.25);
  transform: translateY(-2px);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  animation: fadeInDown 0.6s ease;
}

.chart-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0;
}

.chart-icon {
  animation: pulse 2s ease-in-out infinite;
}

.chart-container {
  position: relative;
  flex: 1;
  margin: 10px 0;
  transition: all 0.3s ease;
}

.chart-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-item:hover .stat-color {
  transform: scale(1.2);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}

.stat-percentage {
  font-size: 0.75rem;
  font-weight: 600;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(189, 240, 0, 0.3);
  border-top: 3px solid #bdf000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  color: #bdf000;
  font-size: 0.875rem;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .trends-chart-card {
    height: 380px;
    padding: 12px;
    border-radius: 12px;
  }
  
  .chart-title {
    font-size: 1rem;
  }
  
  .chart-footer {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .chart-legend {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-item {
    padding: 10px;
  }
  
  .legend-item {
    padding: 4px 8px;
  }
  
  .stat-label {
    font-size: 0.65rem;
  }
  
  .stat-value {
    font-size: 0.8rem;
  }
}
</style>
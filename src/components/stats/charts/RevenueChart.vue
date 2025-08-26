<template>
  <q-card class="lime-glow q-pa-md revenue-chart-card">
    <div class="chart-header">
      <div class="text-subtitle1 q-mb-sm chart-title">Revenue Analytics</div>
      <q-icon name="trending_up" color="lime" size="sm" class="chart-icon" />
    </div>
    
    <div class="chart-container">
      <canvas ref="el" height="120"></canvas>
    </div>

    <div class="chart-footer" v-if="showStats">
      <div class="stat-item" v-for="stat in revenueStats" :key="stat.label">
        <div class="stat-icon" :style="{ color: stat.color }">
          <q-icon :name="stat.icon" size="sm" />
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div class="chart-loading" v-if="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading revenue data...</div>
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
  loading: { type: Boolean, default: false }
})

const el = ref(null)
let chart = null

// Default datasets if none provided
const defaultDatasets = [
  {
    label: 'Revenue',
    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
    borderColor: '#bdf000',
    backgroundColor: 'rgba(189, 240, 0, 0.1)',
    tension: 0.4,
    fill: true,
    pointBackgroundColor: '#bdf000',
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6
  }
]

// Default labels if none provided
const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Computed properties
const revenueStats = computed(() => {
  const currentData = props.datasets.length > 0 ? props.datasets[0].data : defaultDatasets[0].data
  const total = currentData.reduce((sum, val) => sum + val, 0)
  const average = total / currentData.length
  const growth = currentData.length > 1 
    ? ((currentData[currentData.length - 1] - currentData[0]) / currentData[0] * 100).toFixed(1)
    : 0

  return [
    {
      label: 'Total Revenue',
      value: `$${(total / 1000).toFixed(1)}k`,
      icon: 'attach_money',
      color: '#bdf000'
    },
    {
      label: 'Average Daily',
      value: `$${Math.round(average)}`,
      icon: 'avg_pace',
      color: '#22d3ee'
    },
    {
      label: 'Growth',
      value: `${growth}%`,
      icon: growth >= 0 ? 'trending_up' : 'trending_down',
      color: growth >= 0 ? '#34d399' : '#f87171'
    }
  ]
})

// Methods
const createGradient = (ctx, chartArea, dataset) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  gradient.addColorStop(0, dataset.backgroundColor.replace('0.1', '0.2'))
  gradient.addColorStop(0.5, dataset.backgroundColor.replace('0.1', '0.4'))
  gradient.addColorStop(1, dataset.backgroundColor.replace('0.1', '0.6'))
  return gradient
}

const build = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  
  const ctx = el.value.getContext('2d')
  
  const chartDatasets = props.datasets.length > 0 ? props.datasets : defaultDatasets
  const chartLabels = props.labels.length > 0 ? props.labels : defaultLabels

  // Enhance datasets with gradients
  const enhancedDatasets = chartDatasets.map(dataset => ({
    ...dataset,
    backgroundColor: function(context) {
      const chart = context.chart
      const { ctx, chartArea } = chart
      if (!chartArea) return dataset.backgroundColor
      return createGradient(ctx, chartArea, dataset)
    }
  }))

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: enhancedDatasets
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
          grid: {
            color: 'rgba(255, 255, 255, 0.06)',
            drawBorder: false
          },
          ticks: {
            color: '#a0a0a0',
            font: {
              size: 11
            },
            callback: function(value) {
              return value >= 1000 ? `$${value / 1000}k` : `$${value}`
            }
          },
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
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
              return `${context.dataset.label}: $${context.parsed.y}`
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
.revenue-chart-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #0a0a0a 0%, #121018 100%);
  color: #fff;
  border: 1px solid rgba(189, 240, 0, 0.28);
  box-shadow: 
    0 10px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(189, 240, 0, 0.28),
    0 0 24px rgba(189, 240, 0, 0.18);
  transition: all 0.3s ease;
  height: 380px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.revenue-chart-card:hover {
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(189, 240, 0, 0.35),
    0 0 30px rgba(189, 240, 0, 0.25);
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
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-item:hover .stat-icon {
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
  color: #bdf000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  .revenue-chart-card {
    height: 350px;
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
  
  .stat-item {
    padding: 8px;
  }
  
  .stat-label {
    font-size: 0.65rem;
  }
  
  .stat-value {
    font-size: 0.8rem;
  }
}
</style>
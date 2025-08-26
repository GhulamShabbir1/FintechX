<template>
  <div class="chart-container">
    <div class="chart-header" v-if="title || $slots.header">
      <slot name="header">
        <div class="chart-title">{{ title }}</div>
        <div class="chart-subtitle" v-if="subtitle">{{ subtitle }}</div>
      </slot>
    </div>
    
    <div class="chart-wrapper" :class="{ 'with-header': title || $slots.header }">
      <canvas ref="chartCanvas" :height="height" :width="width"></canvas>
    </div>

    <div class="chart-footer" v-if="$slots.footer || showStats">
      <slot name="footer">
        <div class="chart-stats" v-if="showStats">
          <div class="stat-item">
            <div class="stat-label">Average</div>
            <div class="stat-value">{{ averageValue }}m</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Min</div>
            <div class="stat-value">{{ minValue }}m</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Max</div>
            <div class="stat-value">{{ maxValue }}m</div>
          </div>
        </div>
      </slot>
    </div>

    <!-- Loading overlay -->
    <div class="chart-loading" v-if="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading chart data...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  labels: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Average Checkout Time'
  },
  subtitle: {
    type: String,
    default: ''
  },
  height: {
    type: [String, Number],
    default: 300
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  showStats: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  animationDuration: {
    type: Number,
    default: 1000
  }
})

// Emits
const emit = defineEmits(['chart-created', 'chart-updated', 'point-click'])

// Template refs
const chartCanvas = ref(null)
let chartInstance = null

// Computed properties
const averageValue = computed(() => {
  if (!props.data.length) return '0.0'
  const sum = props.data.reduce((acc, val) => acc + val, 0)
  return (sum / props.data.length).toFixed(1)
})

const minValue = computed(() => {
  if (!props.data.length) return '0.0'
  return Math.min(...props.data).toFixed(1)
})

const maxValue = computed(() => {
  if (!props.data.length) return '0.0'
  return Math.max(...props.data).toFixed(1)
})

// Methods
const createGradient = (ctx, chartArea) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  gradient.addColorStop(0, 'rgba(189, 240, 0, 0.1)')
  gradient.addColorStop(0.5, 'rgba(189, 240, 0, 0.2)')
  gradient.addColorStop(1, 'rgba(189, 240, 0, 0.4)')
  return gradient
}

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  
  // Demo data if no data provided
  const chartData = props.data.length > 0 ? props.data : [2.3, 2.1, 2.5, 2.0, 1.8, 2.2, 1.9]
  const chartLabels = props.labels.length > 0 ? props.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Average Checkout Time (minutes)',
        data: chartData,
        borderColor: '#bdf000',
        backgroundColor: function(context) {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return null
          return createGradient(ctx, chartArea)
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#bdf000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#bdf000',
        pointHoverBorderWidth: 3,
        animation: {
          duration: props.animationDuration,
          easing: 'easeOutQuart'
        }
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
          backgroundColor: '#121212',
          titleColor: '#ffffff',
          bodyColor: '#bdf000',
          borderColor: 'rgba(189, 240, 0, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} minutes`
            }
          },
          animation: {
            duration: 300
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ccc',
            callback: function(value) {
              return value + 'm'
            },
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Time (minutes)',
            color: '#999',
            font: {
              size: 12
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ccc',
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Days',
            color: '#999',
            font: {
              size: 12
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      animations: {
        tension: {
          duration: props.animationDuration,
          easing: 'easeOutQuart'
        },
        points: {
          duration: props.animationDuration * 0.8
        }
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
          const point = chartElements[0]
          emit('point-click', {
            index: point.index,
            value: point.element.$context.parsed.y,
            label: point.element.$context.label
          })
        }
      }
    }
  })

  emit('chart-created', chartInstance)
}

const updateChart = () => {
  if (!chartInstance) return

  const chartData = props.data.length > 0 ? props.data : [2.3, 2.1, 2.5, 2.0, 1.8, 2.2, 1.9]
  const chartLabels = props.labels.length > 0 ? props.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  chartInstance.data.labels = chartLabels
  chartInstance.data.datasets[0].data = chartData
  
  chartInstance.update('none')
  emit('chart-updated', chartInstance)
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

// Watch for data changes
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

watch(() => props.labels, () => {
  updateChart()
}, { deep: true })

watch(() => props.loading, (newVal) => {
  if (!newVal && chartInstance) {
    // Refresh chart when loading completes
    setTimeout(() => {
      chartInstance.update()
    }, 100)
  }
})

// Lifecycle
onMounted(() => {
  createChart()
  
  // Add resize observer for responsive chart
  const resizeObserver = new ResizeObserver(() => {
    if (chartInstance) {
      setTimeout(() => {
        chartInstance.resize()
      }, 100)
    }
  })
  
  if (chartCanvas.value) {
    resizeObserver.observe(chartCanvas.value.parentElement)
  }
})

onBeforeUnmount(() => {
  destroyChart()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  background: linear-gradient(135deg, #0a0a0a 0%, #121018 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
  border-color: rgba(189, 240, 0, 0.2);
}

.chart-header {
  margin-bottom: 20px;
  animation: fadeInDown 0.6s ease;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #bdf000;
  margin-bottom: 4px;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #999;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
  transition: all 0.3s ease;
}

.chart-wrapper.with-header {
  margin-top: 10px;
}

.chart-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  flex: 1;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(189, 240, 0, 0.1);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #bdf000;
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
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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
  .chart-container {
    padding: 15px;
    border-radius: 12px;
  }
  
  .chart-title {
    font-size: 1.125rem;
  }
  
  .chart-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-item {
    padding: 8px;
  }
  
  .stat-value {
    font-size: 1rem;
  }
}
</style>
<template>
  <div class="chart-container">
    <div class="chart-header" v-if="title">
      <div class="chart-title">{{ title }}</div>
      <q-icon v-if="showInfo" name="info" size="sm" color="grey-5" class="info-icon">
        <q-tooltip>Geographic distribution of transactions</q-tooltip>
      </q-icon>
    </div>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas" :height="height"></canvas>
    </div>
    <div class="chart-footer" v-if="showStats">
      <div class="stat-item">
        <div class="stat-label">Total</div>
        <div class="stat-value">{{ totalValue }}%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Top Region</div>
        <div class="stat-value">{{ topRegion }}</div>
      </div>
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
    default: 'Geographic Distribution'
  },
  height: {
    type: [String, Number],
    default: 300
  },
  showStats: {
    type: Boolean,
    default: true
  },
  showInfo: {
    type: Boolean,
    default: true
  },
  animationDuration: {
    type: Number,
    default: 1500
  }
})

// Template refs
const chartCanvas = ref(null)
let chartInstance = null

// Computed properties
const totalValue = computed(() => {
  return props.data.reduce((sum, value) => sum + value, 0).toFixed(1)
})

const topRegion = computed(() => {
  if (props.data.length === 0 || props.labels.length === 0) return 'N/A'
  const maxIndex = props.data.indexOf(Math.max(...props.data))
  return props.labels[maxIndex] || 'N/A'
})

// Methods
const createGradient = (ctx, chartArea, color, index) => {
  const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
  const baseColors = [
    'rgba(189, 240, 0, 0.8)',
    'rgba(76, 175, 80, 0.8)',
    'rgba(255, 152, 0, 0.8)',
    'rgba(156, 39, 176, 0.8)',
    'rgba(33, 150, 243, 0.8)'
  ]
  const baseColor = baseColors[index % baseColors.length]
  gradient.addColorStop(0, baseColor.replace('0.8', '0.6'))
  gradient.addColorStop(0.5, baseColor)
  gradient.addColorStop(1, baseColor.replace('0.8', '0.9'))
  return gradient
}

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  
  // Demo data if no data provided
  const chartData = props.data.length > 0 ? props.data : [45, 32, 28, 22, 18]
  const chartLabels = props.labels.length > 0 ? props.labels : ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia']
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: props.title,
        data: chartData,
        backgroundColor: function(context) {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return 'rgba(189, 240, 0, 0.8)'
          return createGradient(ctx, chartArea, null, context.dataIndex)
        },
        borderColor: function(context) {
          const borderColors = [
            '#bdf000',
            '#4CAF50',
            '#FF9800',
            '#9C27B0',
            '#2196F3'
          ]
          return borderColors[context.dataIndex % borderColors.length]
        },
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: function(context) {
          const hoverColors = [
            'rgba(189, 240, 0, 1)',
            'rgba(76, 175, 80, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(33, 150, 243, 1)'
          ]
          return hoverColors[context.dataIndex % hoverColors.length]
        },
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: props.animationDuration,
        easing: 'easeOutQuart',
        onProgress: function() {
          // Smooth animation progress
        },
        onComplete: function() {
          // Animation complete callback
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
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
              return `${context.parsed.x}%`
            },
            title: function(context) {
              return context[0].label
            },
            labelColor: function(context) {
              return {
                borderColor: context.dataset.borderColor[context.dataIndex],
                backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                borderWidth: 2,
                borderRadius: 2
              }
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#ccc',
            callback: function(value) {
              return value + '%'
            },
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Percentage',
            color: '#999',
            font: {
              size: 12
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#ccc',
            font: {
              size: 12
            },
            mirror: true,
            padding: 8
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
watch(() => props.data, () => {
  if (chartInstance) {
    const chartData = props.data.length > 0 ? props.data : [45, 32, 28, 22, 18]
    const chartLabels = props.labels.length > 0 ? props.labels : ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia']
    
    chartInstance.data.labels = chartLabels
    chartInstance.data.datasets[0].data = chartData
    chartInstance.update('active')
  }
}, { deep: true })

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
  if (chartInstance) {
    chartInstance.destroy()
  }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  animation: fadeInDown 0.6s ease;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #bdf000;
  margin: 0;
}

.info-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.info-icon:hover {
  color: #bdf000 !important;
  transform: scale(1.1);
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
  margin: 10px 0;
  transition: all 0.3s ease;
}

.chart-footer {
  display: flex;
  justify-content: space-around;
  gap: 15px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease;
}

.stat-item {
  text-align: center;
  padding: 8px 12px;
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
  color: #9ca3af;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #bdf000;
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

/* Responsive design */
@media (max-width: 768px) {
  .chart-container {
    padding: 15px;
    border-radius: 12px;
  }
  
  .chart-title {
    font-size: 1rem;
  }
  
  .chart-wrapper {
    height: 250px;
  }
  
  .chart-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-item {
    padding: 6px 10px;
  }
  
  .stat-value {
    font-size: 0.875rem;
  }
}
</style>
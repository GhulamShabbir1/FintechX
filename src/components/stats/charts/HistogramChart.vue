<template>
  <q-card class="q-pa-md lime-glow chart-card">
    <div class="chart-header">
      <div class="text-subtitle1 q-mb-sm chart-title">Payment Method Distribution</div>
      <q-icon name="info" size="sm" color="grey-5" class="info-icon">
        <q-tooltip>Distribution of payment methods used by customers</q-tooltip>
      </q-icon>
    </div>
    <div class="chart-container">
      <canvas ref="el" height="130"></canvas>
    </div>
    <div class="chart-footer" v-if="showStats">
      <div class="stat-item">
        <div class="stat-label">Total Transactions</div>
        <div class="stat-value">{{ totalTransactions }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Most Used</div>
        <div class="stat-value">{{ mostUsedMethod }}</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  showStats: { type: Boolean, default: true }
})

const el = ref(null)
let chart = null

// Computed properties
const totalTransactions = computed(() => {
  return props.data.reduce((sum, value) => sum + value, 0)
})

const mostUsedMethod = computed(() => {
  if (props.data.length === 0) return 'N/A'
  const maxIndex = props.data.indexOf(Math.max(...props.data))
  return props.labels[maxIndex] || 'N/A'
})

// Method to create gradient
const createGradient = (ctx, chartArea) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  gradient.addColorStop(0, 'rgba(189, 240, 0, 0.2)')
  gradient.addColorStop(0.5, 'rgba(189, 240, 0, 0.4)')
  gradient.addColorStop(1, 'rgba(189, 240, 0, 0.6)')
  return gradient
}

const draw = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  
  const ctx = el.value.getContext('2d')
  
  // Default data if none provided
  const labels = props.labels.length > 0 ? props.labels : ['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay']
  const data = props.data.length > 0 ? props.data : [45, 30, 15, 7, 3]

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Transactions',
        data: data,
        backgroundColor: function(context) {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return 'rgba(189, 240, 0, 0.35)'
          return createGradient(ctx, chartArea)
        },
        borderColor: '#bdf000',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: '#bdf000',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }]
    },
    options: {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      animation: { 
        duration: 1500, 
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
          enabled: true,
          backgroundColor: 'rgba(18, 18, 18, 0.95)',
          titleColor: '#bdf000',
          bodyColor: '#ffffff',
          borderColor: 'rgba(189, 240, 0, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} transactions`
            },
            title: function(context) {
              return context[0].label
            }
          }
        } 
      },
      scales: {
        x: { 
          grid: { 
            color: 'rgba(255,255,255,0.06)',
            drawBorder: false
          }, 
          ticks: { 
            color: '#9ca3af',
            font: {
              size: 11
            }
          } 
        },
        y: { 
          grid: { 
            color: 'rgba(255,255,255,0.06)',
            drawBorder: false
          }, 
          ticks: { 
            color: '#9ca3af',
            font: {
              size: 11
            },
            precision: 0
          },
          beginAtZero: true
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
watch(() => [props.labels, props.data], () => {
  if (chart) {
    // Smooth transition for data updates
    chart.data.labels = props.labels.length > 0 ? props.labels : ['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay']
    chart.data.datasets[0].data = props.data.length > 0 ? props.data : [45, 30, 15, 7, 3]
    chart.update('active')
  }
}, { deep: true })

onMounted(() => {
  draw()
  
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
</script>

<style scoped>
.chart-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #0a0a0a 0%, #121018 100%);
  color: #fff;
  border: 1px solid rgba(189,240,0,0.28);
  box-shadow:
    0 10px 28px rgba(0,0,0,0.35),
    0 0 0 1px rgba(189,240,0,0.28),
    0 0 24px rgba(189,240,0,0.18);
  transition: all 0.3s ease;
  overflow: hidden;
}

.chart-card:hover {
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

.info-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.info-icon:hover {
  color: #bdf000 !important;
  transform: scale(1.1);
}

.chart-container {
  position: relative;
  height: 130px;
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
  .chart-card {
    border-radius: 12px;
    padding: 12px;
  }
  
  .chart-title {
    font-size: 1rem;
  }
  
  .chart-container {
    height: 120px;
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
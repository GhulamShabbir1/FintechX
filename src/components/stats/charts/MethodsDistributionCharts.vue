<template>
  <q-card class="lime-glow q-pa-md chart-card">
    <div class="chart-header">
      <div class="text-subtitle1 q-mb-sm chart-title">Payment Methods</div>
      <q-icon name="pie_chart" color="lime" size="sm" class="chart-icon" />
    </div>
    
    <div class="chart-container">
      <canvas ref="el" height="220"></canvas>
      
      <!-- Center text for doughnut chart -->
      <div class="chart-center-text" v-if="totalPercentage > 0">
        <div class="total-percentage">{{ totalPercentage }}%</div>
        <div class="total-label">Total</div>
      </div>
    </div>

    <div class="chart-footer" v-if="showStats">
      <div class="stat-item" v-for="(method, index) in topMethods" :key="method.label">
        <div class="stat-color" :style="{ backgroundColor: colors.value[index] }"></div>
        <div class="stat-label">{{ method.label }}</div>
        <div class="stat-value">{{ method.value }}%</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  showStats: { type: Boolean, default: true }
})

const palette = ['#bdf000', '#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f87171']
const colors = computed(() => props.labels.map((_, i) => palette[i % palette.length]))

const el = ref(null)
let chart = null

// Computed properties
const totalPercentage = computed(() => {
  return props.data.reduce((sum, value) => sum + value, 0).toFixed(0)
})

const topMethods = computed(() => {
  return props.labels.map((label, index) => ({
    label,
    value: props.data[index] || 0
  })).sort((a, b) => b.value - a.value).slice(0, 3)
})

// Methods
const createHoverGradient = (baseColor, ctx, chartArea) => {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  gradient.addColorStop(0, baseColor.replace(')', ', 0.9)'))
  gradient.addColorStop(1, baseColor.replace(')', ', 0.7)'))
  return gradient
}

const build = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  
  const ctx = el.value.getContext('2d')
  
  // Default data if none provided
  const chartData = props.data.length > 0 ? props.data : [45, 25, 15, 10, 5]
  const chartLabels = props.labels.length > 0 ? props.labels : ['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay']
  
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: colors.value,
        borderWidth: 2,
        borderColor: '#121018',
        hoverBackgroundColor: function(context) {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return colors.value[context.dataIndex]
          return createHoverGradient(colors.value[context.dataIndex], ctx, chartArea)
        },
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
        borderRadius: 6,
        spacing: 2
      }]
    },
    options: {
      cutout: '65%',
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
        animateScale: true,
        animateRotate: true
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#a0a0a0',
            font: {
              size: 11
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
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
            label: (ctx) => `${ctx.label}: ${ctx.raw}%`,
            labelColor: function(context) {
              return {
                borderColor: colors.value[context.dataIndex],
                backgroundColor: colors.value[context.dataIndex],
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
watch(() => [props.labels, props.data], () => {
  if (chart) {
    const chartData = props.data.length > 0 ? props.data : [45, 25, 15, 10, 5]
    const chartLabels = props.labels.length > 0 ? props.labels : ['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay']
    
    chart.data.labels = chartLabels
    chart.data.datasets[0].data = chartData
    chart.update('active')
  }
}, { deep: true })

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
  height: 380px;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 10px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  animation: fadeIn 1s ease;
}

.total-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #bdf000;
  line-height: 1;
  margin-bottom: 4px;
}

.total-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateX(5px);
}

.stat-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-label {
  flex: 1;
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #bdf000;
  flex-shrink: 0;
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

/* Responsive design */
@media (max-width: 768px) {
  .chart-card {
    height: 350px;
    padding: 12px;
    border-radius: 12px;
  }
  
  .chart-title {
    font-size: 1rem;
  }
  
  .total-percentage {
    font-size: 1.25rem;
  }
  
  .stat-item {
    padding: 4px 0;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .stat-value {
    font-size: 0.8rem;
  }
}
</style>
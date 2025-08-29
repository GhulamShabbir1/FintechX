<template>
  <div class="methods-chart">
    <div v-if="loading" class="chart-loading">
      <q-spinner-dots color="lime" size="30px" />
      <p>Loading payment methods...</p>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="chart-empty">
      <q-icon name="payment" size="48px" color="grey-5" />
      <p>No payment method data available</p>
    </div>
    
    <div v-else class="chart-content">
      <!-- Doughnut Chart -->
      <div class="chart-container">
        <canvas ref="chartCanvas" width="300" height="300"></canvas>
      </div>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div v-for="(item, index) in chartData" :key="index" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: item.backgroundColor }"></div>
          <div class="legend-text">
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.percentage }}%</span>
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
  
  const total = props.data.reduce((sum, item) => sum + (item.value || 0), 0)
  
  return props.data.map((item, index) => {
    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
    return {
      label: item.label || `Method ${index + 1}`,
      value: item.value || 0,
      percentage,
      backgroundColor: getChartColor(index),
      borderColor: getChartColor(index, 0.8)
    }
  })
})

// Chart color palette
const getChartColor = (index, alpha = 1) => {
  const colors = [
    `rgba(189, 240, 0, ${alpha})`,    // Lime
    `rgba(33, 150, 243, ${alpha})`,   // Blue
    `rgba(156, 39, 176, ${alpha})`,   // Purple
    `rgba(255, 193, 7, ${alpha})`,    // Amber
    `rgba(76, 175, 80, ${alpha})`,    // Green
    `rgba(244, 67, 54, ${alpha})`,    // Red
    `rgba(255, 87, 34, ${alpha})`,    // Deep Orange
    `rgba(121, 85, 72, ${alpha})`     // Brown
  ]
  return colors[index % colors.length]
}

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
    type: 'doughnut',
    data: {
      labels: chartData.value.map(item => item.label),
      datasets: [{
        data: chartData.value.map(item => item.value),
        backgroundColor: chartData.value.map(item => item.backgroundColor),
        borderColor: chartData.value.map(item => item.borderColor),
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverOffset: 8
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
          borderColor: '#bdf000',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%',
      animation: {
        animateRotate: true,
        animateScale: true,
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
</script>

<style scoped>
.methods-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  align-items: center;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
}

.chart-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 120px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.legend-label {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  color: #bdf000;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 12px;
}

/* Scrollbar styling */
.chart-legend::-webkit-scrollbar {
  width: 4px;
}

.chart-legend::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.chart-legend::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.5);
  border-radius: 2px;
}

.chart-legend::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    height: 180px;
  }
  
  .legend-item {
    padding: 6px;
  }
  
  .legend-label {
    font-size: 0.8rem;
  }
  
  .legend-value {
    font-size: 0.8rem;
  }
}
</style>
<template>
  <div class="geography-chart">
    <div v-if="loading" class="chart-loading">
      <q-spinner-dots color="lime" size="30px" />
      <p>Loading geographic data...</p>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="chart-empty">
      <q-icon name="public" size="48px" color="grey-5" />
      <p>No geographic data available</p>
    </div>
    
    <div v-else class="chart-content">
      <div class="chart-container">
        <canvas ref="chartCanvas" width="300" height="200"></canvas>
      </div>
      
      <!-- Top Locations -->
      <div class="top-locations">
        <h4 class="locations-title">Top Locations</h4>
        <div class="location-list">
          <div v-for="(location, index) in topLocations" :key="index" class="location-item">
            <div class="location-rank">{{ index + 1 }}</div>
            <div class="location-info">
              <div class="location-name">{{ location.name }}</div>
              <div class="location-stats">
                <span class="location-customers">{{ location.customers }} customers</span>
                <span class="location-revenue">${{ (location.revenue / 100).toFixed(2) }}</span>
              </div>
            </div>
            <div class="location-percentage">{{ location.percentage }}%</div>
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
  
  const total = props.data.reduce((sum, item) => sum + (item.customers || item.value || 0), 0)
  
  return props.data.map((item, index) => {
    const customers = item.customers || item.value || 0
    const percentage = total > 0 ? Math.round((customers / total) * 100) : 0
    
    return {
      name: item.name || item.location || `Location ${index + 1}`,
      customers,
      revenue: item.revenue || item.amount || 0,
      percentage,
      backgroundColor: getChartColor(index),
      borderColor: getChartColor(index, 0.8)
    }
  }).sort((a, b) => b.customers - a.customers)
})

// Get top 5 locations
const topLocations = computed(() => {
  return chartData.value.slice(0, 5)
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
      labels: chartData.value.map(item => item.name),
      datasets: [{
        data: chartData.value.map(item => item.customers),
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
              return `${label}: ${value} customers (${percentage}%)`
            }
          }
        }
      },
      cutout: '50%',
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
.geography-chart {
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

.top-locations {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.locations-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  text-align: center;
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 120px;
  overflow-y: auto;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.location-item:hover {
  background: rgba(189, 240, 0, 0.1);
  border-color: rgba(189, 240, 0, 0.3);
}

.location-rank {
  width: 24px;
  height: 24px;
  background: #bdf000;
  color: #09050d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.location-info {
  flex: 1;
  min-width: 0;
}

.location-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-stats {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
  color: #999;
}

.location-customers {
  color: #2196f3;
}

.location-revenue {
  color: #4caf50;
}

.location-percentage {
  font-size: 0.9rem;
  font-weight: 600;
  color: #bdf000;
  flex-shrink: 0;
}

/* Scrollbar styling */
.location-list::-webkit-scrollbar {
  width: 4px;
}

.location-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.location-list::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 5);
  border-radius: 2px;
}

.location-list::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    height: 180px;
  }
  
  .location-item {
    padding: 10px;
  }
  
  .location-stats {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
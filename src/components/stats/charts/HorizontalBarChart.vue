<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" height="300"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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
    default: 'Data Distribution'
  }
})

// Template refs
const chartCanvas = ref(null)
let chartInstance = null

// Methods
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
        backgroundColor: [
          'rgba(189, 240, 0, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(33, 150, 243, 0.8)'
        ],
        borderColor: [
          '#bdf000',
          '#4CAF50',
          '#FF9800',
          '#9C27B0',
          '#2196F3'
        ],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
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
          callbacks: {
            label: function(context) {
              return `${context.parsed.x}%`
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ccc',
            callback: function(value) {
              return value + '%'
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ccc',
            font: {
              size: 12
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })
}

// Watch for data changes
watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.destroy()
    createChart()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  createChart()
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
  height: 300px;
  width: 100%;
}
</style>
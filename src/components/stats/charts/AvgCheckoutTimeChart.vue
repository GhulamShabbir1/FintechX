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
        backgroundColor: 'rgba(189, 240, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#bdf000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
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
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} minutes`
            }
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
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ccc'
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
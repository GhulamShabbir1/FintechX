src/components/stats/charts/AvgCheckoutTimeChart.vue
<template>
  <q-card class="lime-glow q-pa-md">
    <div class="text-subtitle1 q-mb-sm">Average Checkout Time (s)</div>
    <canvas ref="el" height="120"></canvas>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] }
})

const el = ref(null)
let chart

const build = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  chart = new Chart(el.value.getContext('2d'), {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [{
        label: 'Avg Time',
        data: props.data,
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700 },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a0a0a0' } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a0a0a0' } }
      },
      plugins: { legend: { labels: { color: '#a0a0a0' } } }
    }
  })
}

watch(() => [props.labels, props.data], build, { deep: true })
onMounted(build)
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<style scoped>
.lime-glow {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(189,240,0,0.28), 0 0 24px rgba(189,240,0,0.18);
  background: linear-gradient(135deg, #000000 0%, #121018 100%);
  color: #fff;
  height: 320px;
}
</style>
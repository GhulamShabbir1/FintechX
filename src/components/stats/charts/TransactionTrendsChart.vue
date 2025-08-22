src/components/stats/charts/TransactionTrendsChart.vue
<template>
  <q-card class="lime-glow q-pa-md">
    <div class="text-subtitle1 q-mb-sm">Transactions: Success vs Failed</div>
    <canvas ref="el" height="130"></canvas>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] } // stacked bars expected
})

const el = ref(null)
let chart

const build = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  chart = new Chart(el.value.getContext('2d'), {
    type: 'bar',
    data: { labels: props.labels, datasets: props.datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a0a0a0' } },
        y: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a0a0a0' } }
      },
      plugins: { legend: { labels: { color: '#a0a0a0' } } },
      animation: { duration: 700 }
    }
  })
}

watch(() => [props.labels, props.datasets], build, { deep: true })
onMounted(build)
onBeforeUnmount(() => { if (chart) chart.destroy() })
</script>

<style scoped>
.lime-glow {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(189,240,0,0.28), 0 0 24px rgba(189,240,0,0.18);
  background: linear-gradient(135deg, #000000 0%, #121018 100%);
  color: #fff;
  height: 360px;
}
</style>
<template>
  <q-card class="q-pa-md lime-glow">
    <div class="text-subtitle1 q-mb-sm">Distribution</div>
    <canvas ref="el" height="130"></canvas>
  </q-card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] }
})

const el = ref(null)
let chart

const draw = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  const ctx = el.value.getContext('2d')

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        label: 'Frequency',
        data: props.data,
        backgroundColor: 'rgba(189, 240, 0, 0.35)',
        borderColor: '#bdf000',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'x',
      responsive: true,
      animation: { duration: 1000, easing: 'easeOutQuart' },
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9ca3af' } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9ca3af' } }
      }
    }
  })
}

onMounted(draw)
watch(() => [props.labels, props.data], draw, { deep: true })
</script>

<style scoped>
.lime-glow {
  border-radius: 14px;
  background: #000;
  color: #fff;
  border: 1px solid rgba(189,240,0,0.28);
  box-shadow:
    0 10px 28px rgba(0,0,0,0.35),
    0 0 0 1px rgba(189,240,0,0.28),
    0 0 24px rgba(189,240,0,0.18);
}
</style>
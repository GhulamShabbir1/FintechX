<template>
  <q-card class="q-pa-md lime-glow">
    <div class="text-subtitle1 q-mb-sm">Payment Methods</div>
    <canvas ref="el" height="220"></canvas>
  </q-card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] }
})

const el = ref(null)
let chart
const palette = ['#bdf000', '#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f87171']

const draw = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  const ctx = el.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: props.data.map((_, i) => palette[i % palette.length]),
        borderColor: 'rgba(0,0,0,0)',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: 'easeOutBack' },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#d1d5db' } },
        tooltip: { enabled: true }
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
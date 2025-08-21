<template>
  <q-card class="q-pa-md lime-glow">
    <div class="text-subtitle1 q-mb-sm">Revenue</div>
    <canvas ref="canvasEl" height="130"></canvas>
  </q-card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] } // [{label, data, color}]
})

const canvasEl = ref(null)
let chart

const draw = () => {
  if (!canvasEl.value) return
  if (chart) { chart.destroy() }

  const ctx = canvasEl.value.getContext('2d')

  const datasets = props.datasets.map((ds) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 220)
    gradient.addColorStop(0, (ds.color || '#bdf000') + 'AA')
    gradient.addColorStop(1, '#00000000')
    return {
      label: ds.label || 'Series',
      data: ds.data || [],
      borderColor: ds.color || '#bdf000',
      backgroundColor: gradient,
      borderWidth: 3,
      tension: 0.35,
      pointRadius: 0,
      fill: true
    }
  })

  const shadowPlugin = {
    id: 'shadowLine',
    beforeDatasetDraw(chart, args) {
      const { ctx } = chart
      ctx.save()
      ctx.shadowColor = (datasets[args.index].borderColor || '#bdf000')
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 6
      ctx.lineJoin = 'round'
    },
    afterDatasetDraw(chart) {
      chart.ctx.restore()
    }
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: props.labels, datasets },
    options: {
      responsive: true,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: { legend: { display: true }, tooltip: { enabled: true } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9ca3af' } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9ca3af' } }
      }
    },
    plugins: [shadowPlugin]
  })
}

onMounted(draw)
watch(() => [props.labels, props.datasets], draw, { deep: true })
</script>

<style scoped>
.lime-glow {
  border-radius: 14px;
  background: #000;
  color: #fff;
  border: 1px solid rgba(189, 240, 0, 0.28);
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(189, 240, 0, 0.28),
    0 0 24px rgba(189, 240, 0, 0.18);
}
</style>
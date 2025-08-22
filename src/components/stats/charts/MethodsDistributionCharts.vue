src/components/stats/charts/MethodsDistributionCharts.vue
<template>
  <q-card class="lime-glow q-pa-md">
    <div class="text-subtitle1 q-mb-sm">Payment Methods</div>
    <canvas ref="el" height="220"></canvas>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] }
})

const palette = ['#bdf000', '#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f87171']
const colors = computed(() => props.labels.map((_, i) => palette[i % palette.length]))

const el = ref(null)
let chart

const build = () => {
  if (!el.value) return
  if (chart) chart.destroy()
  chart = new Chart(el.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [{ data: props.data, backgroundColor: colors.value, borderWidth: 0 }]
    },
    options: {
      cutout: '58%',
      animation: { duration: 700, easing: 'easeOutQuart' },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#a0a0a0' } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } }
      }
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
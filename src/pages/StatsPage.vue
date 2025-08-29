<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col-grow">
        <div class="text-h6">Analytics</div>
      </div>
    </div>
    <q-card class="q-pa-md q-mb-md">
      <FiltersPanel v-model="filters" />
    </q-card>
    <StatsDashboard :filters="filters" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useStatsStore } from '../store/stats'
import { pinia } from '../store/pinia'
import StatsDashboard from '../components/stats/StatsDashboard.vue'
import FiltersPanel from '../components/stats/FiltersPanel.vue'

const filters = ref({ startDate: '', endDate: '', merchantId: '' })

const stats = useStatsStore(pinia)

// Auto-refresh support (every 60s) while on the page
let intervalId = null
onMounted(() => {
  stats.loadAll(filters.value)
  intervalId = setInterval(() => {
    stats.loadAll(filters.value)
  }, 60000)
})

watch(filters, (val) => {
  stats.loadAll(val)
}, { deep: true })

// Quasar auto-cleans intervals when component unmounts, but add a guard
onUnmounted?.(() => { if (intervalId) clearInterval(intervalId) })
</script>

<style scoped>
</style>

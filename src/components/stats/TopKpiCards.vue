<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-6 col-md-3" v-for="k in kpis" :key="k.title">
      <q-card class="q-pa-md lime-glow elevated-hover">
        <div class="row items-center">
          <q-icon :name="k.icon" class="text-lime q-mr-sm" size="28px" />
          <div class="text-caption text-grey-5">{{ k.title }}</div>
        </div>
        <div class="text-h6 q-mt-xs" style="color:#fff">{{ k.value }}</div>
        <div class="text-caption" :class="k.delta >= 0 ? 'text-positive' : 'text-negative'">
          {{ k.delta >= 0 ? '+' : '' }}{{ k.delta }}% vs last period
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../boot/axios'

const kpis = ref([
  { title: 'Total Revenue', value: '—', delta: 0, icon: 'paid' },
  { title: 'Transactions', value: '—', delta: 0, icon: 'receipt_long' },
  { title: 'Success Rate', value: '—', delta: 0, icon: 'verified' },
  { title: 'Chargebacks', value: '—', delta: 0, icon: 'report' }
])

onMounted(async () => {
  try {
    const { data } = await api.get('/stats/summary')
    // Expecting: { revenue, txCount, successRate, chargebacks, deltas: {...} }
    if (data) {
      kpis.value = [
        { title: 'Total Revenue', value: data.revenue ?? '—', delta: data.deltas?.revenue ?? 0, icon: 'paid' },
        { title: 'Transactions', value: data.txCount ?? '—', delta: data.deltas?.txCount ?? 0, icon: 'receipt_long' },
        { title: 'Success Rate', value: data.successRate ?? '—', delta: data.deltas?.successRate ?? 0, icon: 'verified' },
        { title: 'Chargebacks', value: data.chargebacks ?? '—', delta: data.deltas?.chargebacks ?? 0, icon: 'report' }
      ]
    }
  } catch {
    // keep defaults
  }
})
</script>

<style scoped>
.text-lime { color: #bdf000; }
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
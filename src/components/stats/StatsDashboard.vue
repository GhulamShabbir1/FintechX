<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-8">
      <RevenueChart :labels="revenue.labels" :datasets="revenue.datasets" />
    </div>
    <div class="col-12 col-md-4">
      <MethodsDistributionCharts :labels="methods.labels" :data="methods.data" />
    </div>
    <div class="col-12">
      <TransactionTrendsChart :labels="trends.labels" :datasets="trends.datasets" />
    </div>
    <div class="col-12">
      <HistogramChart :labels="hist.labels" :data="hist.data" />
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue'
import api from '../../boot/axios'
import RevenueChart from './charts/RevenueChart.vue'
import MethodsDistributionCharts from './charts/MethodsDistributionCharts.vue'
import TransactionTrendsChart from './charts/TransactionTrendsChart.vue'
import HistogramChart from './charts/HistogramChart.vue'

const props = defineProps({ filters: { type: Object, default: () => ({}) } })
const { filters } = toRefs(props)

const revenue = ref({ labels: [], datasets: [] })
const methods = ref({ labels: [], data: [] })
const trends = ref({ labels: [], datasets: [] })
const hist = ref({ labels: [], data: [] })
const palette = ['#bdf000', '#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f87171']

const fetchAll = async () => {
  const params = {
    startDate: filters.value.startDate,
    endDate: filters.value.endDate,
    merchantId: filters.value.merchantId,
    businessId: filters.value.businessId
  }
  const [r, m, t] = await Promise.allSettled([
    api.get('/stats/revenue', { params }),
    api.get('/stats/methods', { params }),
    api.get('/stats/transactions', { params })
  ])

  // Revenue
  {
    const data = r.status === 'fulfilled' ? r.value.data : []
    if (Array.isArray(data)) {
      revenue.value.labels = data.map(d => d.date)
      revenue.value.datasets = [{ label: 'Revenue', data: data.map(d => d.amount), color: palette[0] }]
    } else if (data?.labels && Array.isArray(data.datasets)) {
      revenue.value.labels = data.labels
      revenue.value.datasets = data.datasets.map((ds, i) => ({ ...ds, color: ds.color || palette[i % palette.length] }))
    }
  }

  // Methods (pie)
  {
    const data = m.status === 'fulfilled' ? m.value.data : []
    if (Array.isArray(data)) {
      methods.value.labels = data.map(d => d.method)
      methods.value.data = data.map(d => d.value)
    } else if (data?.labels && Array.isArray(data.data)) {
      methods.value.labels = data.labels
      methods.value.data = data.data
    }
  }

  // Trends
  {
    const data = t.status === 'fulfilled' ? t.value.data : []
    if (Array.isArray(data)) {
      trends.value.labels = data.map(d => d.date)
      trends.value.datasets = [{ label: 'Transactions', data: data.map(d => d.count), color: palette[1] }]
    } else if (data?.labels && Array.isArray(data.datasets)) {
      trends.value.labels = data.labels
      trends.value.datasets = data.datasets.map((ds, i) => ({ ...ds, color: ds.color || palette[i % palette.length] }))
    }
  }

  // Histogram
  {
    const data = (t.status === 'fulfilled' ? t.value.data : {})?.buckets
    if (Array.isArray(data)) {
      hist.value.labels = data.map(b => b.label)
      hist.value.data = data.map(b => b.count)
    } else {
      hist.value.labels = trends.value.labels
      hist.value.data = trends.value.datasets[0]?.data || []
    }
  }
}

watch(filters, fetchAll, { deep: true, immediate: true })
</script>
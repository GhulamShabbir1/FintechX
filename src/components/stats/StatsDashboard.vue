src/components/stats/StatsDashboard.vue
<template>
  <div class="stats-dashboard">
    <div class="row items-center q-mb-md">
      <div class="text-h6 text-lime">Analytics</div>
      <q-space />
      <FiltersPanel v-model="filters" />
    </div>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6 col-md-3" v-for="k in kpis" :key="k.label">
        <q-card class="kpi-card lime-glow">
          <div class="kpi-top">
            <div class="kpi-label">{{ k.label }}</div>
            <q-chip dense :color="k.trendColor" text-color="white" square>{{ k.change }}</q-chip>
          </div>
          <div class="kpi-value">{{ k.value }}</div>
          <div class="kpi-sub">{{ k.sub }}</div>
        </q-card>
      </div>
    </div>

    <!-- Row 1 -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-8">
        <RevenueChart :labels="revenue.labels" :datasets="revenue.datasets" />
      </div>
      <div class="col-12 col-md-4">
        <MethodsDistributionCharts :labels="methods.labels" :data="methods.data" />
      </div>
    </div>

    <!-- Row 2 -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <TransactionTrendsChart :labels="trends.labels" :datasets="trends.datasets" />
      </div>
    </div>

    <!-- Row 3 -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <AvgCheckoutTimeChart :labels="avgCheckout.labels" :data="avgCheckout.data" />
      </div>
      <div class="col-12 col-md-6">
        <HorizontalBarChart title="Top Geographies" :labels="topGeos.labels" :data="topGeos.data" />
      </div>
      <div class="col-12 q-mt-md">
        <HorizontalBarChart title="Top Customers" :labels="topCustomers.labels" :data="topCustomers.data" />
      </div>
    </div>

    <q-inner-loading :showing="loading" class="loader">
      <q-spinner color="lime" size="lg" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '../../boot/axios'
import FiltersPanel from './FiltersPanel.vue'
import RevenueChart from './charts/RevenueChart.vue'
import MethodsDistributionCharts from './charts/MethodsDistributionCharts.vue'
import TransactionTrendsChart from './charts/TransactionTrendsChart.vue'
import AvgCheckoutTimeChart from './charts/AvgCheckoutTimeChart.vue'
import HorizontalBarChart from './charts/HorizontalBarChart.vue'

const loading = ref(false)
const filters = ref({
  interval: 'daily',
  startDate: '',
  endDate: '',
  merchantId: null
})

const kpis = ref([
  { label: 'Revenue', value: '$0.00', change: '+0%', trendColor: 'blue', sub: 'vs prev period' },
  { label: 'Transactions', value: '0', change: '+0%', trendColor: 'blue', sub: 'vs prev period' },
  { label: 'Success Rate', value: '0%', change: '+0%', trendColor: 'blue', sub: 'completion' },
  { label: 'Chargebacks', value: '0', change: '-0%', trendColor: 'green', sub: 'lower is better' }
])

const revenue = ref({ labels: [], datasets: [] })
const methods = ref({ labels: [], data: [] })
const trends = ref({ labels: [], datasets: [] })
const avgCheckout = ref({ labels: [], data: [] })
const topGeos = ref({ labels: [], data: [] })
const topCustomers = ref({ labels: [], data: [] })

const fetchStats = async () => {
  try {
    loading.value = true
    const params = {
      interval: filters.value.interval,
      start: filters.value.startDate,
      end: filters.value.endDate,
      merchantId: filters.value.merchantId
    }
    const { data } = await api.get('/stats/overview', { params })
    mapData(data)
  } catch {
    // fallback demo data
    demoData()
  } finally {
    loading.value = false
  }
}

const mapData = (data) => {
  // KPI
  kpis.value = [
    {
      label: 'Revenue',
      value: fmtCurrency(data.kpis?.revenue || 0),
      change: deltaToStr(data.kpis?.revenue_delta || 0),
      trendColor: (data.kpis?.revenue_delta || 0) >= 0 ? 'green' : 'red',
      sub: 'vs prev period'
    },
    {
      label: 'Transactions',
      value: (data.kpis?.transactions || 0).toLocaleString(),
      change: deltaToStr(data.kpis?.transactions_delta || 0),
      trendColor: (data.kpis?.transactions_delta || 0) >= 0 ? 'green' : 'red',
      sub: 'vs prev period'
    },
    {
      label: 'Success Rate',
      value: `${Math.round(data.kpis?.success_rate || 0)}%`,
      change: deltaToStr(data.kpis?.success_delta || 0),
      trendColor: (data.kpis?.success_delta || 0) >= 0 ? 'green' : 'red',
      sub: 'completion'
    },
    {
      label: 'Chargebacks',
      value: (data.kpis?.chargebacks || 0).toLocaleString(),
      change: deltaToStr(-(data.kpis?.chargebacks_delta || 0)),
      trendColor: 'green',
      sub: 'lower is better'
    }
  ]

  revenue.value = {
    labels: data.revenue?.labels || [],
    datasets: (data.revenue?.series || []).map((s, i) => ({
      label: s.name || `Series ${i + 1}`,
      data: s.data || [],
      borderColor: s.color || palette[i % palette.length],
      backgroundColor: (ctx) => gradient(ctx, s.color || palette[i % palette.length], 0.18),
      tension: 0.35,
      fill: true,
      pointRadius: 0
    }))
  }

  methods.value = {
    labels: data.methods?.labels || [],
    data: data.methods?.data || []
  }

  trends.value = {
    labels: data.trends?.labels || [],
    datasets: (data.trends?.series || []).map((s, i) => ({
      label: s.name || `Series ${i + 1}`,
      data: s.data || [],
      backgroundColor: s.color || palette[i % palette.length],
      borderColor: s.color || palette[i % palette.length],
      borderWidth: 1,
      stack: 'total'
    }))
  }

  avgCheckout.value = {
    labels: data.avg_checkout?.labels || [],
    data: data.avg_checkout?.data || []
  }

  topGeos.value = {
    labels: (data.top_geographies || []).map(g => g.name),
    data: (data.top_geographies || []).map(g => g.value)
  }

  topCustomers.value = {
    labels: (data.top_customers || []).map(c => c.name),
    data: (data.top_customers || []).map(c => c.value)
  }
}

const demoData = () => {
  const labels = genDates(filters.value.startDate, filters.value.endDate, filters.value.interval)
  revenue.value = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: labels.map(() => rnd(1200, 5200)),
        borderColor: '#bdf000',
        backgroundColor: (ctx) => gradient(ctx, '#bdf000', 0.2),
        tension: 0.35,
        fill: true,
        pointRadius: 0
      }
    ]
  }
  methods.value = {
    labels: ['Card', 'Apple Pay', 'Google Pay', 'PayPal', 'Bank'],
    data: [45, 20, 15, 12, 8]
  }
  trends.value = {
    labels,
    datasets: [
      { label: 'Successful', data: labels.map(() => rnd(70, 100)), backgroundColor: '#22c55e', stack: 'total' },
      { label: 'Failed', data: labels.map(() => rnd(5, 20)), backgroundColor: '#ef4444', stack: 'total' }
    ]
  }
  avgCheckout.value = { labels, data: labels.map(() => rnd(12, 28)) }
  topGeos.value = { labels: ['US', 'UK', 'DE', 'IN', 'CA'], data: [52000, 33000, 28000, 25000, 22000] }
  topCustomers.value = { labels: ['Acme Inc', 'Globex', 'Wayne', 'Stark', 'Wonka'], data: [14000, 12000, 9800, 9200, 8800] }
  kpis.value = [
    { label: 'Revenue', value: fmtCurrency(382200), change: '+8.2%', trendColor: 'green', sub: 'vs prev period' },
    { label: 'Transactions', value: '12,483', change: '+3.1%', trendColor: 'green', sub: 'vs prev period' },
    { label: 'Success Rate', value: '96%', change: '+1.2%', trendColor: 'green', sub: 'completion' },
    { label: 'Chargebacks', value: '12', change: '-5.0%', trendColor: 'green', sub: 'lower is better' }
  ]
}

const gradient = (ctx, color, alpha = 0.2) => {
  const canvas = ctx.chart.ctx
  const g = canvas.createLinearGradient(0, 0, 0, 180)
  g.addColorStop(0, hexToRgba(color, alpha))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  return g
}
const hexToRgba = (hex, a) => {
  const c = hex.replace('#', '')
  const bigint = parseInt(c, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r},${g},${b},${a})`
}
const palette = ['#bdf000', '#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f87171']

const fmtCurrency = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100)
const deltaToStr = (n) => `${n >= 0 ? '+' : ''}${(Math.abs(n) * 100).toFixed(1)}%`
const rnd = (min, max) => Math.round(Math.random() * (max - min) + min)

const genDates = (start, end, interval) => {
  const result = []
  const s = start ? new Date(start) : new Date(Date.now() - 29 * 86400000)
  const e = end ? new Date(end) : new Date()
  const d = new Date(s)
  while (d <= e) {
    if (interval === 'monthly') result.push(d.toLocaleString('en-US', { month: 'short', year: '2-digit' }))
    else result.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    d.setDate(d.getDate() + (interval === 'weekly' ? 7 : interval === 'monthly' ? 30 : 1))
  }
  return result
}

watch(filters, fetchStats, { deep: true })
onMounted(fetchStats)
</script>

<style scoped>
.stats-dashboard { position: relative; }
.text-lime { color: #bdf000; }
.lime-glow {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(189,240,0,0.28), 0 0 24px rgba(189,240,0,0.18);
  background: linear-gradient(135deg, #000000 0%, #121018 100%);
  color: #fff;
}
.kpi-card { padding: 16px; }
.kpi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.kpi-label { color: #a0a0a0; font-size: 0.85rem; }
.kpi-value { font-size: 1.8rem; font-weight: 800; }
.kpi-sub { color: #8b8b8b; font-size: 0.75rem; }
.loader {
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
}
</style>
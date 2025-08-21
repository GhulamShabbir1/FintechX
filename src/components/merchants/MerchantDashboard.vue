<template>
    <div class="q-gutter-lg">
        <!-- Header and Controls -->
        <div class="row items-center">
            <div class="text-h5 text-lime">Dashboard</div>
            <q-space />
            <q-select v-model="selectedBusinessId" :options="businessOptions" option-value="id"
                option-label="business_name" emit-value map-options dense outlined style="min-width: 240px"
                @update:model-value="onBusinessChange" :disable="!businessOptions.length"
                :placeholder="businessOptions.length ? 'Select business' : 'No businesses'" />
            <q-btn class="q-ml-sm btn-gradient" icon="add_business" label="Add Business" @click="showAdd = true" />
        </div>

        <!-- KPI Cards -->
        <TopKpiCards />

        <!-- Status + Profile -->
        <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-4">
                <MerchantStatusCard :status="store.status" :profile="store.profile" />
            </div>
            <div class="col-12 col-md-8">
                <q-card class="q-pa-md lime-glow">
                    <div class="row items-center q-mb-md">
                        <div class="text-subtitle1">Profile Overview</div>
                        <q-space />
                        <q-btn flat class="btn-outline-light" label="Edit Profile" @click="editing = !editing" />
                    </div>

                    <div class="row items-center q-col-gutter-md">
                        <div class="col-auto">
                            <q-avatar size="72px" square>
                                <img :src="store.profile?.logo_url || placeholderLogo" />
                            </q-avatar>
                        </div>
                        <div class="col">
                            <div class="text-body1 text-weight-medium">{{ store.profile?.business_name || '—' }}</div>
                            <div class="text-caption">{{ store.profile?.email || '—' }}</div>
                            <div class="text-caption">{{ store.profile?.website || '—' }}</div>
                        </div>
                    </div>

                    <q-slide-transition>
                        <div v-show="editing" class="q-mt-md">
                            <MerchantProfileForm />
                        </div>
                    </q-slide-transition>
                </q-card>
            </div>
        </div>

        <!-- Filters + Charts -->
        <q-card class="q-pa-md q-mt-md lime-glow">
            <div class="row items-center q-mb-md">
                <div class="text-subtitle1">Performance</div>
                <q-space />
                <FiltersPanel v-model="filters" />
            </div>
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
        </q-card>

        <!-- Add Business Dialog -->
        <AddBusinessDialog v-model="showAdd" :merchant-id="store.profile?.id" @created="refreshBusinesses" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useMerchantStore } from '../../store/merchant'
import { pinia } from '../../store/pinia'
import MerchantStatusCard from './MerchantStatusCard.vue'
import MerchantProfileForm from './MerchantProfileForm.vue'
import AddBusinessDialog from './AddBusinessDialog.vue'
import TopKpiCards from '../stats/TopKpiCards.vue'
import FiltersPanel from '../stats/FiltersPanel.vue'
import RevenueChart from '../stats/charts/RevenueChart.vue'
import MethodsDistributionCharts from '../stats/charts/MethodsDistributionCharts.vue'
import TransactionTrendsChart from '../stats/charts/TransactionTrendsChart.vue'
import HistogramChart from '../stats/charts/HistogramChart.vue'
import api from '../../boot/axios'

const store = useMerchantStore(pinia)
const editing = ref(false)
const showAdd = ref(false)
const placeholderLogo = 'https://placehold.co/120x120/121018/bdf000?text=LOGO'

const filters = ref({ startDate: null, endDate: null, merchantId: null, businessId: null })

// business switching
const businessOptions = ref([])
const selectedBusinessId = ref(null)

const refreshBusinesses = async () => {
    if (!store.profile?.id) return
    await store.fetchBusinesses(store.profile.id)
    businessOptions.value = store.businesses
    selectedBusinessId.value = store.currentBusinessId
    filters.value.businessId = selectedBusinessId.value
}
const onBusinessChange = (val) => {
    store.selectBusiness(val)
    filters.value.businessId = val
    fetchAll()
}

onMounted(async () => {
    if (store.profile?.id) {
        await refreshBusinesses()
    }
    await fetchAll()
})

// Stats fetched here to shape data for charts with colors + animation
const revenue = ref({ labels: [], datasets: [] })
const methods = ref({ labels: [], data: [] })
const trends = ref({ labels: [], datasets: [] })
const hist = ref({ labels: [], data: [] })

const palette = ['#bdf000', '#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f87171']

const fetchAll = async () => {
    const params = {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        merchantId: store.profile?.id,
        businessId: filters.value.businessId
    }
    const [r, m, t] = await Promise.allSettled([
        api.get('/stats/revenue', { params }),
        api.get('/stats/methods', { params }),
        api.get('/stats/transactions', { params })
    ])

    // Revenue (line/area)
    {
        const data = r.status === 'fulfilled' ? r.value.data : []
        if (Array.isArray(data)) {
            revenue.value.labels = data.map(d => d.date)
            revenue.value.datasets = [
                { label: 'Revenue', data: data.map(d => d.amount), color: palette[0] }
            ]
        } else if (data?.labels && Array.isArray(data.datasets)) {
            revenue.value.labels = data.labels
            revenue.value.datasets = data.datasets.map((ds, i) => ({
                ...ds, color: ds.color || palette[i % palette.length]
            }))
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

    // Trends (multi-line)
    {
        const data = t.status === 'fulfilled' ? t.value.data : []
        if (Array.isArray(data)) {
            trends.value.labels = data.map(d => d.date)
            trends.value.datasets = [
                { label: 'Transactions', data: data.map(d => d.count), color: palette[1] }
            ]
        } else if (data?.labels && Array.isArray(data.datasets)) {
            trends.value.labels = data.labels
            trends.value.datasets = data.datasets.map((ds, i) => ({
                ...ds, color: ds.color || palette[i % palette.length]
            }))
        }
    }

    // Histogram (buckets)
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

watch(filters, fetchAll, { deep: true })
</script>

<style scoped>
.text-lime {
    color: #bdf000;
}

.btn-outline-light {
    border: 1px solid #fff;
    color: #fff;
}

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

.btn-gradient {
    background: linear-gradient(135deg, #bdf000, #ffffff);
    color: #09050d;
    font-weight: 700;
    border: 1px solid rgba(189, 240, 0, 0.5);
}
</style>
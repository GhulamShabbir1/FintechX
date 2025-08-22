src/components/stats/FiltersPanel.vue
<template>
  <div class="filters-panel">
    <div class="row q-col-gutter-sm items-end">
      <div class="col-12 col-sm-4">
        <q-select
          v-model="local.interval"
          :options="intervalOptions"
          label="Interval"
          outlined
          dense
          emit-value
          map-options
          class="field"
        />
      </div>

      <div class="col-12 col-sm-4">
        <q-input
          v-model="local.startDate"
          label="Start Date"
          type="date"
          outlined
          dense
          class="field"
        >
          <template #prepend><q-icon name="event" color="lime" /></template>
        </q-input>
      </div>

      <div class="col-12 col-sm-4">
        <q-input
          v-model="local.endDate"
          label="End Date"
          type="date"
          outlined
          dense
          class="field"
        >
          <template #prepend><q-icon name="event" color="lime" /></template>
        </q-input>
      </div>

      <div class="col-12 col-sm-6">
        <q-select
          v-model="local.merchantId"
          :options="merchantOptions"
          label="Merchant"
          outlined
          dense
          clearable
          emit-value
          map-options
          class="field"
          :loading="loadingMerchants"
        >
          <template #prepend><q-icon name="store" color="lime" /></template>
        </q-select>
      </div>

      <div class="col-12 col-sm-6">
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <q-btn class="btn-gradient full-width" label="Last 7d" @click="quickRange(7)" />
          </div>
          <div class="col-4">
            <q-btn class="btn-gradient full-width" label="Last 30d" @click="quickRange(30)" />
          </div>
          <div class="col-4">
            <q-btn class="btn-gradient full-width" label="This Month" @click="thisMonth" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '../../boot/axios'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      interval: 'daily',
      startDate: '',
      endDate: '',
      merchantId: null
    })
  },
  fetchMerchants: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue'])

const intervalOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

const local = ref({ ...props.modelValue })
watch(() => props.modelValue, v => { local.value = { ...v } })

watch(local, v => {
  emit('update:modelValue', { ...v })
}, { deep: true })

const merchantOptions = ref([])
const loadingMerchants = ref(false)

const loadMerchants = async () => {
  if (!props.fetchMerchants) return
  try {
    loadingMerchants.value = true
    const { data } = await api.get('/merchants')
    merchantOptions.value = (data || []).map(m => ({ label: m.business_name, value: m.id }))
  } catch {
    merchantOptions.value = []
  } finally {
    loadingMerchants.value = false
  }
}

const fmt = (d) => d.toISOString().slice(0, 10)
const quickRange = (days) => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (days - 1))
  local.value.startDate = fmt(start)
  local.value.endDate = fmt(end)
}
const thisMonth = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  local.value.startDate = fmt(start)
  local.value.endDate = fmt(end)
}

onMounted(() => {
  if (!local.value.startDate || !local.value.endDate) quickRange(30)
  loadMerchants()
})
</script>

<style scoped>
.filters-panel {
  background: linear-gradient(135deg, #000000 0%, #121018 100%);
  border: 1px solid rgba(189,240,0,0.2);
  border-radius: 12px;
  padding: 12px;
}
.field :deep(.q-field__control) {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(189,240,0,0.28);
  border-radius: 10px;
}
.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 0.5);
}
.full-width { width: 100%; }
</style>
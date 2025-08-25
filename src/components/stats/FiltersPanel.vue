<template>
  <div class="filters-panel">
    <div class="panel-header">
      <div class="panel-title">
        <q-icon name="filter_alt" color="lime" size="sm" class="q-mr-sm" />
        Analytics Filters
      </div>
      <q-btn
        flat
        dense
        round
        icon="refresh"
        color="lime"
        @click="resetFilters"
        class="reset-btn"
      >
        <q-tooltip>Reset all filters</q-tooltip>
      </q-btn>
    </div>

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
          class="filter-field"
          :class="{ 'field-changed': local.interval !== defaultFilters.interval }"
        >
          <template #prepend><q-icon name="calendar_view_week" color="lime" /></template>
        </q-select>
      </div>

      <div class="col-12 col-sm-4">
        <q-input
          v-model="local.startDate"
          label="Start Date"
          type="date"
          outlined
          dense
          class="filter-field"
          :class="{ 'field-changed': local.startDate !== defaultFilters.startDate }"
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
          class="filter-field"
          :class="{ 'field-changed': local.endDate !== defaultFilters.endDate }"
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
          class="filter-field"
          :loading="loadingMerchants"
          :class="{ 'field-changed': local.merchantId !== defaultFilters.merchantId }"
        >
          <template #prepend><q-icon name="store" color="lime" /></template>
          <template #loading>
            <q-spinner-oval color="lime" size="sm" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-sm-6">
        <div class="row q-col-gutter-sm quick-buttons">
          <div class="col-4">
            <q-btn
              class="btn-gradient full-width"
              label="Last 7d"
              @click="quickRange(7)"
              icon="today"
              no-caps
            />
          </div>
          <div class="col-4">
            <q-btn
              class="btn-gradient full-width"
              label="Last 30d"
              @click="quickRange(30)"
              icon="date_range"
              no-caps
            />
          </div>
          <div class="col-4">
            <q-btn
              class="btn-gradient full-width"
              label="This Month"
              @click="thisMonth"
              icon="monthly"
              no-caps
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Badges -->
    <div class="active-filters" v-if="hasActiveFilters">
      <div class="active-filters-label">Active Filters:</div>
      <div class="filter-badges">
        <q-badge
          v-for="(filter, index) in activeFilters"
          :key="index"
          color="lime"
          text-color="dark"
          class="filter-badge"
          @click="removeFilter(filter)"
        >
          {{ filter.label }}: {{ filter.value }}
          <q-icon name="close" size="xs" class="q-ml-xs" />
        </q-badge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
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
const emit = defineEmits(['update:modelValue', 'filters-changed'])

const defaultFilters = {
  interval: 'daily',
  startDate: '',
  endDate: '',
  merchantId: null
}

const intervalOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

const local = ref({ ...props.modelValue })
watch(() => props.modelValue, v => { local.value = { ...v } })

watch(local, v => {
  emit('update:modelValue', { ...v })
  emit('filters-changed', { ...v })
}, { deep: true })

const merchantOptions = ref([])
const loadingMerchants = ref(false)

// Computed properties
const hasActiveFilters = computed(() => {
  return Object.keys(local.value).some(key => {
    if (key === 'merchantId') return local.value[key] !== null
    return local.value[key] !== defaultFilters[key] && local.value[key] !== ''
  })
})

const activeFilters = computed(() => {
  const filters = []
  
  if (local.value.interval !== defaultFilters.interval) {
    const option = intervalOptions.find(opt => opt.value === local.value.interval)
    filters.push({ key: 'interval', label: 'Interval', value: option?.label || local.value.interval })
  }
  
  if (local.value.startDate && local.value.startDate !== defaultFilters.startDate) {
    filters.push({ key: 'startDate', label: 'Start Date', value: formatDateDisplay(local.value.startDate) })
  }
  
  if (local.value.endDate && local.value.endDate !== defaultFilters.endDate) {
    filters.push({ key: 'endDate', label: 'End Date', value: formatDateDisplay(local.value.endDate) })
  }
  
  if (local.value.merchantId && local.value.merchantId !== defaultFilters.merchantId) {
    const merchant = merchantOptions.value.find(m => m.value === local.value.merchantId)
    filters.push({ key: 'merchantId', label: 'Merchant', value: merchant?.label || 'Selected' })
  }
  
  return filters
})

// Methods
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

const resetFilters = () => {
  local.value = { ...defaultFilters }
  // Set default date range to last 30 days
  quickRange(30)
}

const removeFilter = (filter) => {
  if (filter.key === 'interval') {
    local.value.interval = defaultFilters.interval
  } else if (filter.key === 'startDate') {
    local.value.startDate = defaultFilters.startDate
  } else if (filter.key === 'endDate') {
    local.value.endDate = defaultFilters.endDate
  } else if (filter.key === 'merchantId') {
    local.value.merchantId = defaultFilters.merchantId
  }
}

const formatDateDisplay = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  if (!local.value.startDate || !local.value.endDate) {
    quickRange(30)
  }
  loadMerchants()
})
</script>

<style scoped>
.filters-panel {
  background: linear-gradient(135deg, #0a0a0a 0%, #121018 100%);
  border: 1px solid rgba(189,240,0,0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.filters-panel:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-2px);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
  animation: fadeInDown 0.6s ease;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #bdf000;
  display: flex;
  align-items: center;
}

.reset-btn {
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: rotate(180deg);
}

.filter-field {
  transition: all 0.3s ease;
}

.filter-field :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(189, 240, 0, 0.28);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.filter-field :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.5);
  transform: translateY(-1px);
}

.filter-field :deep(.q-field__control.q-field__control--focused) {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

.filter-field.field-changed :deep(.q-field__control) {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
}

.quick-buttons {
  animation: fadeInUp 0.6s ease;
}

.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #000000;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 0.5);
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 40px;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(189, 240, 0, 0.3);
}

.active-filters {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease;
}

.active-filters-label {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-badge {
  padding: 6px 10px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-badge:hover {
  background: #bdf000 !important;
  color: #000000 !important;
  transform: scale(1.05);
}

.full-width {
  width: 100%;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .filters-panel {
    padding: 16px;
    border-radius: 12px;
  }
  
  .panel-title {
    font-size: 1rem;
  }
  
  .quick-buttons {
    margin-top: 12px;
  }
  
  .btn-gradient {
    height: 36px;
    font-size: 0.8rem;
  }
  
  .filter-badges {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-badge {
    margin-bottom: 4px;
  }
}
</style>
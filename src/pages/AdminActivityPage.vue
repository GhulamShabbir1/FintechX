<template>
  <q-layout view="lHh Lpr lFf">
    <AdminHeader />
    <q-page-container>
      <q-page class="admin-activity-page">
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
            <q-breadcrumbs-el icon="timeline" label="Activity" />
          </q-breadcrumbs>
        </div>
        
        <div class="admin-content">
          <!-- Activity Overview Cards -->
          <div class="row q-col-gutter-lg q-mb-lg">
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="timeline" size="40px" color="lime" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value">{{ activityStats.total }}</div>
                    <div class="stats-label">Total Activities</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="today" size="40px" color="blue" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value">{{ activityStats.today }}</div>
                    <div class="stats-label">Today's Activities</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="person" size="40px" color="green" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value">{{ activityStats.users }}</div>
                    <div class="stats-label">Active Users</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="warning" size="40px" color="orange" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value">{{ activityStats.critical }}</div>
                    <div class="stats-label">Critical Events</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Activity Filters and Search -->
          <q-card class="lime-glow q-mb-lg">
            <q-card-section>
              <div class="text-h6 text-lime q-mb-md">Activity Filters</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="filters.search"
                    placeholder="Search activities..."
                    outlined
                    dense
                    clearable
                    @input="applyFilters"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filters.type"
                    :options="activityTypes"
                    label="Activity Type"
                    outlined
                    dense
                    clearable
                    @update:model-value="applyFilters"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filters.severity"
                    :options="severityLevels"
                    label="Severity"
                    outlined
                    dense
                    clearable
                    @update:model-value="applyFilters"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-input
                    v-model="filters.dateFrom"
                    type="date"
                    label="From Date"
                    outlined
                    dense
                    @update:model-value="applyFilters"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-input
                    v-model="filters.dateTo"
                    type="date"
                    label="To Date"
                    outlined
                    dense
                    @update:model-value="applyFilters"
                  />
                </div>
                <div class="col-12 col-md-1">
                  <q-btn
                    color="lime"
                    icon="refresh"
                    label="Refresh"
                    @click="loadActivities"
                    class="full-width"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Activity Timeline -->
          <q-card class="lime-glow">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="text-h6 text-lime">Activity Timeline</div>
                <q-space />
                <q-btn
                  flat
                  icon="file_download"
                  label="Export"
                  color="lime"
                  @click="exportActivities"
                />
              </div>

              <div v-if="loading" class="text-center q-pa-xl">
                <q-spinner-dots color="lime" size="50px" />
                <div class="text-caption text-grey-6 q-mt-md">Loading activities...</div>
              </div>

              <div v-else class="activity-timeline">
                <div
                  v-for="activity in filteredActivities"
                  :key="activity.id"
                  class="activity-item"
                  :class="[`activity-${activity.severity}`]"
                >
                  <div class="activity-marker">
                    <q-icon
                      :name="getActivityIcon(activity.type)"
                      :color="getSeverityColor(activity.severity)"
                      size="md"
                    />
                  </div>
                  
                  <div class="activity-content">
                    <div class="activity-header">
                      <div class="activity-title">{{ activity.title }}</div>
                      <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                    </div>
                    
                    <div class="activity-details">
                      <div class="activity-description">{{ activity.description }}</div>
                      <div class="activity-meta">
                        <q-chip
                          :color="getSeverityColor(activity.severity)"
                          text-color="white"
                          size="sm"
                          class="q-mr-sm"
                        >
                          {{ activity.severity }}
                        </q-chip>
                        <q-chip
                          color="grey-7"
                          text-color="white"
                          size="sm"
                          class="q-mr-sm"
                        >
                          {{ activity.type }}
                        </q-chip>
                        <span class="text-caption text-grey-5">
                          User: {{ activity.user || 'System' }}
                        </span>
                      </div>
                      
                      <div v-if="activity.details" class="activity-extra q-mt-sm">
                        <q-expansion-item
                          icon="info"
                          label="View Details"
                          dense
                          class="details-expansion"
                        >
                          <div class="activity-details-content">
                            <pre>{{ JSON.stringify(activity.details, null, 2) }}</pre>
                          </div>
                        </q-expansion-item>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Load More Button -->
                <div v-if="hasMore" class="text-center q-mt-lg">
                  <q-btn
                    flat
                    color="lime"
                    label="Load More"
                    @click="loadMoreActivities"
                    :loading="loadingMore"
                  />
                </div>

                <!-- No Activities Message -->
                <div v-if="filteredActivities.length === 0 && !loading" class="text-center q-pa-xl">
                  <q-icon name="timeline" size="64px" color="grey-5" />
                  <div class="text-h6 text-grey-5 q-mt-md">No Activities Found</div>
                  <div class="text-caption text-grey-6">Try adjusting your filters or check back later</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import AdminHeader from '../components/navigation/AdminHeader.vue'
import api from '../boot/axios'

// Reactive data
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)

const activities = ref([])
const activityStats = ref({
  total: 1247,
  today: 23,
  users: 45,
  critical: 3
})

const filters = ref({
  search: '',
  type: null,
  severity: null,
  dateFrom: '',
  dateTo: ''
})

const activityTypes = [
  'user_login',
  'user_logout',
  'merchant_approval',
  'merchant_rejection',
  'transaction_processed',
  'system_backup',
  'security_alert',
  'configuration_change',
  'data_export',
  'password_change'
]

const severityLevels = [
  'low',
  'medium',
  'high',
  'critical'
]

// Computed
const filteredActivities = computed(() => {
  let result = activities.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(activity =>
      activity.title.toLowerCase().includes(search) ||
      activity.description.toLowerCase().includes(search)
    )
  }

  if (filters.value.type) {
    result = result.filter(activity => activity.type === filters.value.type)
  }

  if (filters.value.severity) {
    result = result.filter(activity => activity.severity === filters.value.severity)
  }

  if (filters.value.dateFrom) {
    result = result.filter(activity =>
      new Date(activity.timestamp) >= new Date(filters.value.dateFrom)
    )
  }

  if (filters.value.dateTo) {
    result = result.filter(activity =>
      new Date(activity.timestamp) <= new Date(filters.value.dateTo)
    )
  }

  return result
})

// Methods
const loadActivities = async () => {
  try {
    loading.value = true
    const response = await api.get('/api/admin/activities', {
      params: { page: 1, limit: 20 }
    })
    activities.value = response.data.activities || getDemoActivities()
    activityStats.value = response.data.stats || activityStats.value
    currentPage.value = 1
    hasMore.value = response.data.hasMore || false
  } catch (error) {
    console.error('Failed to load activities:', error)
    activities.value = getDemoActivities()
  } finally {
    loading.value = false
  }
}

const loadMoreActivities = async () => {
  try {
    loadingMore.value = true
    currentPage.value += 1
    const response = await api.get('/api/admin/activities', {
      params: { page: currentPage.value, limit: 20 }
    })
    activities.value.push(...(response.data.activities || []))
    hasMore.value = response.data.hasMore || false
  } catch (error) {
    console.error('Failed to load more activities:', error)
  } finally {
    loadingMore.value = false
  }
}

const applyFilters = () => {
  // Filters are applied through computed property
  // This method can be used for additional filter logic if needed
}

const getActivityIcon = (type) => {
  const iconMap = {
    user_login: 'login',
    user_logout: 'logout',
    merchant_approval: 'check_circle',
    merchant_rejection: 'cancel',
    transaction_processed: 'payment',
    system_backup: 'backup',
    security_alert: 'security',
    configuration_change: 'settings',
    data_export: 'file_download',
    password_change: 'lock'
  }
  return iconMap[type] || 'info'
}

const getSeverityColor = (severity) => {
  const colorMap = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
  }
  return colorMap[severity] || 'grey'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const exportActivities = async () => {
  try {
    const response = await api.get('/api/admin/activities/export', {
      responseType: 'blob',
      params: filters.value
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `activities-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    Notify.create({
      type: 'positive',
      message: 'Activities exported successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to export activities:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export activities',
      position: 'top'
    })
  }
}

const getDemoActivities = () => [
  {
    id: 1,
    type: 'merchant_approval',
    severity: 'medium',
    title: 'Merchant Approved',
    description: 'TechCorp Inc has been approved for merchant services',
    user: 'admin@finteckx.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    details: { merchantId: 'M123', businessName: 'TechCorp Inc', approvedBy: 'admin' }
  },
  {
    id: 2,
    type: 'security_alert',
    severity: 'high',
    title: 'Multiple Failed Login Attempts',
    description: 'Detected 5 failed login attempts from IP 192.168.1.100',
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    details: { ip: '192.168.1.100', attempts: 5, blocked: true }
  },
  {
    id: 3,
    type: 'transaction_processed',
    severity: 'low',
    title: 'High Value Transaction',
    description: 'Transaction of $10,000 processed successfully',
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    details: { amount: 10000, merchantId: 'M456', transactionId: 'TXN789' }
  },
  {
    id: 4,
    type: 'system_backup',
    severity: 'low',
    title: 'System Backup Completed',
    description: 'Daily system backup completed successfully',
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    details: { backupSize: '2.5GB', duration: '45 minutes' }
  },
  {
    id: 5,
    type: 'configuration_change',
    severity: 'medium',
    title: 'Payment Gateway Settings Updated',
    description: 'Payment gateway configuration has been updated',
    user: 'admin@finteckx.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    details: { setting: 'timeout_duration', oldValue: '30s', newValue: '60s' }
  }
]

// Lifecycle
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.admin-activity-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.breadcrumb-section {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.admin-content {
  padding: 20px;
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(189, 240, 0, 0.2),
              0 0 20px rgba(189, 240, 0, 0.15);
  background: #121212;
  border-radius: 12px;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-card .q-card__section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 50%;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #bdf000;
}

.stats-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-timeline {
  position: relative;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  left: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, rgba(189, 240, 0, 0.3), rgba(189, 240, 0, 0.1));
}

.activity-item {
  position: relative;
  display: flex;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.activity-item.activity-critical {
  border-left-color: #f44336;
}

.activity-item.activity-high {
  border-left-color: #ff9800;
}

.activity-item.activity-medium {
  border-left-color: #2196f3;
}

.activity-item.activity-low {
  border-left-color: #4caf50;
}

.activity-marker {
  position: absolute;
  left: -46px;
  top: 16px;
  width: 32px;
  height: 32px;
  background: #121212;
  border: 2px solid rgba(189, 240, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.activity-content {
  flex: 1;
  margin-left: 16px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.activity-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #bdf000;
}

.activity-time {
  font-size: 0.8rem;
  color: #999;
  white-space: nowrap;
}

.activity-description {
  color: #ffffff;
  margin-bottom: 12px;
  line-height: 1.5;
}

.activity-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.activity-details-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.activity-details-content pre {
  color: #bdf000;
  font-size: 0.8rem;
  margin: 0;
  white-space: pre-wrap;
}

.details-expansion :deep(.q-expansion-item__container) {
  background: transparent;
}

.details-expansion :deep(.q-item) {
  color: #999;
  font-size: 0.8rem;
}

.text-lime {
  color: #bdf000;
}

.text-grey-6 {
  color: #999;
}

.text-grey-5 {
  color: #aaa;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }
  
  .activity-timeline::before {
    display: none;
  }
  
  .activity-marker {
    position: relative;
    left: 0;
    top: 0;
    margin-bottom: 12px;
  }
  
  .activity-content {
    margin-left: 0;
  }
  
  .activity-header {
    flex-direction: column;
    gap: 4px;
  }
  
  .activity-time {
    align-self: flex-start;
  }
}
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <AdminHeader />
    <q-page-container>
      <q-page class="admin-alerts-page">
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
            <q-breadcrumbs-el icon="notifications" label="Alerts" />
          </q-breadcrumbs>
        </div>
        
        <div class="admin-content">
          <!-- Alert Statistics -->
          <div class="row q-col-gutter-lg q-mb-lg">
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="error" size="40px" color="red" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value text-red">{{ alertStats.critical }}</div>
                    <div class="stats-label">Critical Alerts</div>
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
                    <div class="stats-value text-orange">{{ alertStats.warning }}</div>
                    <div class="stats-label">Warning Alerts</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="info" size="40px" color="blue" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value text-blue">{{ alertStats.info }}</div>
                    <div class="stats-label">Info Alerts</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="check_circle" size="40px" color="green" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value text-green">{{ alertStats.resolved }}</div>
                    <div class="stats-label">Resolved Today</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Alert Filters -->
          <q-card class="lime-glow q-mb-lg">
            <q-card-section>
              <div class="text-h6 text-lime q-mb-md">Alert Filters</div>
              <div class="row q-col-gutter-md items-end">
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="filters.search"
                    placeholder="Search alerts..."
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
                    v-model="filters.severity"
                    :options="severityOptions"
                    label="Severity"
                    outlined
                    dense
                    clearable
                    @update:model-value="applyFilters"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filters.status"
                    :options="statusOptions"
                    label="Status"
                    outlined
                    dense
                    clearable
                    @update:model-value="applyFilters"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filters.category"
                    :options="categoryOptions"
                    label="Category"
                    outlined
                    dense
                    clearable
                    @update:model-value="applyFilters"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-btn
                    color="lime"
                    icon="refresh"
                    label="Refresh"
                    @click="loadAlerts"
                    class="full-width"
                  />
                </div>
                <div class="col-12 col-md-1">
                  <q-btn
                    color="red"
                    icon="clear_all"
                    label="Clear All"
                    @click="clearAllAlerts"
                    class="full-width"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Alerts List -->
          <q-card class="lime-glow">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="text-h6 text-lime">System Alerts</div>
                <q-space />
                <q-btn-toggle
                  v-model="viewMode"
                  :options="[
                    { label: 'List', value: 'list', icon: 'list' },
                    { label: 'Grid', value: 'grid', icon: 'grid_view' }
                  ]"
                  color="lime"
                  text-color="black"
                />
              </div>

              <div v-if="loading" class="text-center q-pa-xl">
                <q-spinner-dots color="lime" size="50px" />
                <div class="text-caption text-grey-6 q-mt-md">Loading alerts...</div>
              </div>

              <!-- List View -->
              <div v-else-if="viewMode === 'list'" class="alerts-list">
                <div
                  v-for="alert in filteredAlerts"
                  :key="alert.id"
                  class="alert-item"
                  :class="[`alert-${alert.severity}`, { 'alert-unread': !alert.read }]"
                >
                  <div class="alert-indicator">
                    <q-icon
                      :name="getAlertIcon(alert.severity)"
                      :color="getSeverityColor(alert.severity)"
                      size="md"
                    />
                  </div>
                  
                  <div class="alert-content">
                    <div class="alert-header">
                      <div class="alert-title">{{ alert.title }}</div>
                      <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
                    </div>
                    
                    <div class="alert-description">{{ alert.description }}</div>
                    
                    <div class="alert-meta">
                      <q-chip
                        :color="getSeverityColor(alert.severity)"
                        text-color="white"
                        size="sm"
                        class="q-mr-sm"
                      >
                        {{ alert.severity }}
                      </q-chip>
                      <q-chip
                        :color="alert.status === 'resolved' ? 'green' : 'orange'"
                        text-color="white"
                        size="sm"
                        class="q-mr-sm"
                      >
                        {{ alert.status }}
                      </q-chip>
                      <span class="text-caption text-grey-5">
                        Category: {{ alert.category }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="alert-actions">
                    <q-btn
                      v-if="!alert.read"
                      flat
                      round
                      dense
                      icon="mark_email_read"
                      color="blue"
                      @click="markAsRead(alert.id)"
                    >
                      <q-tooltip>Mark as Read</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="alert.status !== 'resolved'"
                      flat
                      round
                      dense
                      icon="check"
                      color="green"
                      @click="resolveAlert(alert.id)"
                    >
                      <q-tooltip>Resolve</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="more_vert"
                      color="grey"
                      @click="showAlertDetails(alert)"
                    >
                      <q-tooltip>More Options</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <!-- No Alerts Message -->
                <div v-if="filteredAlerts.length === 0" class="text-center q-pa-xl">
                  <q-icon name="notifications_none" size="64px" color="grey-5" />
                  <div class="text-h6 text-grey-5 q-mt-md">No Alerts Found</div>
                  <div class="text-caption text-grey-6">All systems are running smoothly</div>
                </div>
              </div>

              <!-- Grid View -->
              <div v-else class="alerts-grid">
                <div class="row q-col-gutter-md">
                  <div
                    v-for="alert in filteredAlerts"
                    :key="alert.id"
                    class="col-12 col-md-6 col-lg-4"
                  >
                    <q-card
                      class="alert-card"
                      :class="[`alert-card-${alert.severity}`, { 'alert-card-unread': !alert.read }]"
                    >
                      <q-card-section>
                        <div class="alert-card-header">
                          <q-icon
                            :name="getAlertIcon(alert.severity)"
                            :color="getSeverityColor(alert.severity)"
                            size="lg"
                          />
                          <div class="alert-card-time">{{ formatTime(alert.timestamp) }}</div>
                        </div>
                        
                        <div class="alert-card-title">{{ alert.title }}</div>
                        <div class="alert-card-description">{{ alert.description }}</div>
                        
                        <div class="alert-card-meta">
                          <q-chip
                            :color="getSeverityColor(alert.severity)"
                            text-color="white"
                            size="sm"
                          >
                            {{ alert.severity }}
                          </q-chip>
                          <q-chip
                            :color="alert.status === 'resolved' ? 'green' : 'orange'"
                            text-color="white"
                            size="sm"
                          >
                            {{ alert.status }}
                          </q-chip>
                        </div>
                      </q-card-section>
                      
                      <q-card-actions align="right">
                        <q-btn
                          v-if="!alert.read"
                          flat
                          dense
                          icon="mark_email_read"
                          color="blue"
                          @click="markAsRead(alert.id)"
                        />
                        <q-btn
                          v-if="alert.status !== 'resolved'"
                          flat
                          dense
                          icon="check"
                          color="green"
                          @click="resolveAlert(alert.id)"
                        />
                        <q-btn
                          flat
                          dense
                          icon="more_vert"
                          color="grey"
                          @click="showAlertDetails(alert)"
                        />
                      </q-card-actions>
                    </q-card>
                  </div>
                </div>

                <!-- No Alerts Message for Grid -->
                <div v-if="filteredAlerts.length === 0" class="text-center q-pa-xl">
                  <q-icon name="notifications_none" size="64px" color="grey-5" />
                  <div class="text-h6 text-grey-5 q-mt-md">No Alerts Found</div>
                  <div class="text-caption text-grey-6">All systems are running smoothly</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Alert Details Dialog -->
        <q-dialog v-model="showDetailsDialog" persistent>
          <q-card class="alert-details-dialog">
            <q-card-section>
              <div class="text-h6">Alert Details</div>
            </q-card-section>
            
            <q-card-section v-if="selectedAlert">
              <div class="alert-details-content">
                <div class="detail-row">
                  <span class="detail-label">Title:</span>
                  <span class="detail-value">{{ selectedAlert.title }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Severity:</span>
                  <q-chip
                    :color="getSeverityColor(selectedAlert.severity)"
                    text-color="white"
                    size="sm"
                  >
                    {{ selectedAlert.severity }}
                  </q-chip>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <q-chip
                    :color="selectedAlert.status === 'resolved' ? 'green' : 'orange'"
                    text-color="white"
                    size="sm"
                  >
                    {{ selectedAlert.status }}
                  </q-chip>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">{{ selectedAlert.category }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Timestamp:</span>
                  <span class="detail-value">{{ formatFullTime(selectedAlert.timestamp) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Description:</span>
                  <span class="detail-value">{{ selectedAlert.description }}</span>
                </div>
                <div v-if="selectedAlert.details" class="detail-row">
                  <span class="detail-label">Additional Details:</span>
                  <pre class="detail-json">{{ JSON.stringify(selectedAlert.details, null, 2) }}</pre>
                </div>
              </div>
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn
                v-if="selectedAlert && !selectedAlert.read"
                flat
                label="Mark as Read"
                color="blue"
                @click="markAsRead(selectedAlert.id)"
              />
              <q-btn
                v-if="selectedAlert && selectedAlert.status !== 'resolved'"
                flat
                label="Resolve"
                color="green"
                @click="resolveAlert(selectedAlert.id)"
              />
              <q-btn flat label="Close" color="grey" @click="showDetailsDialog = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>
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
const viewMode = ref('list')
const showDetailsDialog = ref(false)
const selectedAlert = ref(null)

const alerts = ref([])
const alertStats = ref({
  critical: 3,
  warning: 12,
  info: 28,
  resolved: 45
})

const filters = ref({
  search: '',
  severity: null,
  status: null,
  category: null
})

const severityOptions = ['critical', 'warning', 'info']
const statusOptions = ['active', 'resolved', 'dismissed']
const categoryOptions = ['security', 'performance', 'system', 'payment', 'merchant', 'user']

// Computed
const filteredAlerts = computed(() => {
  let result = alerts.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(alert =>
      alert.title.toLowerCase().includes(search) ||
      alert.description.toLowerCase().includes(search)
    )
  }

  if (filters.value.severity) {
    result = result.filter(alert => alert.severity === filters.value.severity)
  }

  if (filters.value.status) {
    result = result.filter(alert => alert.status === filters.value.status)
  }

  if (filters.value.category) {
    result = result.filter(alert => alert.category === filters.value.category)
  }

  return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Methods
const loadAlerts = async () => {
  try {
    loading.value = true
    const response = await api.get('/api/admin/alerts')
    alerts.value = response.data.alerts || getDemoAlerts()
    alertStats.value = response.data.stats || alertStats.value
  } catch (error) {
    console.error('Failed to load alerts:', error)
    alerts.value = getDemoAlerts()
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Filters are applied through computed property
}

const getAlertIcon = (severity) => {
  const iconMap = {
    critical: 'error',
    warning: 'warning',
    info: 'info'
  }
  return iconMap[severity] || 'notifications'
}

const getSeverityColor = (severity) => {
  const colorMap = {
    critical: 'red',
    warning: 'orange',
    info: 'blue'
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
  
  return date.toLocaleDateString()
}

const formatFullTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const markAsRead = async (alertId) => {
  try {
    await api.put(`/api/admin/alerts/${alertId}/read`)
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.read = true
    }
    if (selectedAlert.value && selectedAlert.value.id === alertId) {
      selectedAlert.value.read = true
    }
    Notify.create({
      type: 'positive',
      message: 'Alert marked as read',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to mark alert as read:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to mark alert as read',
      position: 'top'
    })
  }
}

const resolveAlert = async (alertId) => {
  try {
    await api.put(`/api/admin/alerts/${alertId}/resolve`)
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'resolved'
      alert.read = true
    }
    if (selectedAlert.value && selectedAlert.value.id === alertId) {
      selectedAlert.value.status = 'resolved'
      selectedAlert.value.read = true
    }
    alertStats.value.resolved += 1
    Notify.create({
      type: 'positive',
      message: 'Alert resolved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to resolve alert:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to resolve alert',
      position: 'top'
    })
  }
}

const clearAllAlerts = async () => {
  try {
    await api.delete('/api/admin/alerts/clear-all')
    alerts.value = alerts.value.filter(alert => alert.status !== 'resolved')
    Notify.create({
      type: 'positive',
      message: 'Resolved alerts cleared successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to clear alerts:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to clear alerts',
      position: 'top'
    })
  }
}

const showAlertDetails = (alert) => {
  selectedAlert.value = alert
  showDetailsDialog.value = true
}

const getDemoAlerts = () => [
  {
    id: 1,
    title: 'High Transaction Volume Detected',
    description: 'Unusual spike in transaction volume detected in the last hour. Current volume is 300% above normal.',
    severity: 'warning',
    status: 'active',
    category: 'performance',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    details: { currentVolume: 1500, normalVolume: 500, threshold: 1000 }
  },
  {
    id: 2,
    title: 'Payment Gateway Timeout',
    description: 'Payment gateway is experiencing timeouts. Multiple transactions have failed in the last 10 minutes.',
    severity: 'critical',
    status: 'active',
    category: 'payment',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    details: { failedTransactions: 25, timeoutDuration: '30s', affectedGateway: 'stripe' }
  },
  {
    id: 3,
    title: 'New Merchant Registration',
    description: 'A new merchant "TechCorp Solutions" has registered and is pending approval.',
    severity: 'info',
    status: 'active',
    category: 'merchant',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    details: { merchantName: 'TechCorp Solutions', registrationTime: '2024-01-15 14:30:00' }
  },
  {
    id: 4,
    title: 'Database Connection Pool Warning',
    description: 'Database connection pool is at 85% capacity. Consider scaling if this persists.',
    severity: 'warning',
    status: 'active',
    category: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    read: true,
    details: { currentConnections: 85, maxConnections: 100, recommendation: 'scale_up' }
  },
  {
    id: 5,
    title: 'Suspicious Login Activity',
    description: 'Multiple failed login attempts detected from IP address 192.168.1.100',
    severity: 'critical',
    status: 'resolved',
    category: 'security',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: true,
    details: { ipAddress: '192.168.1.100', attempts: 15, blocked: true, resolvedAt: '2024-01-15 13:45:00' }
  }
]

// Lifecycle
onMounted(() => {
  loadAlerts()
})
</script>

<style scoped>
.admin-alerts-page {
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
}

.stats-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.alert-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.alert-item.alert-unread {
  background: rgba(189, 240, 0, 0.05);
  border-left-color: #bdf000;
}

.alert-item.alert-critical {
  border-left-color: #f44336;
}

.alert-item.alert-warning {
  border-left-color: #ff9800;
}

.alert-item.alert-info {
  border-left-color: #2196f3;
}

.alert-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.alert-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #bdf000;
  margin-right: 16px;
}

.alert-time {
  font-size: 0.8rem;
  color: #999;
  white-space: nowrap;
}

.alert-description {
  color: #ffffff;
  margin-bottom: 12px;
  line-height: 1.5;
}

.alert-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.alert-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.alerts-grid {
  min-height: 200px;
}

.alert-card {
  background: rgba(255, 255, 255, 0.02);
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.alert-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.alert-card-unread {
  background: rgba(189, 240, 0, 0.05);
  border-left-color: #bdf000;
}

.alert-card-critical {
  border-left-color: #f44336;
}

.alert-card-warning {
  border-left-color: #ff9800;
}

.alert-card-info {
  border-left-color: #2196f3;
}

.alert-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.alert-card-time {
  font-size: 0.8rem;
  color: #999;
}

.alert-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #bdf000;
  margin-bottom: 8px;
}

.alert-card-description {
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 12px;
}

.alert-card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.alert-details-dialog {
  min-width: 600px;
  max-width: 80vw;
  background: #121212;
  color: #ffffff;
}

.alert-details-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-label {
  font-weight: 600;
  color: #bdf000;
  min-width: 120px;
  flex-shrink: 0;
}

.detail-value {
  color: #ffffff;
  flex: 1;
}

.detail-json {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #bdf000;
  font-size: 0.8rem;
  margin: 0;
  white-space: pre-wrap;
  overflow-x: auto;
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

.text-red {
  color: #f44336;
}

.text-orange {
  color: #ff9800;
}

.text-blue {
  color: #2196f3;
}

.text-green {
  color: #4caf50;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }
  
  .alert-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .alert-header {
    flex-direction: column;
    gap: 4px;
  }
  
  .alert-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .alert-details-dialog {
    min-width: 320px;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-label {
    min-width: auto;
  }
}
</style>
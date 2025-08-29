
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Admin Header -->
    <AdminHeader />

    <!-- Page Content -->
    <q-page class="admin-dashboard-page">
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <q-spinner-dots color="#bdfdoo" size="60px" />
        <p class="loading-text">Loading Admin Dashboard...</p>
      </div>

      <!-- Breadcrumb -->
      <div class="breadcrumb-section q-pa-md animate-fade-in" style="animation-delay: 0.1s">
        <q-breadcrumbs class="text-grey-6">
          <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
          <q-breadcrumbs-el icon="dashboard" label="Dashboard" />
        </q-breadcrumbs>
      </div>

      <!-- Main Content -->
      <div class="admin-content">
        <!-- Overview Section -->
        <AdminOverview :stats="overviewStats" class="animate-fade-in" style="animation-delay: 0.2s" />

        <!-- Charts Section -->
        <div class="charts-section q-mt-xl animate-fade-in" style="animation-delay: 0.3s">
          <h2 class="section-title">Platform Analytics</h2>
          
          <!-- Revenue & Growth Charts -->
          <div class="row q-col-gutter-lg q-mb-xl">
            <div class="col-12 col-lg-8">
              <q-card class="chart-card lime-glow">
                <q-card-section>
                  <div class="card-header">
                    <h3 class="card-title">Revenue Trends</h3>
                    <div class="chart-actions">
                      <q-btn-toggle
                        v-model="revenueTimeframe"
                        :options="timeframeOptions"
                        color="lime"
                        text-color="white"
                        size="sm"
                      />
                      <q-btn flat round dense icon="refresh" color="lime" @click="refreshRevenueChart" />
                    </div>
                  </div>
                  <div class="chart-container">
                    <RevenueTrendsChart :data="revenueData" :loading="chartsLoading" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-lg-4">
              <q-card class="chart-card lime-glow">
                <q-card-section>
                  <div class="card-header">
                    <h3 class="card-title">Payment Methods</h3>
                    <q-btn flat round dense icon="refresh" color="lime" @click="refreshMethodsChart" />
                  </div>
                  <div class="chart-container">
                    <MethodsChart :data="methodsData" :loading="chartsLoading" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- User Growth & Transaction Charts -->
          <div class="row q-col-gutter-lg q-mb-xl">
            <div class="col-12 col-lg-6">
              <q-card class="chart-card lime-glow">
                <q-card-section>
                  <div class="card-header">
                    <h3 class="card-title">User Growth</h3>
                    <q-btn flat round dense icon="refresh" color="lime" @click="refreshUserChart" />
                  </div>
                  <div class="chart-container">
                    <UserGrowthChart :data="userGrowthData" :loading="chartsLoading" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-lg-6">
              <q-card class="chart-card lime-glow">
                <q-card-section>
                  <div class="card-header">
                    <h3 class="card-title">Transaction Volume</h3>
                    <q-btn flat round dense icon="refresh" color="lime" @click="refreshTransactionChart" />
                  </div>
                  <div class="chart-container">
                    <TransactionVolumeChart :data="transactionData" :loading="chartsLoading" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Geographic & Performance Charts -->
          <div class="row q-col-gutter-lg q-mb-xl">
            <div class="col-12 col-lg-6">
              <q-card class="chart-card lime-glow">
                <q-card-section>
                  <div class="card-header">
                    <h3 class="card-title">Geographic Distribution</h3>
                    <q-btn flat round dense icon="refresh" color="lime" @click="refreshGeographyChart" />
                  </div>
                  <div class="chart-container">
                    <GeographyChart :data="geographyData" :loading="chartsLoading" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-lg-6">
              <q-card class="chart-card lime-glow">
                <q-card-section>
                  <div class="card-header">
                    <h3 class="card-title">System Performance</h3>
                    <q-btn flat round dense icon="refresh" color="lime" @click="refreshPerformanceChart" />
                  </div>
                  <div class="chart-container">
                    <PerformanceChart :data="performanceData" :loading="chartsLoading" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- System Health & Alerts -->
        <div class="row q-col-gutter-lg q-mt-xl animate-fade-in" style="animation-delay: 0.4s">
          <!-- System Health -->
          <div class="col-12 col-md-6">
            <q-card class="lime-glow health-card">
              <q-card-section>
                <div class="card-header">
                  <h3 class="card-title">System Health</h3>
                  <q-btn flat round dense icon="refresh" color="lime" @click="refreshSystemHealth" />
                </div>
                <div class="health-grid">
                  <div class="health-item" v-for="(metric, key) in systemHealth" :key="key">
                    <div class="health-icon">
                      <q-icon :name="getHealthIcon(key)" :color="getHealthColor(metric.value)" size="32px" />
                    </div>
                    <div class="health-info">
                      <div class="health-label">{{ metric.label }}</div>
                      <div class="health-value">{{ metric.value }}{{ metric.unit }}</div>
                      <div class="health-status" :class="getHealthStatusClass(metric.status)">
                        {{ metric.status }}
                      </div>
                    </div>
                    <div class="health-progress">
                      <q-linear-progress
                        :value="metric.percentage / 100"
                        :color="getHealthColor(metric.value)"
                        size="8px"
                        rounded
                      />
                      <div class="health-percentage">{{ metric.percentage }}%</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Recent Alerts -->
          <div class="col-12 col-md-6">
            <q-card class="lime-glow alerts-card">
              <q-card-section>
                <div class="card-header">
                  <h3 class="card-title">Recent Alerts</h3>
                  <q-btn flat round dense icon="visibility" color="lime" @click="$router.push('/admin/alerts')" />
                </div>
                <div class="alerts-list">
                  <div v-for="alert in recentAlerts" :key="alert.id" 
                       class="alert-item q-mb-md animate-slide-in" 
                       :style="`animation-delay: ${0.5 + (alert.id * 0.1)}s`">
                    <div class="alert-header">
                      <div class="alert-type">
                        <q-icon :name="getAlertIcon(alert.type)" :color="getAlertColor(alert.type)" size="20px" />
                        <span class="alert-severity">{{ alert.severity }}</span>
                      </div>
                      <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
                    </div>
                    <div class="alert-message">{{ alert.message }}</div>
                    <div class="alert-actions">
                      <q-btn flat size="sm" color="lime" label="View Details" @click="viewAlert(alert)" />
                      <q-btn flat size="sm" color="grey" label="Dismiss" @click="dismissAlert(alert.id)" />
                    </div>
                  </div>
                </div>
                <q-btn flat color="lime" label="View All Alerts" class="full-width q-mt-md"
                  @click="$router.push('/admin/alerts')" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Enhanced Merchant Management -->
        <div class="row q-col-gutter-lg q-mt-xl animate-fade-in" style="animation-delay: 0.6s">
          <div class="col-12">
            <q-card class="lime-glow merchants-card">
              <q-card-section>
                <div class="card-header">
                  <h3 class="card-title">Merchant Management</h3>
                  <div class="header-actions">
                    <q-btn color="lime" icon="add" label="Add Merchant" @click="showAddMerchantDialog = true" />
                    <q-btn color="blue" icon="store" label="View All Merchants" @click="$router.push('/admin/merchants')" />
                    <q-btn color="orange" icon="pending" label="Pending Approvals" @click="viewPendingApprovals" />
                  </div>
                </div>

                <!-- Enhanced Merchant Stats -->
                <div class="merchant-stats q-mb-lg">
                  <div class="stat-item" @click="filterByStatus('all')">
                    <div class="stat-value">{{ merchantStats.total }}</div>
                    <div class="stat-label">Total Merchants</div>
                    <div class="stat-trend">
                      <q-icon name="trending_up" color="green" size="16px" />
                      +{{ merchantStats.newThisMonth }} this month
                    </div>
                  </div>
                  <div class="stat-item pending-item" @click="filterByStatus('pending')">
                    <div class="stat-value">{{ merchantStats.pending }}</div>
                    <div class="stat-label">Pending Approval</div>
                    <div class="stat-trend">
                      <q-icon name="schedule" color="orange" size="16px" />
                      Requires attention
                    </div>
                  </div>
                  <div class="stat-item verified-item" @click="filterByStatus('verified')">
                    <div class="stat-value">{{ merchantStats.verified }}</div>
                    <div class="stat-label">Verified</div>
                    <div class="stat-trend">
                      <q-icon name="check_circle" color="green" size="16px" />
                      Active merchants
                    </div>
                  </div>
                  <div class="stat-item suspended-item" @click="filterByStatus('suspended')">
                    <div class="stat-value">{{ merchantStats.suspended }}</div>
                    <div class="stat-label">Suspended</div>
                    <div class="stat-trend">
                      <q-icon name="block" color="red" size="16px" />
                      Under review
                    </div>
                  </div>
                </div>

                <!-- Enhanced Merchant Table -->
                <q-table 
                  :rows="filteredMerchants" 
                  :columns="enhancedMerchantColumns" 
                  :pagination="{ rowsPerPage: 5 }"
                  row-key="id" 
                  class="merchant-table"
                  :loading="merchantsLoading"
                  :filter="tableFilter"
                >
                  <!-- Status Column -->
                  <template v-slot:body-cell-status="props">
                    <q-td :props="props">
                      <q-chip :color="getStatusColor(props.value)" text-color="white"
                        :icon="getStatusIcon(props.value)" size="sm" class="status-chip">
                        {{ props.value }}
                      </q-chip>
                    </q-td>
                  </template>

                  <!-- Revenue Column -->
                  <template v-slot:body-cell-revenue="props">
                    <q-td :props="props">
                      <span class="revenue-amount">{{ formatCurrency(props.value) }}</span>
                    </q-td>
                  </template>

                  <!-- Actions Column -->
                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <div class="action-buttons">
                        <q-btn flat round dense icon="visibility" color="blue" @click="viewMerchant(props.row)"
                          size="sm" class="action-btn">
                          <q-tooltip>View Details</q-tooltip>
                        </q-btn>
                        
                        <!-- Approval Actions -->
                        <q-btn v-if="props.row.status === 'pending'" flat round dense icon="check_circle" 
                          color="green" @click="approveMerchant(props.row)" size="sm" class="action-btn">
                          <q-tooltip>Approve Merchant</q-tooltip>
                        </q-btn>
                        
                        <q-btn v-if="props.row.status === 'pending'" flat round dense icon="cancel" 
                          color="red" @click="rejectMerchant(props.row)" size="sm" class="action-btn">
                          <q-tooltip>Reject Merchant</q-tooltip>
                        </q-btn>
                        
                        <!-- Management Actions -->
                        <q-btn v-if="props.row.status === 'verified'" flat round dense icon="edit" 
                          color="orange" @click="editMerchant(props.row)" size="sm" class="action-btn">
                          <q-tooltip>Edit Merchant</q-tooltip>
                        </q-btn>
                        
                        <q-btn v-if="props.row.status === 'verified'" flat round dense icon="block" 
                          color="red" @click="suspendMerchant(props.row)" size="sm" class="action-btn">
                          <q-tooltip>Suspend Merchant</q-tooltip>
                        </q-btn>
                        
                        <q-btn v-if="props.row.status === 'suspended'" flat round dense icon="check_circle" 
                          color="green" @click="reactivateMerchant(props.row)" size="sm" class="action-btn">
                          <q-tooltip>Reactivate Merchant</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Quick Actions Grid -->
        <div class="quick-actions q-mt-xl animate-fade-in" style="animation-delay: 0.7s">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            <div class="action-card" @click="navigateTo('/admin/merchants')">
              <div class="action-icon">
                <q-icon name="store" size="32px" color="lime" />
              </div>
              <div class="action-content">
                <h4>Merchant Management</h4>
                <p>Review, approve, and manage merchant accounts</p>
              </div>
              <q-icon name="arrow_forward" class="action-arrow" color="lime" />
            </div>

            <div class="action-card" @click="navigateTo('/admin/analytics')">
              <div class="action-icon">
                <q-icon name="analytics" size="32px" color="blue" />
              </div>
              <div class="action-content">
                <h4>Advanced Analytics</h4>
                <p>Deep dive into platform performance metrics</p>
              </div>
              <q-icon name="arrow_forward" class="action-arrow" color="blue" />
            </div>

            <div class="action-card" @click="navigateTo('/admin/support')">
              <div class="action-icon">
                <q-icon name="support_agent" size="32px" color="purple" />
              </div>
              <div class="action-content">
                <h4>Support Center</h4>
                <p>Manage customer support tickets and inquiries</p>
              </div>
              <q-icon name="arrow_forward" class="action-arrow" color="purple" />
            </div>

            <div class="action-card" @click="navigateTo('/admin/settings')">
              <div class="action-icon">
                <q-icon name="settings" size="32px" color="orange" />
              </div>
              <div class="action-content">
                <h4>System Settings</h4>
                <p>Configure platform parameters and integrations</p>
              </div>
              <q-icon name="arrow_forward" class="action-arrow" color="orange" />
            </div>

            <div class="action-card" @click="exportPlatformData">
              <div class="action-icon">
                <q-icon name="download" size="32px" color="teal" />
              </div>
              <div class="action-content">
                <h4>Export Data</h4>
                <p>Download comprehensive platform reports</p>
              </div>
              <q-icon name="arrow_forward" class="action-arrow" color="teal" />
            </div>

            <div class="action-card" @click="navigateTo('/admin/security')">
              <div class="action-icon">
                <q-icon name="security" size="32px" color="red" />
              </div>
              <div class="action-content">
                <h4>Security Center</h4>
                <p>Monitor security events and manage access</p>
              </div>
              <q-icon name="arrow_forward" class="action-arrow" color="red" />
            </div>
          </div>
        </div>
      </div>
    </q-page>

    <!-- Add Merchant Dialog -->
    <q-dialog v-model="showAddMerchantDialog" persistent>
      <q-card class="add-merchant-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add New Merchant</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitNewMerchant" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMerchant.name"
                  label="Business Name *"
                  filled
                  required
                  :rules="[val => !!val || 'Business name is required']"
                />
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMerchant.email"
                  label="Email *"
                  filled
                  type="email"
                  required
                  :rules="[val => !!val || 'Email is required']"
                />
              </div>
            </div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMerchant.phone"
                  label="Phone Number"
                  filled
                  hint="Optional: Business contact number"
                />
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newMerchant.website"
                  label="Website"
                  filled
                  type="url"
                  hint="Optional: Business website"
                />
              </div>
            </div>
            
            <q-input
              v-model="newMerchant.address"
              label="Business Address"
              filled
              type="textarea"
              hint="Optional: Business address"
            />
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="newMerchant.business_type"
                  :options="businessTypeOptions"
                  label="Business Type"
                  filled
                  hint="Select business category"
                />
              </div>
              
              <div class="col-12 col-md-6">
                <q-select
                  v-model="newMerchant.status"
                  :options="statusOptions"
                  label="Initial Status"
                  filled
                  hint="Set initial merchant status"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Add Merchant" @click="submitNewMerchant" :loading="submittingMerchant" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import AdminHeader from '../components/navigation/AdminHeader.vue'
import AdminOverview from '../components/admin/AdminOverview.vue'
import RevenueTrendsChart from '../components/stats/charts/RevenueTrendsChart.vue'
import MethodsChart from '../components/stats/charts/MethodsCharts.vue'
import UserGrowthChart from '../components/stats/charts/UserGrowthChart.vue'
import GeographyChart from '../components/stats/charts/GeographyChart.vue'
import TransactionVolumeChart from '../components/stats/charts/TransactionTrendsChart.vue'
import PerformanceChart from '../components/stats/charts/HistogramChart.vue'
import api from '../boot/axios'
import {useRouter} from 'vue-router'
const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const chartsLoading = ref(false)
const merchantsLoading = ref(false)

// Chart timeframes
const revenueTimeframe = ref('month')
const timeframeOptions = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' }
]

// Overview stats
const overviewStats = ref({
  totalMerchants: 0,
  newMerchantsThisMonth: 0,
  totalRevenue: 0,
  revenueGrowth: 0,
  totalTransactions: 0,
  successRate: 0,
  pendingApprovals: 0
})

// Chart data
const revenueData = ref([])
const methodsData = ref([])
const userGrowthData = ref([])
const transactionData = ref([])
const geographyData = ref([])
const performanceData = ref([])

// System health
const systemHealth = ref({
  api: { label: 'API Status', value: 99.8, unit: '%', percentage: 99.8, status: 'Healthy' },
  database: { label: 'Database', value: 100, unit: '%', percentage: 100, status: 'Healthy' },
  payment_gateway: { label: 'Payment Gateway', value: 99.5, unit: '%', percentage: 99.5, status: 'Healthy' },
  uptime: { label: 'System Uptime', value: 99.9, unit: '%', percentage: 99.9, status: 'Healthy' },
  response_time: { label: 'Response Time', value: 45, unit: 'ms', percentage: 95, status: 'Good' },
  error_rate: { label: 'Error Rate', value: 0.1, unit: '%', percentage: 99.9, status: 'Excellent' }
})

// Alerts and merchants
const recentAlerts = ref([])
const recentMerchants = ref([])
const merchantStats = ref({
  total: 0,
  pending: 0,
  verified: 0,
  suspended: 0,
  newThisMonth: 0
})

// Enhanced merchant data
const showAddMerchantDialog = ref(false)
const submittingMerchant = ref(false)
const tableFilter = ref('')
const filteredMerchants = ref([])

const newMerchant = ref({
  name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  business_type: '',
  status: 'pending'
})

const businessTypeOptions = [
  'Retail', 'E-commerce', 'Food & Beverage', 'Technology', 'Healthcare', 
  'Finance', 'Education', 'Entertainment', 'Travel', 'Other'
]

const statusOptions = [
  { label: 'Pending Approval', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' }
]

// Enhanced merchant columns
const enhancedMerchantColumns = [
  { name: 'business_name', label: 'Business Name', field: 'business_name', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'business_type', label: 'Type', field: 'business_type', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'revenue', label: 'Revenue', field: 'revenue', align: 'right', sortable: true },
  { name: 'created_at', label: 'Registered', field: 'created_at', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    await Promise.all([
      loadOverviewStats(),
      loadChartData(),
      loadSystemHealth(),
      loadRecentAlerts(),
      loadMerchantData()
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load dashboard data',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const loadOverviewStats = async () => {
  try {
    const response = await api.get('/api/admin/overview')
    overviewStats.value = response.data
  } catch (error) {
    console.error('Failed to load overview stats:', error)
    // Use fallback data
    overviewStats.value = {
      totalMerchants: 156,
      newMerchantsThisMonth: 23,
      totalRevenue: 2847500,
      revenueGrowth: 12.5,
      totalTransactions: 12450,
      successRate: 98.7,
      pendingApprovals: 8
    }
  }
}

const loadChartData = async () => {
  try {
    chartsLoading.value = true
    await Promise.all([
      loadRevenueData(),
      loadMethodsData(),
      loadUserGrowthData(),
      loadTransactionData(),
      loadGeographyData(),
      loadPerformanceData()
    ])
  } catch (error) {
    console.error('Failed to load chart data:', error)
  } finally {
    chartsLoading.value = false
  }
}

const loadRevenueData = async () => {
  try {
    const response = await api.get(`/api/admin/stats/revenue?timeframe=${revenueTimeframe.value}`)
    revenueData.value = response.data
  } catch (error) {
    console.error('Failed to load revenue data:', error)
    // Mock data
    revenueData.value = [
      { date: 'Jan', revenue: 125000, transactions: 450 },
      { date: 'Feb', revenue: 138000, transactions: 520 },
      { date: 'Mar', revenue: 156000, transactions: 580 },
      { date: 'Apr', revenue: 142000, transactions: 540 },
      { date: 'May', revenue: 168000, transactions: 620 },
      { date: 'Jun', revenue: 184000, transactions: 680 }
    ]
  }
}

const loadMethodsData = async () => {
  try {
    const response = await api.get('/api/admin/stats/methods')
    methodsData.value = response.data
  } catch (error) {
    console.error('Failed to load methods data:', error)
    methodsData.value = [
      { label: 'Credit Card', value: 45, color: '#bdf000' },
      { label: 'Digital Wallet', value: 30, color: '#2196f3' },
      { label: 'Bank Transfer', value: 15, color: '#9c27b0' },
      { label: 'UPI', value: 10, color: '#ff9800' }
    ]
  }
}

const loadUserGrowthData = async () => {
  try {
    const response = await api.get('/api/admin/stats/users')
    userGrowthData.value = response.data
  } catch (error) {
    console.error('Failed to load user growth data:', error)
    userGrowthData.value = [
      { date: 'Jan', merchants: 120, customers: 2500 },
      { date: 'Feb', merchants: 135, customers: 2800 },
      { date: 'Mar', merchants: 148, customers: 3200 },
      { date: 'Apr', merchants: 156, customers: 3600 },
      { date: 'May', merchants: 162, customers: 4100 },
      { date: 'Jun', merchants: 168, customers: 4500 }
    ]
  }
}

const loadTransactionData = async () => {
  try {
    const response = await api.get('/api/admin/stats/transactions')
    transactionData.value = response.data
  } catch (error) {
    console.error('Failed to load transaction data:', error)
    transactionData.value = [
      { date: 'Jan', volume: 125000, count: 450, success: 445 },
      { date: 'Feb', volume: 138000, count: 520, success: 515 },
      { date: 'Mar', volume: 156000, count: 580, success: 575 },
      { date: 'Apr', volume: 142000, count: 540, success: 535 },
      { date: 'May', volume: 168000, count: 620, success: 615 },
      { date: 'Jun', volume: 184000, count: 680, success: 675 }
    ]
  }
}

const loadGeographyData = async () => {
  try {
    const response = await api.get('/api/admin/stats/geography')
    geographyData.value = response.data
  } catch (error) {
    console.error('Failed to load geography data:', error)
    geographyData.value = [
      { name: 'North America', customers: 2500, revenue: 1200000 },
      { name: 'Europe', customers: 1800, revenue: 950000 },
      { name: 'Asia Pacific', customers: 2200, revenue: 1100000 },
      { name: 'Latin America', customers: 800, revenue: 400000 },
      { name: 'Africa', customers: 400, revenue: 200000 }
    ]
  }
}

const loadPerformanceData = async () => {
  try {
    const response = await api.get('/api/admin/stats/performance')
    performanceData.value = response.data
  } catch (error) {
    console.error('Failed to load performance data:', error)
    performanceData.value = [
      { metric: 'API Response', value: 45, target: 50, unit: 'ms' },
      { metric: 'Database Query', value: 12, target: 15, unit: 'ms' },
      { metric: 'Payment Processing', value: 850, target: 1000, unit: 'ms' },
      { metric: 'Page Load', value: 180, target: 200, unit: 'ms' }
    ]
  }
}

const loadSystemHealth = async () => {
  try {
    const response = await api.get('/api/admin/system/health')
    systemHealth.value = response.data
  } catch (error) {
    console.error('Failed to load system health:', error)
  }
}

const loadRecentAlerts = async () => {
  try {
    const response = await api.get('/api/admin/alerts/recent')
    recentAlerts.value = response.data
  } catch (error) {
    console.error('Failed to load alerts:', error)
    recentAlerts.value = [
      { id: 1, type: 'warning', severity: 'Medium', message: 'High transaction volume detected in last hour', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 2, type: 'info', severity: 'Low', message: 'New merchant registration completed successfully', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 3, type: 'error', severity: 'High', message: 'Payment gateway timeout detected - investigating', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
      { id: 4, type: 'success', severity: 'Low', message: 'System backup completed successfully', timestamp: new Date(Date.now() - 1000 * 60 * 180) }
    ]
  }
}

const loadMerchantData = async () => {
  try {
    merchantsLoading.value = true
    const [merchantsResponse, statsResponse] = await Promise.all([
      api.get('/api/admin/merchants/recent'),
      api.get('/api/admin/merchants/stats')
    ])
    
    recentMerchants.value = merchantsResponse.data
    filteredMerchants.value = recentMerchants.value
    merchantStats.value = statsResponse.data
  } catch (error) {
    console.error('Failed to load merchant data:', error)
    // Use fallback data
    recentMerchants.value = [
      { id: 1, business_name: 'TechCorp Inc', email: 'admin@techcorp.com', business_type: 'Technology', status: 'verified', revenue: 125000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 2, business_name: 'FoodExpress', email: 'contact@foodexpress.com', business_type: 'Food & Beverage', status: 'pending', revenue: 0, created_at: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { id: 3, business_name: 'Digital Solutions', email: 'info@digitalsolutions.com', business_type: 'Technology', status: 'verified', revenue: 89000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 6) },
      { id: 4, business_name: 'Green Energy Co', email: 'hello@greenenergy.com', business_type: 'Technology', status: 'verified', revenue: 156000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 8) },
      { id: 5, business_name: 'Creative Agency', email: 'team@creativeagency.com', business_type: 'Entertainment', status: 'suspended', revenue: 45000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 10) }
    ]
    
    filteredMerchants.value = recentMerchants.value
    
    merchantStats.value = {
      total: 156,
      pending: 8,
      verified: 142,
      suspended: 6,
      newThisMonth: 23
    }
  } finally {
    merchantsLoading.value = false
  }
}

// Chart refresh methods
const refreshRevenueChart = () => loadRevenueData()
const refreshMethodsChart = () => loadMethodsData()
const refreshUserChart = () => loadUserGrowthData()
const refreshTransactionChart = () => loadTransactionData()
const refreshGeographyChart = () => loadGeographyData()
const refreshSystemHealth = () => loadSystemHealth()

// Enhanced merchant methods
const approveMerchant = async (merchant) => {
  try {
    await api.patch(`/api/admin/merchants/${merchant.id}/approve`)
    
    $q.notify({
      type: 'positive',
      message: `${merchant.business_name} approved successfully!`,
      position: 'top'
    })
    
  } catch (error) {
    console.error('Failed to approve merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to approve merchant',
      position: 'top'
    })
  }
}

const rejectMerchant = async (merchant) => {
  try {
    const { reason } = await $q.dialog({
      title: 'Reject Merchant',
      message: `Are you sure you want to reject ${merchant.business_name}?`,
      prompt: {
        model: '',
        type: 'text',
        label: 'Rejection Reason (optional)'
      },
      cancel: true,
      persistent: true
    })
    
    await api.patch(`/api/admin/merchants/${merchant.id}/reject`, { reason })
    
    $q.notify({
      type: 'positive',
      message: `${merchant.business_name} rejected`,
      position: 'top'
    })
    
    await loadMerchantData()
  } catch (error) {
    if (error) {
      console.error('Failed to reject merchant:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to reject merchant',
        position: 'top'
      })
    }
  }
}

const suspendMerchant = async (merchant) => {
  try {
    const { reason } = await $q.dialog({
      title: 'Suspend Merchant',
      message: `Are you sure you want to suspend ${merchant.business_name}?`,
      prompt: {
        model: '',
        type: 'text',
        label: 'Suspension Reason (optional)'
      },
      cancel: true,
      persistent: true
    })
    
    await api.patch(`/api/admin/merchants/${merchant.id}/suspend`, { reason })
    
    $q.notify({
      type: 'positive',
      message: `${merchant.business_name} suspended`,
      position: 'top'
    })
    
    await loadMerchantData()
  } catch (error) {
    if (error) {
      console.error('Failed to suspend merchant:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to suspend merchant',
        position: 'top'
      })
    }
  }
}

const reactivateMerchant = async (merchant) => {
  try {
    await api.patch(`/api/admin/merchants/${merchant.id}/reactivate`)
    
    $q.notify({
      type: 'positive',
      message: `${merchant.business_name} reactivated successfully!`,
      position: 'top'
    })
    
    await loadMerchantData()
  } catch (error) {
    console.error('Failed to reactivate merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to reactivate merchant',
      position: 'top'
    })
  }
}

const submitNewMerchant = async () => {
  try {
    submittingMerchant.value = true
    
    const response = await api.post('/api/admin/merchants', newMerchant.value)
    
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: 'Merchant added successfully!',
        position: 'top'
      })
      
      showAddMerchantDialog.value = false
      await loadMerchantData()
      
      // Reset form
      newMerchant.value = {
        name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        business_type: '',
        status: 'pending'
      }
    }
  } catch (error) {
    console.error('Failed to add merchant:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to add merchant',
      position: 'top'
    })
  } finally {
    submittingMerchant.value = false
  }
}

const filterByStatus = (status) => {
  if (status === 'all') {
    filteredMerchants.value = recentMerchants.value
  } else {
    filteredMerchants.value = recentMerchants.value.filter(m => m.status === status)
  }
}

const viewPendingApprovals = () => {
  filterByStatus('pending')
  router.push('/admin/merchants?status=pending')
}

// Utility methods
const getHealthColor = (value) => {
  if (value >= 95) return 'green'
  if (value >= 80) return 'orange'
  return 'red'
}

const getHealthIcon = (key) => {
  const icons = {
    api: 'api',
    database: 'storage',
    payment_gateway: 'payment',
    uptime: 'schedule',
    response_time: 'speed',
    error_rate: 'error'
  }
  return icons[key] || 'help'
}

const getHealthStatusClass = (status) => {
  const classes = {
    'Healthy': 'status-healthy',
    'Good': 'status-good',
    'Excellent': 'status-excellent',
    'Warning': 'status-warning',
    'Critical': 'status-critical'
  }
  return classes[status] || 'status-unknown'
}

const getAlertColor = (type) => {
  switch (type) {
    case 'error': return 'red'
    case 'warning': return 'orange'
    case 'info': return 'blue'
    case 'success': return 'green'
    default: return 'grey'
  }
}

const getAlertIcon = (type) => {
  switch (type) {
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    case 'success': return 'check_circle'
    default: return 'notifications'
  }
}

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'verified': return 'green'
    case 'rejected': return 'red'
    case 'suspended': return 'orange'
    case 'pending': return 'orange'
    default: return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'verified': return 'check_circle'
    case 'rejected': return 'cancel'
    case 'suspended': return 'block'
    case 'pending': return 'pending'
    default: return 'help'
  }
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return time.toLocaleDateString()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

// Action methods
const viewMerchant = (merchant) => {
  router.push(`/admin/merchants/${merchant.id}`)
}

const editMerchant = (merchant) => {
  router.push(`/admin/merchants/${merchant.id}/edit`)
}

const navigateTo = (path) => {
  router.push(path)
}

const exportPlatformData = async () => {
  try {
    const response = await api.get('/api/admin/export', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `platform-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    $q.notify({
      type: 'positive',
      message: 'Data exported successfully',
      position: 'top'
    })
  } catch{
    $q.notify({
      type: 'negative',
      message: 'Failed to export data',
      position: 'top'
    })
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-text {
  color: #bdf000;
  margin-top: 20px;
  font-size: 1.2rem;
}

.breadcrumb-section {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.admin-content {
  padding: 24px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 32px 0;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #bdf000, transparent);
  border-radius: 2px;
}

/* Chart Cards */
.chart-card {
  height: 400px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

/* System Health */
.health-card {
  height: 100%;
}

.health-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.health-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateX(4px);
}

.health-icon {
  flex-shrink: 0;
}

.health-info {
  flex: 1;
  min-width: 0;
}

.health-label {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 4px;
}

.health-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.health-status {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.status-healthy { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
.status-good { background: rgba(33, 150, 243, 0.2); color: #2196f3; }
.status-excellent { background: rgba(189, 240, 0, 0.2); color: #bdf000; }
.status-warning { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
.status-critical { background: rgba(244, 67, 54, 0.2); color: #f44336; }
.status-unknown { background: rgba(158, 158, 158, 0.2); color: #9e9e9e; }

.health-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.health-percentage {
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

/* Alerts */
.alerts-card {
  height: 100%;
}

.alerts-list {
  max-height: 300px;
  overflow-y: auto;
}

.alert-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.alert-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateX(4px);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.alert-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-severity {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert-time {
  font-size: 0.8rem;
  color: #999;
}

.alert-message {
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 12px;
  line-height: 1.4;
}

.alert-actions {
  display: flex;
  gap: 8px;
}

/* Merchants */
.merchants-card {
  height: 100%;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.merchant-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(189, 240, 0, 0.1);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.pending-item:hover {
  border-color: rgba(255, 193, 7, 0.3);
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.2);
}

.verified-item:hover {
  border-color: rgba(76, 175, 80, 0.3);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);
}

.suspended-item:hover {
  border-color: rgba(244, 67, 54, 0.3);
  box-shadow: 0 8px 24px rgba(244, 67, 54, 0.2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #bdf000;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #999;
}

.merchant-table {
  background: transparent;
}

.status-chip {
  font-weight: 600;
}

.revenue-amount {
  font-weight: 600;
  color: #4caf50;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Quick Actions */
.quick-actions {
  margin-top: 48px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.action-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.action-card:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-8px);
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 50px rgba(189, 240, 0, 0.2);
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(189, 240, 0, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover::before {
  opacity: 1;
  animation: gradientFlow 2s ease-in-out infinite;
}

@keyframes gradientFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.action-card:hover .action-icon {
  background: rgba(189, 240, 0, 0.2);
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 25px rgba(189, 240, 0, 0.4);
}

.action-content {
  flex: 1;
}

.action-content h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  transition: all 0.3s ease;
}

.action-card:hover .action-content h4 {
  color: #bdf000;
}

.action-content p {
  font-size: 0.9rem;
  color: #ccc;
  margin: 0;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.action-card:hover .action-content p {
  color: #e0e0e0;
}

.action-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Add Merchant Dialog */
.add-merchant-dialog {
  min-width: 600px;
  background: #1a1a1a;
  color: #ffffff;
}

.add-merchant-dialog .q-card-section {
  padding: 24px;
}

.add-merchant-dialog .text-h6 {
  color: #bdf000;
  font-weight: 600;
}

.add-merchant-dialog .q-input {
  margin-bottom: 16px;
}

.add-merchant-dialog .q-input__control {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.add-merchant-dialog .q-field__control {
  background: transparent;
}

.add-merchant-dialog .q-field__native {
  color: #ffffff;
}

.add-merchant-dialog .q-field__label {
  color: #bdf000;
}

.add-merchant-dialog .q-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* Animations */
.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s forwards;
}

.animate-slide-in {
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInLeft 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  .chart-card {
    height: 350px;
  }
  
  .merchant-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .chart-card {
    height: 300px;
  }
  
  .health-grid {
    gap: 16px;
  }
  
  .health-item {
    padding: 12px;
  }
  
  .merchant-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    padding: 20px;
  }
  
  .action-icon {
    width: 56px;
    height: 56px;
  }
  
  .add-merchant-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.3rem;
  }
  
  .chart-card {
    height: 250px;
  }
  
  .health-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .merchant-stats {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-in,
  .action-card,
  .health-item,
  .alert-item,
  .stat-item {
    animation: none;
    transition: none;
  }
  
  .animate-fade-in,
  .animate-slide-in {
    opacity: 1;
    transform: none;
  }
  
  .action-card:hover,
  .health-item:hover,
  .alert-item:hover,
  .stat-item:hover {
    transform: none;
  }
}

/* Enhanced focus states */
.action-card:focus-visible,
.health-item:focus-visible,
.alert-item:focus-visible,
.stat-item:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
  transform: translateY(-2px);
}

/* Smooth scrolling */
.admin-dashboard-page {
  scroll-behavior: smooth;
}

/* Performance optimizations */
.action-card,
.health-item,
.alert-item,
.stat-item,
.chart-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.action-icon {
  will-change: transform;
}

/* Scrollbar styling */
.alerts-list::-webkit-scrollbar {
  width: 6px;
}

.alerts-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.alerts-list::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.5);
  border-radius: 3px;
}

.alerts-list::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.7);
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
  background: #121212;
  border-radius: 12px;
}

/* Enhanced merchant table */
.merchant-table .q-table__top {
  background: transparent;
}

.merchant-table .q-table__bottom {
  background: transparent;
}

.merchant-table .q-table__thead th {
  background: rgba(189, 240, 0, 0.1);
  color: #ffffff;
  font-weight: 600;
  border-bottom: 2px solid rgba(189, 240, 0.2);
}

.merchant-table .q-table__tbody tr:hover {
  background: rgba(189, 240, 0, 0.05);
}

.merchant-table .q-table__tbody td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Enhanced status chips */
.status-chip {
  font-weight: 600;
  text-transform: capitalize;
}

/* Enhanced action buttons */
.action-btn {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Enhanced form inputs */
.q-input__control {
  border-radius: 8px;
}

.q-field__native {
  color: #ffffff;
}

.q-field__label {
  color: #bdf000;
}

.q-field--focused .q-field__label {
  color: #bdf000;
}

.q-field--focused .q-field__control {
  border-color: #bdf000;
}

/* Enhanced select dropdowns */
.q-select__control {
  border-radius: 8px;
}

.q-option {
  color: #ffffff;
}

.q-option:hover {
  background: rgba(189, 240, 0, 1);
  color: #09050d;
}

/* Enhanced buttons */
.q-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
}

.q-btn--standard {
  background: #bdf000;
  color: #09050d;
}

.q-btn--standard:hover {
  background: #a8d900;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(189, 240, 0, 0.3);
}

/* Enhanced notifications */
.q-notification {
  border-radius: 12px;
  font-weight: 600;
}

/* Enhanced dialogs */
.q-dialog__inner--minimized > div {
  border-radius: 16px;
  background: #1a1a1a;
}

/* Enhanced tooltips */
.q-tooltip {
  background: rgba(0, 0, 0, 0.9);
  color: #ffffff;
  border-radius: 8px;
  font-size: 0.8rem;
  padding: 8px 12px;
}

/* Loading states */
.q-loading {
  background: rgba(10, 10, 10, 0.8);
}

.q-loading__spinner {
  color: #bdf000;
}

/* Enhanced pagination */
.q-pagination {
  background: transparent;
}

.q-pagination .q-btn {
  background: rgba(189, 240, 0, 0.1);
  color: #ffffff;
  border: 1px solid rgba(189, 240, 0, 2);
}

.q-pagination .q-btn:hover {
  background: rgba(189, 240, 0, 0.2);
  border-color: rgba(189, 240, 0, 0.4);
}

.q-pagination .q-btn--active {
  background: #bdf000;
  color: #09050d;
  border-color: #bdf000;
}

/* Enhanced search input */
.q-input--outlined .q-field__control {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.q-input--outlined .q-field__control:hover {
  border-color: rgba(189, 240, 0, 0.3);
}

.q-input--outlined .q-field--focused .q-field__control {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

/* Enhanced table filters */
.q-table__top {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 16px;
}

/* Enhanced table pagination */
.q-table__bottom {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  margin-top: 16px;
  padding: 16px;
}

/* Enhanced table rows */
.q-table__tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.q-table__tbody tr:hover {
  background: rgba(189, 240, 0, 0.05);
}

/* Enhanced table cells */
.q-table__tbody td {
  padding: 12px 16px;
  vertical-align: middle;
}

/* Enhanced table headers */
.q-table__thead th {
  padding: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Enhanced badges */
.q-badge {
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Enhanced chips */
.q-chip {
  border-radius: 16px;
  font-weight: 600;
  text-transform: capitalize;
}

/* Enhanced avatars */
.q-avatar {
  border: 2px solid rgba(189, 240, 0, 0.3);
}

/* Enhanced icons */
.q-icon {
  transition: all 0.2s ease;
}

.q-icon:hover {
  transform: scale(1.1);
}

/* Enhanced separators */
.q-separator {
  background: rgba(189, 240, 0, 0.2);
}

/* Enhanced breadcrumbs */
.q-breadcrumbs {
  font-weight: 500;
}

.q-breadcrumbs__el {
  color: #999;
  transition: color 0.2s ease;
}

.q-breadcrumbs__el:hover {
  color: #bdf000;
}

.q-breadcrumbs__el--active {
  color: #bdf000;
}

/* Enhanced progress bars */
.q-linear-progress__track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.q-linear-progress__model {
  border-radius: 4px;
}

/* Enhanced circular progress */
.q-circular-progress__svg {
  stroke-linecap: round;
}

.q-circular-progress__track {
  stroke: rgba(255, 255, 255, 0.1);
}

/* Enhanced menu items */
.q-menu .q-item {
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

.q-menu .q-item:hover {
  background: rgba(189, 240, 0, 1);
  color: #09050d;
}

.q-menu .q-item--active {
  background: rgba(189, 240, 0, 0.2);
  color: #bdf000;
}

/* Enhanced drawer */
.q-drawer {
  background: #1a1a1a;
  border-right: 1px solid rgba(189, 240, 0, 0.2);
}

.q-drawer .q-item {
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

.q-drawer .q-item:hover {
  background: rgba(189, 240, 0, 1);
  color: #09050d;
}

.q-drawer .q-item--active {
  background: rgba(189, 240, 0, 0.2);
  color: #bdf000;
}

/* Enhanced header */
.q-header {
  background: #1a1a1a;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.q-toolbar {
  background: transparent;
}

/* Enhanced navigation buttons */
.nav-btn {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: rgba(189, 240, 0, 1);
  color: #09050d;
}

.nav-btn--active {
  background: rgba(189, 240, 0, 0.2);
  color: #bdf000;
}

/* Enhanced user menu */
.user-avatar-btn {
  border-radius: 50%;
  transition: all 0.2s ease;
}

.user-avatar-btn:hover {
  background: rgba(189, 240, 0, 0.1);
  transform: scale(1.05);
}

/* Enhanced notifications */
.notification-btn {
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notification-btn:hover {
  background: rgba(189, 240, 0, 0.1);
  transform: scale(1.05);
}

/* Enhanced badges */
.q-badge--floating {
  border: 2px solid #1a1a1a;
}

/* Enhanced tooltips */
.q-tooltip {
  background: rgba(0, 0, 0, 0.95);
  color: #ffffff;
  border: 1px solid rgba(189, 240, 0, 0.3);
  border-radius: 8px;
  font-size: 0.8rem;
  padding: 8px 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* Enhanced focus states */
.q-btn:focus-visible,
.q-input:focus-visible,
.q-select:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Enhanced hover effects */
.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 25px rgba(189, 240, 0, 0.2);
}

/* Enhanced transitions */
.q-transition--fade-enter-active,
.q-transition--fade-leave-active {
  transition: opacity 0.3s ease;
}

.q-transition--fade-enter-from,
.q-transition--fade-leave-to {
  opacity: 0;
}

/* Enhanced loading states */
.q-loading__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Enhanced error states */
.q-field--error .q-field__control {
  border-color: #f44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
}

.q-field--error .q-field__label {
  color: #f44336;
}

/* Enhanced success states */
.q-field--success .q-field__control {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.q-field--success .q-field__label {
  color: #4caf50;
}

/* Enhanced warning states */
.q-field--warning .q-field__control {
  border-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

.q-field--warning .q-field__label {
  color: #ff9800;
}

/* Enhanced info states */
.q-field--info .q-field__control {
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.q-field--info .q-field__label {
  color: #2196f3;
}

/* Enhanced disabled states */
.q-field--disabled .q-field__control {
  background: rgba(255, 255, 255, 0.05);
  opacity: 0.5;
}

.q-field--disabled .q-field__label {
  color: #666;
}

/* Enhanced readonly states */
.q-field--readonly .q-field__control {
  background: rgba(255, 255, 255, 0.02);
}

.q-field--readonly .q-field__label {
  color: #999;
}

/* Enhanced autofill states */
.q-field__native:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #1a1a1a inset;
  -webkit-text-fill-color: #ffffff;
}

/* Enhanced placeholder states */
.q-field__native::placeholder {
  color: #666;
  opacity: 1;
}

/* Enhanced selection states */
.q-field__native::selection {
  background: rgba(189, 240, 0, 0.3);
  color: #ffffff;
}

/* Enhanced scrollbar states */
.q-field__native::-webkit-scrollbar {
  width: 6px;
}

.q-field__native::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.q-field__native::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.5);
  border-radius: 3px;
}

.q-field__native::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.7);
}

/* Enhanced focus ring */
.q-field--focused .q-field__control::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid rgba(189, 240, 0, 0.3);
  border-radius: 10px;
  pointer-events: none;
  animation: focusRing 0.3s ease;
}

@keyframes focusRing {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Enhanced hover ring */
.q-field__control:hover::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 9px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.q-field__control:hover::before {
  opacity: 1;
}

/* Enhanced active states */
.q-field--active .q-field__control {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

/* Enhanced invalid states */
.q-field--invalid .q-field__control {
  border-color: #f44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
}

.q-field--invalid .q-field__label {
  color: #f44336;
}

/* Enhanced valid states */
.q-field--valid .q-field__control {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.q-field--valid .q-field__label {
  color: #4caf50;
}

/* Enhanced loading states */
.q-field--loading .q-field__control {
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.q-field--loading .q-field__label {
  color: #2196f3;
}

/* Enhanced success message */
.q-field__messages {
  margin-top: 4px;
}

.q-field__message {
  font-size: 0.8rem;
  margin: 2px 0;
}

.q-field__message--error {
  color: #f44336;
}

.q-field__message--success {
  color: #4caf50;
}

.q-field__message--warning {
  color: #ff9800;
}

.q-field__message--info {
  color: #2196f3;
}

/* Enhanced counter */
.q-field__counter {
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

/* Enhanced hint */
.q-field__hint {
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
}

/* Enhanced prefix */
.q-field__prefix {
  color: #999;
  margin-right: 8px;
}

/* Enhanced suffix */
.q-field__suffix {
  color: #999;
  margin-left: 8px;
}

/* Enhanced prepend */
.q-field__prepend {
  color: #999;
  margin-right: 8px;
}

/* Enhanced append */
.q-field__append {
  color: #999;
  margin-left: 8px;
}

/* Enhanced before */
.q-field__before {
  color: #999;
  margin-right: 8px;
}

/* Enhanced after */
.q-field__after {
  color: #999;
  margin-left: 8px;
}

/* Enhanced label */
.q-field__label {
  font-weight: 500;
  transition: all 0.2s ease;
}

.q-field--focused .q-field__label {
  transform: translateY(-2px);
  font-size: 0.9rem;
}

/* Enhanced native input */
.q-field__native {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  line-height: 1.5;
  padding: 8px 0;
}

.q-field__native:focus {
  outline: none;
}

/* Enhanced control */
.q-field__control {
  position: relative;
  transition: all 0.2s ease;
}

.q-field__control:hover {
  border-color: rgba(189, 240, 0, 0.3);
}

.q-field--focused .q-field__control {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

/* Enhanced field */
.q-field {
  margin-bottom: 16px;
}

.q-field--with-bottom {
  margin-bottom: 24px;
}

/* Enhanced field wrapper */
.q-field__wrapper {
  position: relative;
}

/* Enhanced field inner */
.q-field__inner {
  position: relative;
}

/* Enhanced field native */
.q-field__native {
  position: relative;
  z-index: 1;
}

/* Enhanced field label */
.q-field__label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 0;
}

.q-field--focused .q-field__label,
.q-field--with-value .q-field__label {
  transform: translateY(-20px) scale(0.8);
  color: #bdf000;
}

/* Enhanced field control */
.q-field__control {
  position: relative;
  z-index: 0;
}

/* Enhanced field messages */
.q-field__messages {
  position: relative;
  z-index: 0;
}

/* Enhanced field counter */
.q-field__counter {
  position: relative;
  z-index: 0;
}

/* Enhanced field hint */
.q-field__hint {
  position: relative;
  z-index: 0;
}

/* Enhanced field prefix */
.q-field__prefix {
  position: relative;
  z-index: 1;
}

/* Enhanced field suffix */
.q-field__suffix {
  position: relative;
  z-index: 1;
}

/* Enhanced field prepend */
.q-field__prepend {
  position: relative;
  z-index: 1;
}

/* Enhanced field append */
.q-field__append {
  position: relative;
  z-index: 1;
}

/* Enhanced field before */
.q-field__before {
  position: relative;
  z-index: 1;
}

/* Enhanced field after */
.q-field__after {
  position: relative;
  z-index: 1;
}

/* Enhanced field wrapper */
.q-field__wrapper {
  position: relative;
}

/* Enhanced field inner */
.q-field__inner {
  position: relative;
}

/* Enhanced field native */
.q-field__native {
  position: relative;
  z-index: 1;
}

/* Enhanced field label */
.q-field__label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 0;
}

.q-field--focused .q-field__label,
.q-field--with-value .q-field__label {
  transform: translateY(-20px) scale(0.8);
  color: #bdf000;
}

/* Enhanced field control */
.q-field__control {
  position: relative;
  z-index: 0;
}

/* Enhanced field messages */
.q-field__messages {
  position: relative;
  z-index: 0;
}

/* Enhanced field counter */
.q-field__counter {
  position: relative;
  z-index: 0;
}

/* Enhanced field hint */
.q-field__hint {
  position: relative;
  z-index: 0;
}

/* Enhanced field prefix */
.q-field__prefix {
  position: relative;
  z-index: 1;
}

/* Enhanced field suffix */
.q-field__suffix {
  position: relative;
  z-index: 1;
}

/* Enhanced field prepend */
.q-field__prepend {
  position: relative;
  z-index: 1;
}

/* Enhanced field append */
.q-field__append {
  position: relative;
  z-index: 1;
}

/* Enhanced field before */
.q-field__before {
  position: relative;
  z-index: 1;
}

/* Enhanced field after */
.q-field__after {
  position: relative;
  z-index: 1;
}
</style>

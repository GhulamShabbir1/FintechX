<template>
  <q-page class="admin-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="50px" />
      <p class="loading-text">Loading admin dashboard...</p>
    </div>

    <!-- Welcome Section -->
    <div class="welcome-section q-mb-xl animate-fade-in">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome back, <span class="highlight">{{ user.name || 'Admin' }}</span>! 👑
          </h1>
          <p class="welcome-subtitle">
            Admin Dashboard - Manage your fintech platform
          </p>
        </div>
        <div class="welcome-actions">
          <q-btn
            color="lime"
            icon="people"
            label="Manage Merchants"
            class="action-btn btn-primary"
            @click="manageMerchants"
          />
          <q-btn
            flat
            color="lime"
            icon="analytics"
            label="View Analytics"
            class="action-btn btn-outline"
            @click="viewAnalytics"
          />
          <q-btn
            flat
            color="red"
            icon="logout"
            label="Logout"
            class="action-btn btn-danger"
            @click="logout"
          />
        </div>
      </div>
    </div>

    <!-- Admin KPI Cards -->
    <div class="kpi-section q-mb-xl animate-fade-in" style="animation-delay: 0.1s">
      <div class="row q-gutter-lg">
        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="people" size="32px" color="lime" />
                <div class="kpi-value">{{ adminStats.totalMerchants }}</div>
              </div>
              <div class="kpi-title">Total Merchants</div>
              <div class="kpi-change positive">+{{ adminStats.merchantsGrowth }}% this month</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="receipt" size="32px" color="blue" />
                <div class="kpi-value">{{ adminStats.totalTransactions }}</div>
              </div>
              <div class="kpi-title">Total Transactions</div>
              <div class="kpi-change positive">+{{ adminStats.transactionsGrowth }}% this month</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="trending_up" size="32px" color="green" />
                <div class="kpi-value">${{ adminStats.totalRevenue.toLocaleString() }}</div>
              </div>
              <div class="kpi-title">Total Revenue</div>
              <div class="kpi-change positive">+{{ adminStats.revenueGrowth }}% this month</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="security" size="32px" color="purple" />
                <div class="kpi-value">{{ adminStats.systemHealth }}%</div>
              </div>
              <div class="kpi-title">System Health</div>
              <div class="kpi-change positive">Excellent</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="actions-section q-mb-xl animate-fade-in" style="animation-delay: 0.2s">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <div class="action-item" @click="manageMerchants">
          <div class="action-icon">
            <q-icon name="store" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Manage Merchants</h4>
            <p class="action-description">Approve, view, and manage merchant accounts</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="viewTransactions">
          <div class="action-icon">
            <q-icon name="receipt_long" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">View All Transactions</h4>
            <p class="action-description">Monitor all platform transactions</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="systemSettings">
          <div class="action-icon">
            <q-icon name="settings" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">System Settings</h4>
            <p class="action-description">Configure platform settings</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="viewReports">
          <div class="action-icon">
            <q-icon name="assessment" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Generate Reports</h4>
            <p class="action-description">Create comprehensive business reports</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="activity-section animate-fade-in" style="animation-delay: 0.3s">
      <h3 class="section-title">Recent Platform Activity</h3>
      <q-card class="activity-card">
        <q-card-section>
          <div class="activity-list">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <q-icon :name="activity.icon" :color="activity.color" size="20px" />
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <div class="activity-status">
                <q-chip :color="activity.statusColor" :label="activity.status" size="sm" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message q-mt-lg">
      <q-banner class="text-white bg-negative">
        {{ error }}
        <template v-slot:action>
          <q-btn flat color="white" label="Retry" @click="loadDashboardData" />
        </template>
      </q-banner>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const error = ref('')

// Mock admin stats (since backend endpoints are not available)
const adminStats = ref({
  totalMerchants: 1250,
  merchantsGrowth: 12,
  totalTransactions: 45680,
  transactionsGrowth: 8,
  totalRevenue: 2450000,
  revenueGrowth: 15,
  systemHealth: 99
})

// Mock recent activity
const recentActivity = ref([
  {
    id: 1,
    title: 'New merchant registration',
    time: '2 minutes ago',
    icon: 'person_add',
    color: 'green',
    status: 'Pending Approval',
    statusColor: 'orange'
  },
  {
    id: 2,
    title: 'Large transaction processed',
    time: '15 minutes ago',
    icon: 'payment',
    color: 'blue',
    status: 'Completed',
    statusColor: 'green'
  },
  {
    id: 3,
    title: 'System backup completed',
    time: '1 hour ago',
    icon: 'backup',
    color: 'purple',
    status: 'Success',
    statusColor: 'green'
  },
  {
    id: 4,
    title: 'Security scan completed',
    time: '2 hours ago',
    icon: 'security',
    color: 'lime',
    status: 'All Clear',
    statusColor: 'green'
  }
])

// Computed properties
const user = computed(() => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : { name: 'Admin', email: 'admin@example.com', role: 'admin' }
  } catch (e) {
    return { name: 'Admin', email: 'admin@example.com', role: 'admin' }
  }
})

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('Loading admin dashboard data...')
    
    // ✅ Try to load real data from backend, but don't fail if endpoints are missing
    try {
      // Try to load admin-specific data if endpoints exist
      const response = await api.get('/api/admin/dashboard')
      if (response.data) {
        adminStats.value = {
          ...adminStats.value,
          ...response.data
        }
      }
    } catch (apiError) {
      console.warn('Admin dashboard API not available, using mock data')
      // Keep using mock data
    }
    
  } catch (error) {
    console.error('Error loading admin dashboard:', error)
    error.value = 'Some dashboard features may be limited due to backend configuration.'
  } finally {
    loading.value = false
  }
}

const manageMerchants = () => {
  router.push('/admin/merchants')
}

const viewAnalytics = () => {
  router.push('/admin/analytics')
}

const viewTransactions = () => {
  $q.notify({
    type: 'info',
    message: 'Transaction management coming soon!',
    position: 'top'
  })
}

const systemSettings = () => {
  router.push('/admin/settings')
}

const viewReports = () => {
  $q.notify({
    type: 'info',
    message: 'Report generation coming soon!',
    position: 'top'
  })
}

const logout = async () => {
  try {
    // Try to logout via API
    try {
      await api.post('/api/logout')
    } catch (logoutError) {
      console.warn('Logout API failed, proceeding with local cleanup')
    }
    
    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    
    // Clear axios headers
    delete api.defaults.headers.common['Authorization']
    
    $q.notify({
      type: 'positive',
      message: 'Logged out successfully',
      position: 'top'
    })
    
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Force logout even if API fails
    localStorage.clear()
    router.push('/login')
  }
}

// Lifecycle
onMounted(() => {
  // Small delay to ensure everything is ready
  setTimeout(() => {
    loadDashboardData()
  }, 100)
})
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
  background: #0a0a0a;
  min-height: 100vh;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-text {
  color: #bdf000;
  margin-top: 16px;
  font-size: 1.1rem;
}

.welcome-section {
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.1) 0%, rgba(189, 240, 0, 0.05) 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  backdrop-filter: blur(10px);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.highlight {
  color: #bdf000;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #ccc;
  margin: 8px 0 0 0;
}

.welcome-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #bdf000;
  color: #09050d;
}

.btn-outline {
  border: 2px solid #bdf000;
  color: #bdf000;
}

.btn-danger {
  border: 2px solid #ff4444;
  color: #ff4444;
}

.btn-danger:hover {
  background: #ff4444;
  color: #ffffff;
}

.btn-outline:hover {
  background: #bdf000;
  color: #09050d;
}

.kpi-section {
  margin-top: 24px;
}

.kpi-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.kpi-card:hover {
  border-color: rgba(189, 240, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.kpi-title {
  font-size: 1rem;
  font-weight: 500;
  color: #ccc;
  margin-bottom: 8px;
}

.kpi-change {
  font-size: 0.85rem;
  font-weight: 500;
}

.kpi-change.positive {
  color: #4ade80;
}

.kpi-change.negative {
  color: #f87171;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 24px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.action-item {
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

.action-item:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-6px);
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 40px rgba(189, 240, 0, 0.2);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.action-item:hover .action-icon {
  background: rgba(189, 240, 0, 0.2);
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.3);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  transition: all 0.3s ease;
}

.action-item:hover .action-title {
  color: #bdf000;
}

.action-description {
  font-size: 0.9rem;
  color: #ccc;
  margin: 0;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.action-item:hover .action-description {
  color: #e0e0e0;
}

.action-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.action-item:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

.activity-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  backdrop-filter: blur(10px);
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 8px;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.activity-time {
  font-size: 0.8rem;
  color: #999;
}

.activity-status {
  flex-shrink: 0;
}

/* Animation Classes */
.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 16px;
  }
  
  .welcome-section {
    padding: 24px;
    border-radius: 16px;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-item {
    padding: 20px;
  }
  
  .kpi-section .row {
    flex-direction: column;
  }
}

.error-message {
  margin-top: 24px;
}
</style>
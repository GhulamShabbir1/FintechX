<template>
  <div class="merchant-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section q-mb-xl">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome back, <span class="highlight">{{ user.name || 'Merchant' }}</span>! 👋
          </h1>
          <p class="welcome-subtitle">
            Here's what's happening with your business today
          </p>
        </div>
        <div class="welcome-actions">
          <q-btn
            color="lime"
            icon="add"
            label="New Transaction"
            class="action-btn"
            @click="createTransaction"
          />
          <q-btn
            flat
            color="lime"
            icon="settings"
            label="Settings"
            class="action-btn"
            @click="openSettings"
          />
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <TopKpiCards :kpis="kpiData" />

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Status and Profile Section -->
      <div class="left-column">
        <!-- Status Card -->
        <MerchantStatusCard 
          :status="merchantStatus" 
          :progress="onboardingProgress"
          :show-actions="true"
        />

        <!-- Profile Overview -->
        <div class="profile-card">
          <div class="card-header">
            <h3 class="card-title">Business Profile</h3>
            <q-btn flat round dense icon="edit" color="lime" @click="editProfile" />
          </div>
          
          <div class="profile-content">
            <div class="profile-avatar">
              <q-avatar size="80px" square>
                <img :src="profile.logo_url || placeholderLogo" alt="Business Logo" />
              </q-avatar>
              <div class="avatar-ring"></div>
            </div>
            
            <div class="profile-details">
              <h4 class="business-name">{{ profile.business_name || 'Business Name' }}</h4>
              <p class="business-email">{{ profile.email || 'business@example.com' }}</p>
              <p class="business-website">{{ profile.website || 'No website' }}</p>
              
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ profileStats.transactions || 0 }}</span>
                  <span class="stat-label">Transactions</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ profileStats.customers || 0 }}</span>
                  <span class="stat-label">Customers</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ profileStats.rating || '4.8' }}</span>
                  <span class="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="right-column">
        <!-- Revenue Chart -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">Revenue Overview</h3>
            <div class="chart-actions">
              <q-btn flat round dense icon="refresh" color="lime" @click="refreshChart" />
              <q-btn flat round dense icon="more_vert" color="lime" />
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="revenueChart" height="300"></canvas>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-card">
          <div class="card-header">
            <h3 class="card-title">Recent Activity</h3>
            <q-btn flat round dense icon="more_vert" color="lime" />
          </div>
          
          <div class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id" 
              class="activity-item"
              @click="viewActivity(activity)"
            >
              <div class="activity-icon">
                <q-icon :name="activity.icon" :color="activity.color" size="20px" />
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              </div>
              <div class="activity-amount" v-if="activity.amount">
                {{ formatCurrency(activity.amount) }}
              </div>
            </div>
          </div>
          
          <div class="activity-footer">
            <q-btn flat color="lime" label="View All Activity" @click="viewAllActivity" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions q-mt-xl">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <div 
          v-for="action in quickActions" 
          :key="action.id"
          class="action-item"
          @click="executeAction(action)"
        >
          <div class="action-icon">
            <q-icon :name="action.icon" color="lime" size="24px" />
          </div>
          <div class="action-content">
            <h4 class="action-title">{{ action.title }}</h4>
            <p class="action-description">{{ action.description }}</p>
          </div>
          <div class="action-arrow">
            <q-icon name="arrow_forward" color="lime" size="20px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantStore } from '../../store/merchant'
import { pinia } from '../../store/pinia'
import { Chart, registerables } from 'chart.js'
import TopKpiCards from '../stats/TopKpiCards.vue'
import MerchantStatusCard from './MerchantStatusCard.vue'

Chart.register(...registerables)

const router = useRouter()
const merchant = useMerchantStore(pinia)

// Reactive data
const user = ref({
  name: 'John Doe',
  email: 'john@business.com'
})

const profile = ref({
  business_name: 'TechCorp Inc',
  email: 'contact@techcorp.com',
  website: 'www.techcorp.com',
  logo_url: null
})

const profileStats = ref({
  transactions: 1247,
  customers: 892,
  rating: '4.8'
})

const merchantStatus = ref('verified')
const onboardingProgress = ref(85)

const kpiData = ref({
  revenue: 284750,
  revenueChange: 12.5,
  revenueProgress: 75,
  transactions: 1247,
  transactionsChange: 8.3,
  transactionsProgress: 85,
  successRate: 98.7,
  successRateChange: 2.1,
  successRateProgress: 90,
  averageOrder: 228,
  averageOrderChange: -1.2,
  averageOrderProgress: 65
})

const recentActivity = ref([
  {
    id: 1,
    title: 'Payment received from Customer A',
    amount: 1250.00,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: 'payments',
    color: 'green'
  },
  {
    id: 2,
    title: 'New customer registered',
    amount: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    icon: 'person_add',
    color: 'blue'
  },
  {
    id: 3,
    title: 'Refund processed',
    amount: -89.99,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    icon: 'money_off',
    color: 'orange'
  },
  {
    id: 4,
    title: 'Payment failed',
    amount: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    icon: 'error',
    color: 'red'
  }
])

const quickActions = ref([
  {
    id: 1,
    title: 'Create Payment Link',
    description: 'Generate a payment link for your customers',
    icon: 'link',
    action: 'create-payment-link'
  },
  {
    id: 2,
    title: 'View Reports',
    description: 'Access detailed analytics and reports',
    icon: 'analytics',
    action: 'view-reports'
  },
  {
    id: 3,
    title: 'Manage Customers',
    description: 'View and manage your customer database',
    icon: 'people',
    action: 'manage-customers'
  },
  {
    id: 4,
    title: 'Support Center',
    description: 'Get help and contact support',
    icon: 'support_agent',
    action: 'support'
  }
])

// Template refs
const revenueChart = ref(null)
let chartInstance = null

// Computed properties
const placeholderLogo = computed(() => 'https://placehold.co/80x80/121018/bdf000?text=B')

// Methods
const createTransaction = () => {
  router.push('/transactions/new')
}

const openSettings = () => {
  router.push('/business/settings')
}

const editProfile = () => {
  router.push('/business/profile')
}

const refreshChart = () => {
  console.log('Refreshing chart...')
}

const viewActivity = (activity) => {
  console.log('Viewing activity:', activity)
}

const viewAllActivity = () => {
  router.push('/activity')
}

const executeAction = (action) => {
  switch (action.action) {
    case 'create-payment-link':
      router.push('/payments/create-link')
      break
    case 'view-reports':
      router.push('/reports')
      break
    case 'manage-customers':
      router.push('/customers')
      break
    case 'support':
      router.push('/support')
      break
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
  }).format(amount)
}

const createRevenueChart = () => {
  const ctx = revenueChart.value.getContext('2d')
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [45000, 52000, 48000, 61000, 55000, 68000],
        borderColor: '#bdf000',
        backgroundColor: 'rgba(189, 240, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#bdf000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ccc',
            callback: function(value) {
              return '$' + (value / 1000) + 'K'
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#ccc'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })
}

// Lifecycle
onMounted(async () => {
  if (merchant.profile) {
    profile.value = { ...merchant.profile }
  }
  
  createRevenueChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.merchant-dashboard {
  padding: 24px;
  background: #0a0a0a;
  min-height: 100vh;
}

.welcome-section {
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(189, 240, 0, 0.1) 0%, transparent 50%);
  opacity: 0.5;
}

.welcome-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: #999;
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 24px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card,
.chart-card,
.activity-card {
  background: #121212;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s ease;
}

.profile-card:hover,
.chart-card:hover,
.activity-card:hover {
  border-color: rgba(189, 240, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  position: relative;
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #bdf000, #ffffff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-avatar:hover .avatar-ring {
  opacity: 1;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.profile-details {
  flex: 1;
}

.business-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.business-email,
.business-website {
  font-size: 14px;
  color: #999;
  margin: 0 0 4px 0;
}

.profile-stats {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #bdf000;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin: 0 -12px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-amount {
  font-size: 14px;
  font-weight: 600;
  color: #bdf000;
}

.activity-footer {
  margin-top: 16px;
  text-align: center;
}

.quick-actions {
  margin-top: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-item {
  background: #121212;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-item:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-item:hover .action-icon {
  background: rgba(189, 240, 0, 0.2);
  transform: scale(1.1);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.action-description {
  font-size: 14px;
  color: #999;
  margin: 0;
  line-height: 1.4;
}

.action-arrow {
  opacity: 0;
  transition: all 0.3s ease;
}

.action-item:hover .action-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .left-column {
    order: 2;
  }
  
  .right-column {
    order: 1;
  }
}

@media (max-width: 768px) {
  .merchant-dashboard {
    padding: 16px;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .welcome-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .profile-content {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 24px;
  }
  
  .welcome-title {
    font-size: 20px;
  }
  
  .profile-card,
  .chart-card,
  .activity-card {
    padding: 20px;
  }
  
  .action-item {
    padding: 16px;
  }
}
</style>
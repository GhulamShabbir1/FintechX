<template>
  <div class="merchant-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section q-mb-xl animate-fade-in">
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
            class="action-btn btn-primary"
            @click="createTransaction"
          />
          <q-btn
            flat
            color="lime"
            icon="settings"
            label="Settings"
            class="action-btn btn-outline"
            @click="openSettings"
          />
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <TopKpiCards :kpis="kpiData" class="animate-fade-in" style="animation-delay: 0.1s" />

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Status and Profile Section -->
      <div class="left-column">
        <!-- Status Card -->
        <MerchantStatusCard 
          :status="merchantStatus" 
          :progress="onboardingProgress"
          :show-actions="true"
          class="animate-fade-in"
          style="animation-delay: 0.2s"
        />

        <!-- Profile Overview -->
        <div class="profile-card animate-fade-in" style="animation-delay: 0.3s">
          <div class="card-header">
            <h3 class="card-title">Business Profile</h3>
            <q-btn flat round dense icon="edit" color="lime" @click="editProfile" class="edit-btn" />
          </div>
          
          <div class="profile-content">
            <div class="profile-avatar">
              <q-avatar size="80px" square class="avatar-image">
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
        <div class="chart-card animate-fade-in" style="animation-delay: 0.4s">
          <div class="card-header">
            <h3 class="card-title">Revenue Overview</h3>
            <div class="chart-actions">
              <q-btn flat round dense icon="refresh" color="lime" @click="refreshChart" class="refresh-btn" />
              <q-btn flat round dense icon="more_vert" color="lime" />
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="revenueChart" height="300"></canvas>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-card animate-fade-in" style="animation-delay: 0.5s">
          <div class="card-header">
            <h3 class="card-title">Recent Activity</h3>
            <q-btn flat round dense icon="more_vert" color="lime" />
          </div>
          
          <div class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id" 
              class="activity-item"
              :class="`activity-${activity.color}`"
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
            <q-btn flat color="lime" label="View All Activity" @click="viewAllActivity" class="view-all-btn" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions q-mt-xl animate-fade-in" style="animation-delay: 0.6s">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <div 
          v-for="(action, index) in quickActions" 
          :key="action.id"
          class="action-item"
          :style="`animation-delay: ${0.7 + index * 0.1}s`"
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
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  })
}

// Lifecycle
onMounted(async () => {
  if (merchant.profile) {
    profile.value = { ...merchant.profile }
  }
  
  // Add slight delay for smooth chart animation
  setTimeout(() => {
    createRevenueChart()
  }, 500)
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
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(189, 240, 0, 0.15) 0%, transparent 50%);
  opacity: 0.6;
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
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 12px 0;
  line-height: 1.2;
  background: linear-gradient(135deg, #ffffff 0%, #bdf000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.highlight {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(189, 240, 0, 0.5);
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #ccc;
  margin: 0;
  opacity: 0.9;
}

.welcome-actions {
  display: flex;
  gap: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #09050d;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(189, 240, 0, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(189, 240, 0, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-outline {
  border: 2px solid rgba(189, 240, 0, 0.3);
  color: #bdf000;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: rgba(189, 240, 0, 0.1);
}

.btn-outline:hover {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(189, 240, 0, 0.2);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 28px;
  margin-bottom: 32px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.profile-card,
.chart-card,
.activity-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.profile-card:hover,
.chart-card:hover,
.activity-card:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-4px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 30px rgba(189, 240, 0, 0.15);
}

.profile-card::before,
.chart-card::before,
.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(189, 240, 0, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-card:hover::before,
.chart-card:hover::before,
.activity-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.edit-btn,
.refresh-btn {
  transition: all 0.3s ease;
}

.edit-btn:hover,
.refresh-btn:hover {
  transform: rotate(15deg) scale(1.1);
  background: rgba(189, 240, 0, 0.1);
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar-image {
  border: 2px solid rgba(189, 240, 0, 0.3);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.profile-avatar:hover .avatar-image {
  border-color: rgba(189, 240, 0, 0.6);
  transform: scale(1.05);
}

.avatar-ring {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border: 2px solid transparent;
  border-radius: 20px;
  background: linear-gradient(45deg, #bdf000, #ffffff, #bdf000);
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: rotate 3s linear infinite paused;
}

.profile-avatar:hover .avatar-ring {
  opacity: 0.8;
  animation-play-state: running;
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
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  transition: all 0.3s ease;
}

.profile-card:hover .business-name {
  color: #bdf000;
}

.business-email,
.business-website {
  font-size: 0.95rem;
  color: #ccc;
  margin: 0 0 6px 0;
  transition: all 0.3s ease;
}

.profile-card:hover .business-email,
.profile-card:hover .business-website {
  color: #e0e0e0;
}

.profile-stats {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  min-width: 80px;
}

.stat-item:hover {
  background: rgba(189, 240, 0, 0.1);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-2px);
}

.stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #bdf000;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(189, 240, 0, 0.3) rgba(255, 255, 255, 0.1);
}

.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.3);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.5);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 4px 0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: rgba(189, 240, 0, 0.1);
  transform: translateX(8px);
  border-color: transparent;
}

.activity-green:hover {
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.activity-blue:hover {
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
}

.activity-orange:hover {
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.3);
}

.activity-red:hover {
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
}

.activity-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  transition: all 0.3s ease;
}

.activity-item:hover .activity-icon {
  background: rgba(189, 240, 0, 0.2);
  transform: scale(1.1);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.85rem;
  color: #999;
}

.activity-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #bdf000;
  padding: 6px 12px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.3s ease;
}

.activity-item:hover .activity-amount {
  background: rgba(189, 240, 0, 0.2);
  border-color: rgba(189, 240, 0, 0.3);
  transform: scale(1.05);
}

.activity-footer {
  margin-top: 20px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.view-all-btn {
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  transform: translateY(-2px);
}

.quick-actions {
  margin-top: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 24px 0;
  text-align: center;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
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

.action-item::before {
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

.action-item:hover::before {
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
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 24px;
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
  
  .profile-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .profile-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-item {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .profile-card,
  .chart-card,
  .activity-card {
    padding: 20px;
    border-radius: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .chart-actions {
    align-self: flex-end;
  }
  
  .activity-item {
    padding: 12px;
  }
  
  .action-item {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .action-item,
  .activity-item,
  .profile-card,
  .chart-card,
  .activity-card,
  .btn-primary,
  .btn-outline,
  .edit-btn,
  .refresh-btn,
  .avatar-ring,
  .action-icon,
  .action-arrow {
    animation: none;
    transition: none;
  }
  
  .animate-fade-in {
    opacity: 1;
    transform: none;
  }
  
  .action-item:hover,
  .activity-item:hover,
  .profile-card:hover,
  .chart-card:hover,
  .activity-card:hover {
    transform: none;
  }
}

/* Enhanced focus states */
.action-item:focus-visible,
.activity-item:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
  transform: translateY(-2px);
}

/* Smooth scrolling */
.merchant-dashboard {
  scroll-behavior: smooth;
}

/* Performance optimizations */
.action-item,
.activity-item,
.profile-card,
.chart-card,
.activity-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.action-icon,
.avatar-ring {
  will-change: transform;
}
</style>
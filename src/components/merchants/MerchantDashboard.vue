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
          <!-- Logout Button -->
          <q-btn
            flat
            color="negative"
            icon="logout"
            label="Logout"
            class="action-btn btn-outline logout-btn"
            @click="handleLogout"
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
            <RevenueChart :data="revenueData" />
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="transactions-card animate-fade-in" style="animation-delay: 0.5s">
          <div class="card-header">
            <h3 class="card-title">Recent Transactions</h3>
            <q-btn flat round dense icon="visibility" color="lime" @click="viewAllTransactions" class="view-all-btn" />
          </div>
          <div class="transactions-list">
            <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
              <div class="transaction-info">
                <div class="customer-name">{{ transaction.customer_name }}</div>
                <div class="transaction-date">{{ formatDate(transaction.created_at) }}</div>
              </div>
              <div class="transaction-amount">
                <span class="amount">{{ formatCurrency(transaction.amount) }}</span>
                <q-chip :color="getStatusColor(transaction.status)" :label="transaction.status" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions animate-fade-in" style="animation-delay: 0.6s">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <q-card class="action-card" @click="generateInvoice">
          <div class="action-icon">
            <q-icon name="receipt" size="32px" color="lime" />
          </div>
          <div class="action-text">Generate Invoice</div>
        </q-card>
        
        <q-card class="action-card" @click="exportData">
          <div class="action-icon">
            <q-icon name="download" size="32px" color="lime" />
          </div>
          <div class="action-text">Export Data</div>
        </q-card>
        
        <q-card class="action-card" @click="contactSupport">
          <div class="action-icon">
            <q-icon name="support_agent" size="32px" color="lime" />
          </div>
          <div class="action-text">Contact Support</div>
        </q-card>
        
        <q-card class="action-card" @click="viewAnalytics">
          <div class="action-icon">
            <q-icon name="analytics" size="32px" color="lime" />
          </div>
          <div class="action-text">View Analytics</div>
        </q-card>
      </div>
    </div>

    <!-- Logout Confirmation Dialog -->
    <q-dialog v-model="logoutConfirm" persistent>
      <q-card class="logout-dialog">
        <q-card-section class="row items-center">
          <q-avatar icon="logout" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to logout?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="lime" v-close-popup />
          <q-btn flat label="Logout" color="negative" @click="confirmLogout" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useMerchantStore } from '../../store/merchant'
import TopKpiCards from '../stats/TopKpiCards.vue'
import MerchantStatusCard from './MerchantStatusCard.vue'
import RevenueChart from '../stats/charts/RevenueChart.vue'

const router = useRouter()
const auth = useAuthStore()
const merchant = useMerchantStore()

// Reactive data
const loading = ref(false)
const profile = ref({})
const profileStats = ref({})
const revenueData = ref([])
const recentTransactions = ref([])
const logoutConfirm = ref(false)

// Computed properties
const user = computed(() => auth.user || {})
const merchantStatus = computed(() => profile.value.status || 'pending')
const onboardingProgress = computed(() => {
  const required = ['business_name', 'logo_url', 'bank_account_name', 'bank_account_number']
  const completed = required.filter(field => profile.value[field])
  return Math.round((completed.length / required.length) * 100)
})

const kpiData = computed(() => [
  {
    title: 'Total Revenue',
    value: formatCurrency(profileStats.value.total_revenue || 0),
    change: '+12.5%',
    trend: 'up',
    icon: 'trending_up',
    color: 'lime'
  },
  {
    title: 'Transactions',
    value: profileStats.value.transactions || 0,
    change: '+8.2%',
    trend: 'up',
    icon: 'receipt',
    color: 'blue'
  },
  {
    title: 'Success Rate',
    value: `${profileStats.value.success_rate || 0}%`,
    change: '+2.1%',
    trend: 'up',
    icon: 'check_circle',
    color: 'green'
  },
  {
    title: 'Active Customers',
    value: profileStats.value.customers || 0,
    change: '+15.3%',
    trend: 'up',
    icon: 'people',
    color: 'purple'
  }
])

const placeholderLogo = 'https://dummyimage.com/200x200/121018/bdf000.png&text=Logo'

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Load merchant profile
    const profileData = await merchant.getBusinessInfo()
    profile.value = profileData || {}
    
    // Load transactions - FIXED: Use merchant.fetchForMerchant() instead of transactionsStore
    const transactionsData = await merchant.fetchForMerchant()
    recentTransactions.value = transactionsData.slice(0, 5)
    
    // Load stats
    const statsData = await merchant.getStats()
    profileStats.value = statsData || {}
    
    // Load revenue data
    const revenueResponse = await merchant.getRevenueData()
    revenueData.value = revenueResponse || []
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const createTransaction = () => {
  router.push('/checkout')
}

const openSettings = () => {
  router.push('/settings')
}

const handleLogout = () => {
  logoutConfirm.value = true
}

const confirmLogout = async () => {
  try {
    await auth.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const editProfile = () => {
  router.push('/profile')
}

const refreshChart = () => {
  loadDashboardData()
}

const viewAllTransactions = () => {
  router.push('/transactions')
}

const generateInvoice = () => {
  // Implement invoice generation
  console.log('Generate invoice')
}

const exportData = () => {
  // Implement data export
  console.log('Export data')
}

const contactSupport = () => {
  router.push('/support')
}

const viewAnalytics = () => {
  router.push('/stats')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusColor = (status) => {
  const colors = {
    success: 'green',
    pending: 'orange',
    failed: 'red',
    refunded: 'grey'
  }
  return colors[status] || 'grey'
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
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

.logout-btn {
  border: 2px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.logout-btn:hover {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.2);
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.2);
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

/* Logout Dialog */
.logout-dialog {
  background: #121212;
  color: white;
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 12px;
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
<template>
  <div class="merchant-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="50px" />
      <p class="loading-text">Loading your dashboard...</p>
    </div>

    <!-- Welcome Section with Logout -->
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
          <!-- Add Business Button -->
          <q-btn
            v-if="!profile.business_name"
            color="lime"
            icon="add_business"
            label="Add Business"
            class="action-btn btn-primary"
            @click="addBusiness"
          />
          <!-- New Transaction Button -->
          <q-btn
            v-else
            color="lime"
            icon="add"
            label="New Transaction"
            class="action-btn btn-primary"
            @click="createTransaction"
          />
          <!-- Settings Button -->
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
            color="red"
            icon="logout"
            label="Logout"
            class="action-btn btn-danger"
            @click="logout"
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
              <h4 class="business-name">{{ profile.business_name || 'No Business Added' }}</h4>
              <p class="business-email">{{ profile.email || user.email || 'business@example.com' }}</p>
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
          
          <!-- Add Business CTA if no business -->
          <div v-if="!profile.business_name" class="add-business-cta">
            <q-icon name="store" size="48px" color="lime" />
            <h4>Start Your Business Journey</h4>
            <p>Add your business details to get started with payments</p>
            <q-btn color="lime" label="Add Business Now" @click="addBusiness" />
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

        <!-- Transaction Methods Chart -->
        <div class="chart-card animate-fade-in" style="animation-delay: 0.5s">
          <div class="card-header">
            <h3 class="card-title">Payment Methods</h3>
            <div class="chart-actions">
              <q-btn flat round dense icon="refresh" color="lime" @click="refreshMethodsChart" class="refresh-btn" />
            </div>
          </div>
          <div class="chart-container">
            <MethodsChart :data="methodsData" />
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="transactions-card animate-fade-in" style="animation-delay: 0.6s">
          <div class="card-header">
            <h3 class="card-title">Recent Transactions</h3>
            <q-btn flat round dense icon="visibility" color="lime" @click="viewAllTransactions" class="view-all-btn" />
          </div>
          <div class="transactions-list">
            <div v-if="recentTransactions.length === 0" class="no-transactions">
              <q-icon name="receipt" size="48px" color="grey-5" />
              <p>No transactions yet</p>
              <q-btn v-if="profile.business_name" color="lime" label="Create First Transaction" @click="createTransaction" />
            </div>
            <div v-else v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
              <div class="transaction-info">
                <div class="customer-name">{{ transaction.customer_name || 'Customer' }}</div>
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

    <!-- Additional Charts Section -->
    <div class="charts-section q-mt-xl animate-fade-in" style="animation-delay: 0.7s">
      <h3 class="section-title">Business Analytics</h3>
      <div class="charts-grid">
        <!-- Customer Growth Chart -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">Customer Growth</h3>
          </div>
          <div class="chart-container">
            <CustomerGrowthChart :data="customerData" />
          </div>
        </div>

        <!-- Transaction Trends Chart -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">Transaction Trends</h3>
          </div>
          <div class="chart-container">
            <TransactionTrendsChart :data="trendsData" />
          </div>
        </div>

        <!-- Geographic Distribution Chart -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">Geographic Distribution</h3>
          </div>
          <div class="chart-container">
            <GeographyChart :data="geographyData" />
          </div>
        </div>

        <!-- Checkout Time Analysis -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">Checkout Time Analysis</h3>
          </div>
          <div class="chart-container">
            <CheckoutTimeChart :data="checkoutTimeData" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="actions-section q-mt-xl animate-fade-in" style="animation-delay: 0.8s">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <div class="action-item" @click="viewAnalytics">
          <div class="action-icon">
            <q-icon name="analytics" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">View Analytics</h4>
            <p class="action-description">Check your business performance metrics</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="generateInvoice">
          <div class="action-icon">
            <q-icon name="receipt_long" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Generate Invoice</h4>
            <p class="action-description">Create professional invoices for customers</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="exportData">
          <div class="action-icon">
            <q-icon name="download" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Export Data</h4>
            <p class="action-description">Download your business reports</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="contactSupport">
          <div class="action-icon">
            <q-icon name="support_agent" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Get Support</h4>
            <p class="action-description">Contact our support team</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>
      </div>
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

    <!-- Add Business Dialog -->
    <q-dialog v-model="showAddBusinessDialog" persistent>
      <q-card class="add-business-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add Your Business</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitBusiness" class="q-gutter-md">
            <q-input
              v-model="newBusiness.business_name"
              label="Business Name *"
              filled
              required
              :rules="[val => !!val || 'Business name is required']"
            />
            
            <q-input
              v-model="newBusiness.website"
              label="Website"
              filled
              type="url"
              hint="Optional: Your business website"
            />
            
            <q-input
              v-model="newBusiness.bank_account_name"
              label="Bank Account Name *"
              filled
              required
              :rules="[val => !!val || 'Bank account name is required']"
            />
            
            <q-input
              v-model="newBusiness.bank_account_number"
              label="Bank Account Number *"
              filled
              required
              :rules="[val => !!val || 'Bank account number is required']"
            />
            
            <q-input
              v-model="newBusiness.bank_name"
              label="Bank Name *"
              filled
              required
              :rules="[val => !!val || 'Bank name is required']"
            />
            
            <q-input
              v-model="newBusiness.bank_routing_number"
              label="Bank Routing Number *"
              filled
              required
              :rules="[val => !!val || 'Bank routing number is required']"
            />
            
            <q-input
              v-model="newBusiness.business_address"
              label="Business Address"
              filled
              type="textarea"
              hint="Optional: Your business address"
            />
            
            <q-input
              v-model="newBusiness.business_phone"
              label="Business Phone"
              filled
              hint="Optional: Your business phone number"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Add Business" @click="submitBusiness" :loading="submittingBusiness" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../store/auth'
import { useMerchantsStore } from '../../store/merchants'
import { useTransactionsStore } from '../../store/transactions'
import { useStatsStore } from '../../store/stats'
import { pinia } from '../../store/pinia'
import TopKpiCards from '../stats/TopKpiCards.vue'
import MerchantStatusCard from './MerchantStatusCard.vue'
import RevenueChart from '../stats/charts/RevenueChart.vue'
import MethodsChart from '../stats/charts/MethodsCharts.vue'
import CustomerGrowthChart from '../stats/charts/CustomerGrowthChart.vue'
import TransactionTrendsChart from '../stats/charts/TransactionTrendsChart.vue'
import GeographyChart from '../stats/charts/GeographyChart.vue'
import CheckoutTimeChart from '../stats/charts/CheckoutTimeChart.vue'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore(pinia)
const merchants = useMerchantsStore(pinia)
const transactions = useTransactionsStore(pinia)
const stats = useStatsStore(pinia)

// Reactive data
const loading = ref(false)
const error = ref('')
const profile = ref({})
const profileStats = ref({})
const revenueData = ref([])
const methodsData = ref([])
const customerData = ref([])
const trendsData = ref([])
const geographyData = ref([])
const checkoutTimeData = ref([])
const recentTransactions = ref([])

// Add Business Dialog
const showAddBusinessDialog = ref(false)
const submittingBusiness = ref(false)
const newBusiness = ref({
  business_name: '',
  website: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_name: '',
  bank_routing_number: '',
  business_address: '',
  business_phone: ''
})

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
    change: profileStats.value.revenue_change || '+0%',
    trend: profileStats.value.revenue_trend || 'neutral',
    icon: 'trending_up',
    color: 'lime'
  },
  {
    title: 'Transactions',
    value: profileStats.value.transactions || 0,
    change: profileStats.value.transactions_change || '+0%',
    trend: profileStats.value.transactions_trend || 'neutral',
    icon: 'receipt',
    color: 'blue'
  },
  {
    title: 'Success Rate',
    value: `${profileStats.value.success_rate || 0}%`,
    change: profileStats.value.success_rate_change || '+0%',
    trend: profileStats.value.success_rate_trend || 'neutral',
    icon: 'check_circle',
    color: 'green'
  },
  {
    title: 'Active Customers',
    value: profileStats.value.customers || 0,
    change: profileStats.value.customers_change || '+0%',
    trend: profileStats.value.customers_trend || 'neutral',
    icon: 'people',
    color: 'purple'
  }
])

const placeholderLogo = 'https://dummyimage.com/200x200/121018/bdf000.png&text=Logo'

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('Loading dashboard data...')
    
    // Load merchant profile
    try {
      const profileResponse = await merchants.getMerchantProfile()
      if (profileResponse.success) {
        profile.value = profileResponse.merchant || {}
        console.log('Profile loaded:', profile.value)
      }
    } catch (profileError) {
      console.error('Profile load error:', profileError)
    }
    
    // Load transactions
    try {
      const transactionsResponse = await transactions.loadTransactions({ limit: 5 })
      if (transactionsResponse.success) {
        recentTransactions.value = transactionsResponse.transactions || []
        console.log('Recent transactions loaded:', recentTransactions.value)
      }
    } catch (transactionsError) {
      console.error('Transactions load error:', transactionsError)
      recentTransactions.value = []
    }
    
    // Load all stats
    try {
      await stats.loadAllStats()
      profileStats.value = stats.getComputedStats()
      revenueData.value = stats.revenueData
      methodsData.value = stats.methodsData
      customerData.value = stats.customersData
      trendsData.value = stats.trendsData
      geographyData.value = stats.geographyData
      checkoutTimeData.value = stats.checkoutTimeData
      
      console.log('All stats loaded:', profileStats.value)
    } catch (statsError) {
      console.error('Stats load error:', statsError)
      // Use fallback stats
      profileStats.value = {
        total_revenue: 0,
        transactions: recentTransactions.value.length,
        success_rate: 0,
        customers: 0,
        revenue_change: '+0%',
        transactions_change: '+0%',
        success_rate_change: '+0%',
        customers_change: '+0%'
      }
      
      // Calculate real stats from transactions if available
      if (recentTransactions.value.length > 0) {
        const totalAmount = recentTransactions.value.reduce((sum, t) => sum + (t.amount || 0), 0)
        const successfulTransactions = recentTransactions.value.filter(t => t.status === 'completed').length
        
        profileStats.value.total_revenue = totalAmount
        profileStats.value.success_rate = Math.round((successfulTransactions / recentTransactions.value.length) * 100)
        profileStats.value.transactions = recentTransactions.value.length
        profileStats.value.customers = new Set(recentTransactions.value.map(t => t.customer_email)).size
      }
    }
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const addBusiness = () => {
  showAddBusinessDialog.value = true
}

const submitBusiness = async () => {
  try {
    submittingBusiness.value = true
    
    const response = await merchants.registerBusiness({
      ...newBusiness.value,
      logo_url: profile.value.logo_url || null
    })
    
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: 'Business added successfully!',
        position: 'top'
      })
      
      showAddBusinessDialog.value = false
      await loadDashboardData() // Reload data
      
      // Reset form
      newBusiness.value = {
        business_name: '',
        website: '',
        bank_account_name: '',
        bank_account_number: '',
        bank_name: '',
        bank_routing_number: '',
        business_address: '',
        business_phone: ''
      }
    } else {
      throw new Error(response.message || 'Failed to add business')
    }
    
  } catch (error) {
    console.error('Business registration error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to add business. Please try again.',
      position: 'top'
    })
  } finally {
    submittingBusiness.value = false
  }
}

const createTransaction = () => {
  router.push('/checkout')
}

const openSettings = () => {
  router.push('/settings')
}

const editProfile = () => {
  router.push('/profile')
}

const refreshChart = () => {
  loadDashboardData()
}

const refreshMethodsChart = () => {
  stats.loadMethodsStats()
}

const viewAllTransactions = () => {
  router.push('/transactions')
}

const generateInvoice = () => {
  $q.notify({
    type: 'info',
    message: 'Invoice generation coming soon!',
    position: 'top'
  })
}

const exportData = () => {
  $q.notify({
    type: 'info',
    message: 'Data export coming soon!',
    position: 'top'
  })
}

const contactSupport = () => {
  router.push('/support')
}

const viewAnalytics = () => {
  router.push('/stats')
}

const logout = async () => {
  try {
    await auth.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/login')
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100) // Assuming amount is in cents
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'green',
    pending: 'orange',
    failed: 'red',
    processing: 'blue',
    refunded: 'purple'
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card,
.chart-card,
.transactions-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.profile-card:hover,
.chart-card:hover,
.transactions-card:hover {
  border-color: rgba(189, 240, 0, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
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

.edit-btn,
.refresh-btn,
.view-all-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.profile-content {
  display: flex;
  gap: 20px;
  align-items: center;
}

.profile-avatar {
  position: relative;
}

.avatar-image {
  border: 2px solid rgba(189, 240, 0.3);
  transition: all 0.3s ease;
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(189, 240, 0.2);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.profile-details {
  flex: 1;
}

.business-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.business-email,
.business-website {
  color: #ccc;
  margin: 4px 0;
  font-size: 0.9rem;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #bdf000;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-business-cta {
  text-align: center;
  padding: 40px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
}

.add-business-cta h4 {
  color: #bdf000;
  margin: 16px 0 8px 0;
  font-size: 1.2rem;
}

.add-business-cta p {
  color: #ccc;
  margin: 0 0 20px 0;
  font-size: 0.9rem;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transactions-list {
  max-height: 300px;
  overflow-y: auto;
}

.no-transactions {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-transactions p {
  margin: 16px 0;
  font-size: 1.1rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.transaction-item:hover {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 8px;
}

.transaction-item:last-child {
  border-bottom: none;
}

.customer-name {
  font-weight: 500;
  color: #ffffff;
}

.transaction-date {
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
}

.transaction-amount {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount {
  font-weight: 600;
  color: #bdf000;
}

.charts-section {
  margin-top: 48px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 24px 0;
  text-align: center;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.actions-section {
  margin-top: 48px;
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

/* Add Business Dialog Styles */
.add-business-dialog {
  min-width: 500px;
  background: #1a1a1a;
  color: #ffffff;
}

.add-business-dialog .q-card-section {
  padding: 24px;
}

.add-business-dialog .text-h6 {
  color: #bdf000;
  font-weight: 600;
}

.add-business-dialog .q-input {
  margin-bottom: 16px;
}

.add-business-dialog .q-input__control {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.add-business-dialog .q-field__control {
  background: transparent;
}

.add-business-dialog .q-field__native {
  color: #ffffff;
}

.add-business-dialog .q-field__label {
  color: #bdf000;
}

.add-business-dialog .q-btn {
  border-radius: 8px;
  font-weight: 600;
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
  
  .charts-grid {
    grid-template-columns: 1fr;
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
  
  .add-business-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .profile-card,
  .chart-card,
  .transactions-card {
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
  
  .transaction-item {
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
  .transaction-item,
  .profile-card,
  .chart-card,
  .transactions-card,
  .btn-primary,
  .btn-outline,
  .btn-danger,
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
  .transaction-item:hover,
  .profile-card:hover,
  .chart-card:hover,
  .transactions-card:hover {
    transform: none;
  }
}

/* Enhanced focus states */
.action-item:focus-visible,
.transaction-item:focus-visible {
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
.transaction-item,
.profile-card,
.chart-card,
.transactions-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.action-icon,
.avatar-ring {
  will-change: transform;
}

.error-message {
  margin-top: 24px;
}
</style>
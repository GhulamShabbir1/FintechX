<template>
  <q-page class="merchant-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section q-mb-xl">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome back, <span class="highlight">{{ user.name || 'Merchant' }}</span>! 🏪
          </h1>
          <p class="welcome-subtitle">Merchant Dashboard - Manage your business</p>
        </div>
        <div class="welcome-actions">
          <q-btn color="lime" icon="add_business" label="Add Business" class="action-btn" @click="addBusiness" />
          <q-btn flat color="red" icon="logout" label="Logout" class="action-btn" @click="logout" />
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-section q-mb-xl">
      <div class="row q-gutter-lg">
        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="trending_up" size="32px" color="lime" />
                <div class="kpi-value">$125,000</div>
              </div>
              <div class="kpi-title">Total Revenue</div>
              <div class="kpi-change">+8% this month</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="receipt" size="32px" color="blue" />
                <div class="kpi-value">342</div>
              </div>
              <div class="kpi-title">Transactions</div>
              <div class="kpi-change">+12% this month</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="check_circle" size="32px" color="green" />
                <div class="kpi-value">96%</div>
              </div>
              <div class="kpi-title">Success Rate</div>
              <div class="kpi-change">+2% this month</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card class="kpi-card">
            <q-card-section>
              <div class="kpi-header">
                <q-icon name="people" size="32px" color="purple" />
                <div class="kpi-value">89</div>
              </div>
              <div class="kpi-title">Customers</div>
              <div class="kpi-change">+15% this month</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Business Setup Section -->
    <div class="setup-section">
      <q-card class="setup-card">
        <q-card-section>
          <div class="setup-header">
            <h3 class="card-title">Business Setup</h3>
            <q-icon name="store" size="32px" color="lime" />
          </div>
          <p class="setup-description">
            Complete your business setup to start accepting payments and managing transactions.
          </p>
          <q-btn color="lime" label="Add Business Details" @click="addBusiness" class="setup-btn" />
        </q-card-section>
      </q-card>
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
            <q-input v-model="newBusiness.business_name" label="Business Name *" filled required />
            <q-file v-model="newBusiness.logo" label="Business Logo" filled accept="image/*" />
            <q-input v-model="newBusiness.bank_account_name" label="Bank Account Name *" filled required />
            <q-input v-model="newBusiness.bank_account_number" label="Bank Account Number *" filled required />
            <q-input v-model="newBusiness.bank_ifsc_swift" label="Bank IFSC/SWIFT Code *" filled required />
            <q-select
              v-model="newBusiness.payout_preferences"
              :options="[
                {label: 'Bank Transfer', value: 'bank_transfer'},
                {label: 'UPI', value: 'upi'},
                {label: 'PayPal', value: 'paypal'}
              ]"
              label="Payout Preferences *"
              filled
              multiple
              required
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Add Business" @click="submitBusiness" :loading="submittingBusiness" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'

const router = useRouter()
const $q = useQuasar()

const showAddBusinessDialog = ref(false)
const submittingBusiness = ref(false)
const newBusiness = ref({
  business_name: '',
  logo: null,
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  payout_preferences: []
})

const user = computed(() => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : { name: 'Merchant', email: 'merchant@example.com' }
  } catch (e) {
    return { name: 'Merchant', email: 'merchant@example.com' }
  }
})

const addBusiness = () => {
  showAddBusinessDialog.value = true
}

const submitBusiness = async () => {
  try {
    submittingBusiness.value = true
    
    const formData = new FormData()
    formData.append('business_name', newBusiness.value.business_name)
    formData.append('bank_account_name', newBusiness.value.bank_account_name)
    formData.append('bank_account_number', newBusiness.value.bank_account_number)
    formData.append('bank_ifsc_swift', newBusiness.value.bank_ifsc_swift)
    
    if (newBusiness.value.logo) {
      formData.append('logo', newBusiness.value.logo)
    }
    
    newBusiness.value.payout_preferences.forEach((pref, index) => {
      formData.append(`payout_preferences[${index}]`, pref)
    })

    const response = await api.post('/api/merchant/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    $q.notify({ type: 'positive', message: 'Business added successfully!', position: 'top' })
    showAddBusinessDialog.value = false
    
  } catch (error) {
    console.error('Business registration error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to add business. Please try again.',
      position: 'top'
    })
  } finally {
    submittingBusiness.value = false
  }
}

const logout = async () => {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    delete api.defaults.headers.common['Authorization']
    
    $q.notify({ type: 'positive', message: 'Logged out successfully', position: 'top' })
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/login')
  }
}
</script>

<style scoped>
.merchant-dashboard {
  padding: 24px;
  background: #0a0a0a;
  min-height: 100vh;
}

.welcome-section {
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.1) 0%, rgba(189, 240, 0, 0.05) 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(189, 240, 0, 0.2);
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
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
}

.kpi-section .row {
  margin: 0;
}

.kpi-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s ease;
}

.kpi-card:hover {
  border-color: rgba(189, 240, 0, 0.2);
  transform: translateY(-2px);
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
  color: #4ade80;
}

.setup-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.1);
}

.setup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.setup-description {
  color: #ccc;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.setup-btn {
  border-radius: 12px;
  font-weight: 600;
}

.add-business-dialog {
  min-width: 600px;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.add-business-dialog .text-h6 {
  color: #bdf000;
  font-weight: 600;
}

.add-business-dialog :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.add-business-dialog :deep(.q-field__native) {
  color: #ffffff;
}

.add-business-dialog :deep(.q-field__label) {
  color: #bdf000;
}

@media (max-width: 768px) {
  .merchant-dashboard {
    padding: 16px;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .kpi-section .row {
    flex-direction: column;
  }
  
  .add-business-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}
</style>
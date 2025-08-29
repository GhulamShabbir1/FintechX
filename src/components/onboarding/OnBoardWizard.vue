<template>
  <div class="onboarding-wizard">
    <q-stepper v-model="currentStep" header-nav color="lime" animated flat class="custom-stepper">
      <!-- Step 1: Account Setup -->
      <q-step :name="1" title="Account" icon="person" :done="currentStep > 1">
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Create Your Account</h3>
            <p class="step-description">Let's start with your basic information</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="field-label">Full Name *</label>
              <q-input v-model="account.name" placeholder="Enter your full name" outlined dense :error="!!errors.name"
                :error-message="errors.name" @blur="validateField('name', account.name)" class="custom-input" />
            </div>

            <div class="form-group">
              <label class="field-label">Email Address *</label>
              <q-input v-model="account.email" type="email" placeholder="Enter your email address" outlined dense
                :error="!!errors.email" :error-message="errors.email" @blur="validateField('email', account.email)"
                class="custom-input" />
            </div>

            <div class="form-group">
              <label class="field-label">Password *</label>
              <q-input v-model="account.password" type="password" placeholder="Create a strong password" outlined dense
                :error="!!errors.password" :error-message="errors.password"
                @blur="validateField('password', account.password)" class="custom-input">
                <template v-slot:append>
                  <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" @click="showPassword = !showPassword"
                    class="cursor-pointer" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">Confirm Password *</label>
              <q-input v-model="account.confirmPassword" type="password" placeholder="Confirm your password" outlined
                dense :error="!!errors.confirmPassword" :error-message="errors.confirmPassword"
                @blur="validateField('confirmPassword', account.confirmPassword)" class="custom-input" />
            </div>

            <div class="form-group">
              <label class="field-label">Role *</label>
              <q-select v-model="account.role" :options="roleOptions" placeholder="Select your role" outlined dense
                emit-value map-options :error="!!errors.role" :error-message="errors.role"
                @blur="validateField('role', account.role)" class="custom-input" />
            </div>
          </div>

          <div class="step-actions">
            <q-btn label="Next" color="lime" @click="nextStep" :disabled="!isStep1Valid" :loading="loading" />
          </div>
        </div>
      </q-step>

      <!-- Step 2: Business Information -->
      <q-step :name="2" title="Business" icon="store" :done="currentStep > 2">
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Business Details</h3>
            <p class="step-description">Tell us about your business</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="field-label">Business Name *</label>
              <q-input v-model="business.business_name" placeholder="Enter your business name" outlined dense
                :error="!!errors.business_name" :error-message="errors.business_name"
                @blur="validateField('business_name', business.business_name)" class="custom-input" />
            </div>

            <div class="form-group">
              <label class="field-label">Business Logo</label>
              <q-file v-model="business.logo" label="Upload Logo" outlined dense accept=".jpg,.jpeg,.png,.gif"
                max-files="1" class="custom-input">
                <template v-slot:prepend>
                  <q-icon name="image" />
                </template>
              </q-file>
            </div>

            <div class="form-group">
              <label class="field-label">Bank Account Name *</label>
              <q-input v-model="business.bank_account_name" placeholder="Account holder name" outlined dense
                :error="!!errors.bank_account_name" :error-message="errors.bank_account_name"
                @blur="validateField('bank_account_name', business.bank_account_name)" class="custom-input" />
            </div>

            <div class="form-group">
              <label class="field-label">Bank Account Number *</label>
              <q-input v-model="business.bank_account_number" placeholder="Account number" outlined dense
                :error="!!errors.bank_account_number" :error-message="errors.bank_account_number"
                @blur="validateField('bank_account_number', business.bank_account_number)" class="custom-input" />
            </div>

            <div class="form-group">
              <label class="field-label">IFSC/SWIFT Code *</label>
          <q-input v-model="business.bank_ifsc_swift" placeholder="IFSC or SWIFT code" outlined dense
                :error="!!errors.bank_ifsc_swift" :error-message="errors.bank_ifsc_swift"
                @blur="validateField('bank_ifsc_swift', business.bank_ifsc_swift)" class="custom-input" />
            </div>

            <div class="form-group">
              <label class="field-label">Payout Preferences *</label>
              <q-select v-model="business.payout_preferences" :options="payoutOptions" multiple outlined dense use-chips
                placeholder="Select payout methods" :error-message="errors.payout_preferences"
                @blur="validateField('payout_preferences', business.payout_preferences)" class="custom-input" />
            </div>
          </div>

          <div class="step-actions">
            <q-btn label="Previous" flat @click="previousStep" class="q-mr-md" />
            <q-btn label="Next" color="lime" @click="nextStep" :disabled="!isStep2Valid" :loading="loading" />
          </div>
        </div>
     </q-step>
      <!-- Step 3: Verification -->
      <q-step :name="3" title="Verify" icon="verified" :done="currentStep > 3">
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Review & Submit</h3>
            <p class="step-description">Review your information before submitting</p>
          </div>

          <div class="review-section">
            <div class="review-card">
              <h4>Account Information</h4>
              <div class="review-item">
                <span class="label">Name:</span>
                <span class="value">{{ account.name }}</span>
              </div>
              <div class="review-item">
                <span class="label">Email:</span>
                <span class="value">{{ account.email }}</span>
              </div>
              <div class="review-item">
                <span class="label">Role:</span>
                <span class="value">{{ account.role }}</span>
              </div>
            </div>

            <div class="review-card">
              <h4>Business Information</h4>
              <div class="review-item">
                <span class="label">Business Name:</span>
                <span class="value">{{ business.business_name }}</span>
              </div>
              <div class="review-item">
                <span class="label">Bank Account:</span>
                <span class="value">{{ business.bank_account_name }}</span>
              </div>
              <div class="review-item">
                <span class="label">Account Number:</span>
                <span class="value">{{ business.bank_account_number }}</span>
              </div>
              <div class="review-item">
                <span class="label">IFSC/SWIFT:</span>
                <span class="value">{{ business.bank_ifsc_swift }}</span>
              </div>
              <div class="review-item">
                <span class="label">Payout Methods:</span>
                <span class="value">{{ business.payout_preferences.join(', ') }}</span>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <q-btn label="Previous" flat @click="previousStep" class="q-mr-md" />
            <q-btn label="Submit Application" color="lime" @click="submitApplication" :loading="submitting" />
          </div>
        </div>
      </q-step>

      <!-- Step 4: Success -->
      <q-step :name="4" title="Success" icon="check_circle">
        <div class="step-content text-center">
          <div class="success-icon">
            <q-icon name="check_circle" size="80px" color="lime" />
          </div>

          <h3 class="success-title">Application Submitted!</h3>
          <p class="success-description">
            Your application has been submitted successfully. Our team will review it and get back to you within 24-48
            hours.
          </p>

          <div class="success-actions">
            <q-btn label="Go to Dashboard" color="lime" @click="goToDashboard" class="q-mr-md" />
            <q-btn label="View Status" outline color="lime" @click="viewStatus" />
          </div>
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const currentStep = ref(1)
const loading = ref(false)
const submitting = ref(false)
const errors = ref({})

// Account data
const account = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

// Business data
const business = ref({
  business_name: '',
  logo: null,
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  payout_preferences: []
})

// Options
const roleOptions = [
  { label: 'Merchant', value: 'merchant' },
  { label: 'Admin', value: 'admin' }
]

const payoutOptions = [
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'UPI', value: 'upi' },
  { label: 'PayPal', value: 'paypal' },
  { label: 'Stripe', value: 'stripe' }
]

// Computed
const isStep1Valid = computed(() => {
  return account.value.name &&
    account.value.email &&
    account.value.password &&
    account.value.confirmPassword &&
    account.value.role &&
    account.value.password === account.value.confirmPassword
})

const isStep2Valid = computed(() => {
  return business.value.business_name &&
    business.value.bank_account_name &&
    business.value.bank_account_number &&
    business.value.bank_ifsc_swift &&
    business.value.payout_preferences.length > 0
})

// Methods
const validateField = (field, value) => {
  errors.value[field] = ''

  switch (field) {
    case 'name':
      if (!value) errors.value[field] = 'Name is required'
      break
    case 'email':
      if (!value) {
        errors.value[field] = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.value[field] = 'Invalid email format'
      }
      break
    case 'password':
      if (!value) {
        errors.value[field] = 'Password is required'
      } else if (value.length < 8) {
        errors.value[field] = 'Password must be at least 8 characters'
      }
      break
    case 'confirmPassword':
      if (!value) {
        errors.value[field] = 'Please confirm your password'
      } else if (value !== account.value.password) {
        errors.value[field] = 'Passwords do not match'
      }
      break
    case 'role':
      if (!value) errors.value[field] = 'Please select a role'
      break
    case 'business_name':
      if (!value) errors.value[field] = 'Business name is required'
      break
    case 'bank_account_name':
      if (!value) errors.value[field] = 'Bank account name is required'
      break
    case 'bank_account_number':
      if (!value) errors.value[field] = 'Bank account number is required'
      break
    case 'bank_ifsc_swift':
      if (!value) errors.value[field] = 'IFSC/SWIFT code is required'
      break
    case 'payout_preferences':
      if (!value || value.length === 0) {
        errors.value[field] = 'Please select at least one payout method'
      }
      break
  }
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitApplication = async () => {
  try {
    submitting.value = true

    // First register the user account
    const registerResponse = await api.post('/api/auth/register', {
      name: account.value.name,
      email: account.value.email,
      password: account.value.password,
      password_confirmation: account.value.confirmPassword,
      role: account.value.role
    })

    if (!registerResponse.data.success) {
      throw new Error(registerResponse.data.message || 'Registration failed')
    }

    // Store the token
    const token = registerResponse.data.token
    localStorage.setItem('token', token)

    // Then register the business
    const businessData = new FormData()
    businessData.append('business_name', business.value.business_name)
    if (business.value.logo) {
      businessData.append('logo', business.value.logo)
    }
    businessData.append('bank_account_name', business.value.bank_account_name)
    businessData.append('bank_account_number', business.value.bank_account_number)
    businessData.append('bank_ifsc_swift', business.value.bank_ifsc_swift)

    business.value.payout_preferences.forEach((pref, index) => {
      businessData.append(`payout_preferences[${index}]`, pref)
    })

    const businessResponse = await api.post('/api/merchant/register', businessData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!businessResponse.data.success) {
      throw new Error(businessResponse.data.message || 'Business registration failed')
    }

    // Move to success step
    currentStep.value = 4

    $q.notify({
      type: 'positive',
      message: 'Application submitted successfully!',
      position: 'top'
    })

  } catch (error) {
    console.error('Submission error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Failed to submit application',
      position: 'top'
    })
  } finally {
    submitting.value = false
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const viewStatus = () => {
  router.push('/dashboard?tab=status')
}

// Lifecycle
onMounted(() => {
  // Initialize with any stored data
  const storedAccount = localStorage.getItem('onboarding_account')
  const storedBusiness = localStorage.getItem('onboarding_business')

  if (storedAccount) {
    try {
      account.value = { ...account.value, ...JSON.parse(storedAccount) }
    } catch (e) {
      console.error('Error parsing stored account data:', e)
    }
  }

  if (storedBusiness) {
    try {
      business.value = { ...business.value, ...JSON.parse(storedBusiness) }
    } catch (e) {
      console.error('Error parsing stored business data:', e)
    }
  }
})
</script>


<style scoped>
.onboarding-wizard {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  color: #ffffff;
}

/* Custom Stepper */
.custom-stepper {
  background: transparent;
}

.custom-stepper :deep(.q-stepper__header) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-stepper :deep(.q-stepper__step) {
  color: #cfcfcf;
}

.custom-stepper :deep(.q-stepper__step--active) {
  color: #bdf000;
}

.custom-stepper :deep(.q-stepper__step--done) {
  color: #4caf50;
}

/* Step Content */
.step-content {
  padding: 24px 0;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #bdf000;
}

.step-description {
  color: #cfcfcf;
  font-size: 1.1rem;
  margin: 0;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.field-label {
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Custom Inputs */

.custom-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
}

.custom-input :deep(.q-field__native) {
  color: #ffffff !important;
}

.custom-input :deep(.q-field__label) {
  color: #cfcfcf !important;
}

.custom-input :deep(.q-field__control-container) {
  color: #ffffff !important;
}

/* Branding Section */
.branding-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.logo-upload {
  text-align: center;
}

.upload-area {
  width: 200px;
  height: 200px;
  border: 2px dashed rgba(189, 240, 0.3);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto 16px;
}

.upload-area:hover {
  border-color: #bdf000;
  background: rgba(189, 240, 0.05);
}

.upload-placeholder {
  text-align: center;
}

.upload-placeholder p {
  margin: 16px 0 8px 0;
  color: #ffffff;
  font-weight: 500;
}

.upload-hint {
  color: #cfcfcf;
  font-size: 0.875rem;
}

.logo-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo-preview:hover .logo-overlay {
  opacity: 1;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Color Picker */
.color-picker {
  display: flex;
  gap: 16px;
}

.color-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-option label {
  color: #cfcfcf;
  font-size: 0.875rem;
}

.color-input {
  width: 60px;
}

.color-input :deep(.q-field__control) {
  background: transparent !important;
}

/* Review Sections */
.review-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.review-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
  color: #bdf000;
  font-size: 1.1rem;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.review-row:last-child {
  border-bottom: none;
}

.review-row .label {
  color: #cfcfcf;
  font-weight: 500;
}

.review-row .value {
  color: #ffffff;
  font-weight: 600;
}

/* Terms Section */
.terms-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
}

.terms-links {
  margin-top: 16px;
  text-align: center;
}

.terms-links a {
  color: #bdf000;
  text-decoration: none;
  margin: 0 8px;
}

.terms-links a:hover {
  text-decoration: underline;
}

.separator {
  color: #cfcfcf;
}

/* Success Content */
.success-content {
  text-align: center;
  padding: 48px 24px;
}

.success-icon {
  margin-bottom: 24px;
}

.success-title {
  color: #4caf50;
  margin: 0 0 16px 0;
  font-size: 2rem;
}

.success-message {
  color: #cfcfcf;
  font-size: 1.1rem;
  margin-bottom: 32px;
  line-height: 1.6;
}

.next-steps {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
  text-align: left;
}

.next-steps h4 {
  color: #bdf000;
  margin: 0 0 16px 0;
}

.next-steps ul {
  margin: 0;
  padding-left: 20px;
  color: #cfcfcf;
}

.next-steps li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.success-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Navigation */
.stepper-navigation {
  display: flex;
  align-items: center;
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 32px;
}

.nav-btn {
  min-width: 120px;
}

/* Progress Section */
.progress-section {
  margin-top: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #cfcfcf;
  font-weight: 500;
}

.progress-bar {
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .onboarding-wizard {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .branding-section {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .upload-area {
    width: 150px;
    height: 150px;
  }

  .stepper-navigation {
    flex-direction: column;
    gap: 16px;
  }

  .nav-btn {
    min-width: 200px;
  }

  .success-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
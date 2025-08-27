<template>
  <div class="onboarding-wizard">
    <q-stepper 
      v-model="currentStep" 
      header-nav 
      color="lime" 
      animated 
      flat 
      class="custom-stepper"
    >
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
              <q-input 
                v-model="account.name" 
                placeholder="Enter your full name"
                outlined 
                dense 
                :error="!!errors.name"
                :error-message="errors.name"
                @blur="validateField('name', account.name)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Email Address *</label>
              <q-input 
                v-model="account.email" 
                type="email"
                placeholder="Enter your email address"
                outlined 
                dense 
                :error="!!errors.email"
                :error-message="errors.email"
                @blur="validateField('email', account.email)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Password *</label>
              <q-input 
                v-model="account.password" 
                type="password"
                placeholder="Create a strong password"
                outlined 
                dense 
                :error="!!errors.password"
                :error-message="errors.password"
                @blur="validateField('password', account.password)"
                class="custom-input"
              >
                <template v-slot:append>
                  <q-icon 
                    :name="showPassword ? 'visibility' : 'visibility_off'" 
                    @click="showPassword = !showPassword"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
            </div>
            
            <div class="form-group">
              <label class="field-label">Confirm Password *</label>
              <q-input 
                v-model="account.confirmPassword" 
                type="password"
                placeholder="Confirm your password"
                outlined 
                dense 
                :error="!!errors.confirmPassword"
                :error-message="errors.confirmPassword"
                @blur="validateField('confirmPassword', account.confirmPassword)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Role *</label>
              <q-select 
                v-model="account.role" 
                :options="roleOptions" 
                placeholder="Select your role"
                outlined 
                dense 
                emit-value 
                map-options
                :error="!!errors.role"
                :error-message="errors.role"
                @blur="validateField('role', account.role)"
                class="custom-input"
              />
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 2: Business Details (only if merchant) -->
      <q-step v-if="isMerchant" :name="2" title="Business" icon="store" :done="currentStep > 2">
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Business Information</h3>
            <p class="step-description">Tell us about your business</p>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="field-label">Business Name *</label>
              <q-input 
                v-model="business.business_name" 
                placeholder="Enter your business name"
                outlined 
                dense 
                :error="!!errors.business_name"
                :error-message="errors.business_name"
                @blur="validateField('business_name', business.business_name)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Business Type</label>
              <q-select 
                v-model="business.business_type" 
                :options="businessTypeOptions" 
                placeholder="Select business type"
                outlined 
                dense 
                emit-value 
                map-options
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Website</label>
              <q-input 
                v-model="business.website" 
                placeholder="https://yourwebsite.com"
                outlined 
                dense 
                :error="!!errors.website"
                :error-message="errors.website"
                @blur="validateField('website', business.website)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Phone Number</label>
              <q-input 
                v-model="business.phone" 
                placeholder="+1 (555) 123-4567"
                outlined 
                dense 
                :error="!!errors.phone"
                :error-message="errors.phone"
                @blur="validateField('phone', business.phone)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Business Address</label>
              <q-input 
                v-model="business.address" 
                placeholder="Enter your business address"
                outlined 
                dense 
                type="textarea"
                rows="3"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Industry</label>
              <q-select 
                v-model="business.industry" 
                :options="industryOptions" 
                placeholder="Select your industry"
                outlined 
                dense 
                emit-value 
                map-options
                class="custom-input"
              />
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 3: Branding & Logo -->
      <q-step v-if="isMerchant" :name="3" title="Branding" icon="palette" :done="currentStep > 3">
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Branding & Logo</h3>
            <p class="step-description">Customize your business appearance</p>
          </div>
          
          <div class="branding-section">
            <div class="logo-upload">
              <div class="upload-area" @click="triggerFileUpload">
                <div v-if="!logoPreview" class="upload-placeholder">
                  <q-icon name="add_a_photo" size="48px" color="lime" />
                  <p>Click to upload your logo</p>
                  <span class="upload-hint">PNG, JPG up to 5MB</span>
                </div>
                <div v-else class="logo-preview">
                  <img :src="logoPreview" alt="Logo Preview" />
                  <div class="logo-overlay">
                    <q-icon name="edit" size="24px" />
                  </div>
                </div>
              </div>
              
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                @change="handleLogoUpload"
                style="display: none"
              />
              
              <div class="upload-actions">
                <q-btn 
                  v-if="logoPreview" 
                  flat 
                  color="negative" 
                  icon="delete" 
                  label="Remove" 
                  @click="removeLogo"
                  size="sm"
                />
                <q-btn 
                  flat 
                  color="lime" 
                  icon="upload" 
                  label="Change Logo" 
                  @click="triggerFileUpload"
                  size="sm"
                />
              </div>
            </div>
            
            <div class="branding-options">
              <div class="form-group">
                <label class="field-label">Brand Colors</label>
                <div class="color-picker">
                  <div class="color-option">
                    <label>Primary Color</label>
                    <q-input 
                      v-model="branding.primary_color" 
                      type="color"
                      outlined 
                      dense 
                      class="color-input"
                    />
                  </div>
                  <div class="color-option">
                    <label>Secondary Color</label>
                    <q-input 
                      v-model="branding.secondary_color" 
                      type="color"
                      outlined 
                      dense 
                      class="color-input"
                    />
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="field-label">Tagline</label>
                <q-input 
                  v-model="branding.tagline" 
                  placeholder="Your business tagline"
                  outlined 
                  dense 
                  class="custom-input"
                />
              </div>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 4: Banking & Payouts -->
      <q-step v-if="isMerchant" :name="4" title="Banking" icon="account_balance" :done="currentStep > 4">
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Banking & Payout Preferences</h3>
            <p class="step-description">Set up your payment receiving details</p>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="field-label">Account Holder Name *</label>
              <q-input 
                v-model="banking.account_holder_name" 
                placeholder="Enter account holder name"
                outlined 
                dense 
                :error="!!errors.account_holder_name"
                :error-message="errors.account_holder_name"
                @blur="validateField('account_holder_name', banking.account_holder_name)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Bank Name *</label>
              <q-input 
                v-model="banking.bank_name" 
                placeholder="Enter your bank name"
                outlined 
                dense 
                :error="!!errors.bank_name"
                :error-message="errors.bank_name"
                @blur="validateField('bank_name', banking.bank_name)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Account Number *</label>
              <q-input 
                v-model="banking.account_number" 
                placeholder="Enter account number"
                outlined 
                dense 
                :error="!!errors.account_number"
                :error-message="errors.account_number"
                @blur="validateField('account_number', banking.account_number)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Routing Number *</label>
              <q-input 
                v-model="banking.routing_number" 
                placeholder="Enter routing number"
                outlined 
                dense 
                :error="!!errors.routing_number"
                :error-message="errors.routing_number"
                @blur="validateField('routing_number', banking.routing_number)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Payout Preferences *</label>
              <q-select 
                v-model="banking.payout_preferences" 
                :options="payoutOptions" 
                placeholder="Select payout methods"
                outlined 
                dense 
                multiple
                emit-value 
                map-options
                :error="!!errors.payout_preferences"
                :error-message="errors.payout_preferences"
                @blur="validateField('payout_preferences', banking.payout_preferences)"
                class="custom-input"
              />
            </div>
            
            <div class="form-group">
              <label class="field-label">Payout Schedule</label>
              <q-select 
                v-model="banking.payout_schedule" 
                :options="scheduleOptions" 
                placeholder="Select payout schedule"
                outlined 
                dense 
                emit-value 
                map-options
                class="custom-input"
              />
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 5: Review & Submit -->
      <q-step v-if="isMerchant" :name="5" title="Review" icon="check_circle">
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Review Your Information</h3>
            <p class="step-description">Please review all details before submitting</p>
          </div>
          
          <div class="review-sections">
            <!-- Account Review -->
            <div class="review-section">
              <h4 class="review-title">
                <q-icon name="person" color="lime" />
                Account Information
              </h4>
              <div class="review-content">
                <div class="review-row">
                  <span class="label">Name:</span>
                  <span class="value">{{ account.name }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Email:</span>
                  <span class="value">{{ account.email }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Role:</span>
                  <span class="value">{{ getRoleLabel(account.role) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Business Review -->
            <div class="review-section">
              <h4 class="review-title">
                <q-icon name="store" color="lime" />
                Business Information
              </h4>
              <div class="review-content">
                <div class="review-row">
                  <span class="label">Business Name:</span>
                  <span class="value">{{ business.business_name }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Business Type:</span>
                  <span class="value">{{ getBusinessTypeLabel(business.business_type) }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Website:</span>
                  <span class="value">{{ business.website || 'Not provided' }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Phone:</span>
                  <span class="value">{{ business.phone || 'Not provided' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Banking Review -->
            <div class="review-section">
              <h4 class="review-title">
                <q-icon name="account_balance" color="lime" />
                Banking Information
              </h4>
              <div class="review-content">
                <div class="review-row">
                  <span class="label">Account Holder:</span>
                  <span class="value">{{ banking.account_holder_name }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Bank:</span>
                  <span class="value">{{ banking.bank_name }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Account Number:</span>
                  <span class="value">••••••••{{ banking.account_number.slice(-4) }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Payout Methods:</span>
                  <span class="value">{{ getPayoutLabels(banking.payout_preferences) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Terms & Conditions -->
          <div class="terms-section">
            <q-checkbox 
              v-model="termsAccepted" 
              label="I agree to the Terms & Conditions and Privacy Policy"
              color="lime"
            />
            <div class="terms-links">
              <a href="#" @click.prevent="showTerms">Terms & Conditions</a>
              <span class="separator">|</span>
              <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 6: Success -->
      <q-step v-if="isMerchant" :name="6" title="Success" icon="celebration">
        <div class="step-content">
          <div class="success-content">
            <div class="success-icon">
              <q-icon name="check_circle" size="80px" color="green" />
            </div>
            <h2 class="success-title">Welcome to FinteckX!</h2>
            <p class="success-message">Your account has been created successfully. We're reviewing your business information and will notify you once approved.</p>
            
            <div class="next-steps">
              <h4>What happens next?</h4>
              <ul>
                <li>We'll review your business information (1-2 business days)</li>
                <li>You'll receive an approval email</li>
                <li>Start accepting payments immediately after approval</li>
                <li>Access your dashboard to manage transactions</li>
              </ul>
            </div>
            
            <div class="success-actions">
              <q-btn
                color="lime"
                icon="dashboard"
                label="Go to Dashboard"
                @click="goToDashboard"
                size="lg"
              />
              <q-btn
                outline
                color="lime"
                icon="email"
                label="Check Email"
                @click="checkEmail"
                class="q-ml-md"
              />
            </div>
          </div>
        </div>
      </q-step>
    </q-stepper>

    <!-- Navigation Buttons -->
    <div class="stepper-navigation">
      <q-btn
        v-if="currentStep > 1 && currentStep < 6"
        flat
        color="lime"
        icon="arrow_back"
        label="Previous"
        @click="previousStep"
        class="nav-btn"
      />
      
      <q-space />
      
      <q-btn
        v-if="currentStep < 5"
        color="lime"
        icon="arrow_forward"
        :label="currentStep === 4 ? 'Review' : 'Next'"
        @click="nextStep"
        :disable="!canProceed"
        class="nav-btn"
      />
      
      <q-btn
        v-if="currentStep === 5"
        color="lime"
        icon="check"
        label="Submit Application"
        @click="submitApplication"
        :loading="submitting"
        :disable="!canSubmit"
        class="nav-btn"
      />
    </div>

    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-info">
        <span>Step {{ currentStep }} of {{ totalSteps }}</span>
        <span>{{ Math.round((currentStep / totalSteps) * 100) }}% Complete</span>
      </div>
      <q-linear-progress 
        :value="currentStep / totalSteps" 
        color="lime" 
        size="md"
        class="progress-bar"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useMerchantStore } from '../../store/merchant'
import { Notify } from 'quasar'
import { pinia } from '../../store/pinia'

const router = useRouter()
const authStore = useAuthStore(pinia)
const merchantStore = useMerchantStore(pinia)

// Reactive data
const currentStep = ref(1)
const submitting = ref(false)
const termsAccepted = ref(false)
const showPassword = ref(false)
const fileInput = ref(null)
const logoPreview = ref(null)
const logoFile = ref(null)

// Form data
const account = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'merchant'
})

const business = ref({
  business_name: '',
  business_type: '',
  website: '',
  phone: '',
  address: '',
  industry: ''
})

const branding = ref({
  primary_color: '#bdf000',
  secondary_color: '#121018',
  tagline: ''
})

const banking = ref({
  account_holder_name: '',
  bank_name: '',
  account_number: '',
  routing_number: '',
  payout_preferences: [],
  payout_schedule: 'weekly'
})

// Validation errors
const errors = ref({})

// Options
const roleOptions = [
  { label: 'Merchant', value: 'merchant' },
  { label: 'Admin', value: 'admin' }
]

const businessTypeOptions = [
  { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Corporation', value: 'corporation' },
  { label: 'LLC', value: 'llc' },
  { label: 'Non-profit', value: 'non_profit' }
]

const industryOptions = [
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Finance', value: 'finance' },
  { label: 'Education', value: 'education' },
  { label: 'Food & Beverage', value: 'food_beverage' },
  { label: 'Retail', value: 'retail' },
  { label: 'Other', value: 'other' }
]

const payoutOptions = [
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'PayPal', value: 'paypal' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'Check', value: 'check' }
]

const scheduleOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

// Computed properties
const isMerchant = computed(() => account.value.role === 'merchant')
const totalSteps = computed(() => isMerchant.value ? 6 : 1)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return account.value.name && account.value.email && account.value.password && 
             account.value.confirmPassword && account.value.role && 
             account.value.password === account.value.confirmPassword
    case 2:
      return business.value.business_name
    case 3:
      return true // Logo is optional
    case 4:
      return banking.value.account_holder_name && banking.value.bank_name && 
             banking.value.account_number && banking.value.routing_number && 
             banking.value.payout_preferences.length > 0
    default:
      return true
  }
})

const canSubmit = computed(() => {
  return termsAccepted.value && canProceed.value
})

// Methods
const validateField = (field, value) => {
  const validations = {
    name: () => {
      if (!value) return 'Name is required'
      if (value.length < 2) return 'Name must be at least 2 characters'
      return null
    },
    email: () => {
      if (!value) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email'
      return null
    },
    password: () => {
      if (!value) return 'Password is required'
      if (value.length < 6) return 'Password must be at least 6 characters'
      return null
    },
    confirmPassword: () => {
      if (!value) return 'Please confirm password'
      if (value !== account.value.password) return 'Passwords do not match'
      return null
    },
    role: () => {
      if (!value) return 'Please select a role'
      return null
    },
    business_name: () => {
      if (!value) return 'Business name is required'
      return null
    },
    website: () => {
      if (value && !/^https?:\/\/.+\..+/.test(value)) return 'Enter a valid website URL'
      return null
    },
    phone: () => {
  if (value && !/^[+]? [1-9]\d{0,15}$/.test(value.replace(/\D/g, ''))) 
    return 'Enter a valid phone number'
  return null
},
    account_holder_name: () => {
      if (!value) return 'Account holder name is required'
      return null
    },
    bank_name: () => {
      if (!value) return 'Bank name is required'
      return null
    },
    account_number: () => {
      if (!value) return 'Account number is required'
      if (!/^\d{8,17}$/.test(value)) return 'Enter a valid account number'
      return null
    },
    routing_number: () => {
      if (!value) return 'Routing number is required'
      if (!/^\d{9}$/.test(value)) return 'Enter a valid routing number'
      return null
    },
    payout_preferences: () => {
      if (!value || value.length === 0) return 'Please select at least one payout method'
      return null
    }
  }

  const validation = validations[field]
  if (validation) {
    const error = validation()
    if (error) {
      errors.value[field] = error
    } else {
      delete errors.value[field]
    }
  }
}

const nextStep = () => {
  if (canProceed.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      Notify.create({
        type: 'negative',
        message: 'File size must be less than 5MB',
        position: 'top'
      })
      return
    }
    
    logoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const submitApplication = async () => {
  if (!canSubmit.value) return
  
  try {
    submitting.value = true
    
    // Create user account
    await authStore.register({
      name: account.value.name,
      email: account.value.email,
      password: account.value.password,
      password_confirmation: account.value.confirmPassword,
      role: account.value.role
    })
    
    // Login user
    await authStore.login({
      email: account.value.email,
      password: account.value.password
    })
    
    // Register business if merchant
    if (isMerchant.value) {
      const businessData = {
        ...business.value,
        ...banking.value,
        logo: logoFile.value,
        branding: branding.value
      }
      
      await merchantStore.registerBusiness(businessData)
    }
    
    // Move to success step
    currentStep.value = 6
    
    Notify.create({
      type: 'positive',
      message: 'Account created successfully!',
      position: 'top'
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create account',
      position: 'top'
    })
  } finally {
    submitting.value = false
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const checkEmail = () => {
  // Implement email checking logic
  console.log('Checking email...')
}

const showTerms = () => {
  // Show terms and conditions
  console.log('Showing terms...')
}

const showPrivacy = () => {
  // Show privacy policy
  console.log('Showing privacy...')
}

const getRoleLabel = (role) => {
  const roleMap = { merchant: 'Merchant', admin: 'Admin' }
  return roleMap[role] || role
}

const getBusinessTypeLabel = (type) => {
  const typeMap = {
    sole_proprietorship: 'Sole Proprietorship',
    partnership: 'Partnership',
    corporation: 'Corporation',
    llc: 'LLC',
    non_profit: 'Non-profit'
  }
  return typeMap[type] || type
}

const getPayoutLabels = (preferences) => {
  if (!preferences || preferences.length === 0) return 'None selected'
  return preferences.map(p => {
    const option = payoutOptions.find(opt => opt.value === p)
    return option ? option.label : p
  }).join(', ')
}

// Lifecycle
onMounted(() => {
  // Initialize with any existing data
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
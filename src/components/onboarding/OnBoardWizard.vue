<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <q-stepper v-model="step" header-nav color="primary" animated flat class="custom-stepper">
      <!-- Step 1: Account Setup -->
      <q-step :name="1" title="Account" icon="person" :done="step > 1">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="account.name" label="Full Name" outlined dense required 
              :rules="[val => !!val || 'Name is required']" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="account.email" type="email" label="Email" outlined dense required 
              :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Enter a valid email']" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="account.password" type="password" label="Password" outlined dense required 
              :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Password must be at least 6 characters']" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="account.confirmPassword" type="password" label="Confirm Password" outlined dense required 
              :rules="[val => !!val || 'Please confirm password', val => val === account.password || 'Passwords do not match']" />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="account.role"
              :options="roleOptions"
              label="Select Role"
              outlined
              dense
              emit-value
              map-options
              required
            />
          </div>
        </div>
      </q-step>

      <!-- Step 2: Merchant Details (only if merchant) -->
      <q-step v-if="isMerchant" :name="2" title="Merchant Details" icon="store" :done="step > 2">
        <!-- Business -->
        <div class="text-subtitle2 q-mb-sm">Business</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="merchant.business_name" label="Business Name" outlined dense required 
              :rules="[val => !!val || 'Business name is required']" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="merchant.website" label="Website" outlined dense 
              :rules="[val => !val || /^https?:\/\/.+\..+/.test(val) || 'Enter a valid website URL']" />
          </div>
        </div>

        <!-- Branding -->
        <div class="text-subtitle2 q-mt-md q-mb-sm">Branding</div>
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="72px" square class="logo-preview">
              <img :src="logoPreview || placeholderLogo" />
              <div class="logo-overlay" v-if="!logoPreview">
                <q-icon name="add_a_photo" size="24px" />
              </div>
            </q-avatar>
          </div>
          <div class="col">
            <q-file v-model="logoFile" label="Upload Logo" outlined dense accept="image/*" @rejected="onReject"
              class="file-uploader">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <q-linear-progress
              v-if="uploadProgress > 0"
              class="q-mt-md progress-bar"
              stripe
              rounded
              size="10px"
              :value="uploadProgress / 100"
              color="green"
              animation="glow"
            />
          </div>
        </div>

        <!-- Bank -->
        <div class="text-subtitle2 q-mt-md q-mb-sm">Bank</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="merchant.bank_account_name" label="Account Holder Name" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="merchant.bank_account_number" label="Account Number" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="merchant.bank_ifsc_swift" label="IFSC / SWIFT" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="merchant.payout_preferences"
              :options="payoutOptions"
              label="Payout Preferences"
              multiple
              outlined
              dense
              class="payout-selector"
            />
          </div>
        </div>
      </q-step>

      <!-- Step 3: Review (only if merchant) -->
      <q-step v-if="isMerchant" :name="3" title="Review" icon="check_circle">
        <q-card flat bordered class="q-pa-md summary-card">
          <div class="text-subtitle1 q-mb-sm">Summary</div>
          <div class="text-caption summary-item">Name: {{ account.name }}</div>
          <div class="text-caption summary-item">Email: {{ account.email }}</div>
          <div class="text-caption summary-item">Role: {{ account.role }}</div>
          <q-separator class="q-my-md" />
          <div class="text-caption summary-item">Business: {{ merchant.business_name || '—' }}</div>
          <div class="text-caption summary-item">Website: {{ merchant.website || '—' }}</div>
          <div class="text-caption summary-item">Payouts: {{ (merchant.payout_preferences || []).join(', ') || '—' }}</div>
        </q-card>
        <div class="row items-center q-col-gutter-md q-mt-md">
          <div class="col-auto">
            <q-avatar size="64px" square class="logo-review">
              <img :src="logoPreview || placeholderLogo" />
            </q-avatar>
          </div>
          <div class="col">
            <q-chip color="orange" text-color="white" icon="hourglass_empty" square class="status-chip">Pending verification</q-chip>
            <div class="text-caption status-text">After submission your account goes for verification.</div>
          </div>
        </div>
      </q-step>

      <template #navigation>
        <q-stepper-navigation class="stepper-navigation">
          <q-btn
            :label="primaryCta"
            class="btn-gradient"
            :loading="submitting"
            @click="handleSubmit"
          />
          <q-btn
            v-if="step > 1"
            flat
            class="q-ml-sm btn-outline-light"
            label="Back"
            @click="prev"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Notify } from 'quasar'
import api from '../../boot/axios'
import { useMerchantStore } from '../../store/merchant'
import { pinia } from '../../store/pinia'

const store = useMerchantStore(pinia)

const step = ref(1)
const submitting = ref(false)
const uploadProgress = ref(0)

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Merchant', value: 'merchant' }
]
const payoutOptions = ['daily', 'weekly', 'monthly']

const account = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'merchant'
})

const merchant = ref({
  business_name: '',
  website: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  payout_preferences: []
})

const logoFile = ref(null)
const logoPreview = ref('')
const placeholderLogo = 'https://placehold.co/120x120/121018/bdf000?text=LOGO'

watch(logoFile, (file) => {
  if (!file) { logoPreview.value = ''; return }
  const reader = new FileReader()
  reader.onload = (e) => { logoPreview.value = e.target?.result || '' }
  reader.readAsDataURL(file)
})

const isMerchant = computed(() => (account.value.role || '').toLowerCase() === 'merchant')
const primaryCta = computed(() => {
  if (step.value === 1 && !isMerchant.value) return 'Create Admin Account'
  if (step.value < (isMerchant.value ? 3 : 1)) return 'Next'
  return 'Submit'
})

const onReject = () => {
  Notify.create({ 
    type: 'warning', 
    message: 'Only image files allowed',
    position: 'top',
    timeout: 2000,
    actions: [{ icon: 'close', color: 'white' }]
  })
}

const prev = () => { 
  if (step.value > 1) {
    step.value -= 1
    // Smooth scroll to top when going back
    scrollToTop()
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleSubmit = async () => {
  // Validate step transitions
  if (step.value === 1) {
    if (!account.value.name || !account.value.email || !account.value.password || !account.value.confirmPassword) {
      return Notify.create({ 
        type: 'warning', 
        message: 'Please fill in all fields',
        position: 'top',
        timeout: 2000
      })
    }
    if (account.value.password !== account.value.confirmPassword) {
      return Notify.create({ 
        type: 'negative', 
        message: 'Passwords do not match',
        position: 'top',
        timeout: 2000
      })
    }
    if (isMerchant.value) {
      step.value = 2
      // Smooth scroll to top when moving to next step
      setTimeout(() => {
        scrollToTop()
      }, 300)
      return
    }
  }
  if (step.value === 2 && isMerchant.value) {
    // quick check before review
    if (!merchant.value.business_name) {
      return Notify.create({ 
        type: 'warning', 
        message: 'Please provide business name',
        position: 'top',
        timeout: 2000
      })
    }
    step.value = 3
    // Smooth scroll to top when moving to next step
    setTimeout(() => {
      scrollToTop()
    }, 300)
    return
  }

  // Final submit
  try {
    submitting.value = true

    // 1) Create user account
    // Adjust endpoint as per your backend
    await api.post('/auth/register', {
      name: account.value.name,
      email: account.value.email,
      password: account.value.password,
      role: account.value.role
    })

    // 2) If merchant, submit merchant onboarding details
    if (isMerchant.value) {
      const fd = new FormData()
      fd.append('business_name', merchant.value.business_name || '')
      fd.append('email', account.value.email || '')
      fd.append('website', merchant.value.website || '')
      fd.append('bank_account_name', merchant.value.bank_account_name || '')
      fd.append('bank_account_number', merchant.value.bank_account_number || '')
      fd.append('bank_ifsc_swift', merchant.value.bank_ifsc_swift || '')
      ;(merchant.value.payout_preferences || []).forEach((v) => fd.append('payout_preferences[]', v))
      if (logoFile.value) fd.append('logo', logoFile.value)

      await store.register(fd, (e) => {
        if (!e?.total) return
        uploadProgress.value = Math.round((e.loaded * 100) / e.total)
      })
    }

    Notify.create({ 
      type: 'positive', 
      message: 'Account created. Please log in.',
      position: 'top',
      timeout: 3000,
      icon: 'check_circle'
    })
    
    // Add a small delay before redirecting to show the success message
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)
  } catch (e) {
    console.error(e)
    Notify.create({ 
      type: 'negative', 
      message: 'Registration failed. Please try again.',
      position: 'top',
      timeout: 3000,
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}

// Initialize smooth scrolling behavior
onMounted(() => {
  // Add smooth scrolling to the entire form
  const formElement = document.querySelector('.q-form')
  if (formElement) {
    formElement.style.scrollBehavior = 'smooth'
  }
  
  // Add animation to form elements when they come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
      }
    })
  }, { threshold: 0.1 })
  
  // Observe all form inputs for animation
  setTimeout(() => {
    document.querySelectorAll('.q-input, .q-select, .q-file').forEach(el => {
      observer.observe(el)
    })
  }, 100)
})
</script>

<style scoped>
.btn-outline-light { 
  border: 1px solid #fff; 
  color: #fff;
  transition: all 0.3s ease;
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 0.5);
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(189, 240, 0, 0.3);
}

.custom-stepper {
  border-radius: 12px;
  overflow: hidden;
}

.logo-preview {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px dashed rgba(189, 240, 0, 0.3);
}

.logo-preview:hover {
  border-color: #bdf000;
  transform: scale(1.05);
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #bdf000;
}

.file-uploader {
  transition: all 0.3s ease;
}

.file-uploader:hover {
  transform: translateY(-2px);
}

.progress-bar {
  transition: width 0.3s ease;
}

.payout-selector {
  transition: all 0.3s ease;
}

.payout-selector:hover {
  transform: translateY(-2px);
}

.summary-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(189, 240, 0, 0.1);
}

.summary-item {
  padding: 4px 0;
  transition: all 0.3s ease;
}

.summary-item:hover {
  padding-left: 8px;
  color: #bdf000;
}

.logo-review {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.logo-review:hover {
  border-color: #bdf000;
  transform: scale(1.1);
}

.status-chip {
  animation: pulse 2s infinite;
}

.status-text {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.status-text:hover {
  opacity: 1;
  color: #bdf000;
}

.stepper-navigation {
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 24px;
}

/* Animation for form elements */
.q-input, .q-select, .q-file {
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateY(20px);
}

.q-input.animate-in, .q-select.animate-in, .q-file.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Keyframe animations */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(189, 240, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(189, 240, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(189, 240, 0, 0);
  }
}

@keyframes glow {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .custom-stepper {
    border-radius: 8px;
  }
  
  .btn-gradient, .btn-outline-light {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .stepper-navigation {
    flex-direction: column;
  }
}
</style>
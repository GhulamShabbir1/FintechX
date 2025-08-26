<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <q-stepper v-model="step" header-nav color="primary" animated flat class="custom-stepper dark-surface">
      <!-- Step 1: Account Setup -->
      <q-step :name="1" title="Account" icon="person" :done="step > 1" class="dark-panel">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input v-model="account.name" label="Full Name" outlined dense required
              :rules="[val => !!val || 'Name is required']" />
          </div>
          <div class="col-12">
            <q-input v-model="account.email" type="email" label="Email" outlined dense required
              :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Enter a valid email']" />
          </div>
          <div class="col-12">
            <q-input v-model="account.password" type="password" label="Password" outlined dense required
              :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Password must be at least 6 characters']" />
          </div>
          <div class="col-12">
            <q-input v-model="account.confirmPassword" type="password" label="Confirm Password" outlined dense required
              :rules="[val => !!val || 'Please confirm password', val => val === account.password || 'Passwords do not match']" />
          </div>
          <div class="col-12">
            <q-select v-model="account.role" :options="roleOptions" label="Select Role" outlined dense emit-value
              map-options required />
          </div>
        </div>
      </q-step>

      <!-- Step 2: Merchant Details (only if merchant) -->
      <q-step v-if="isMerchant" :name="2" title="Merchant Details" icon="store" :done="step > 2" class="dark-panel">
        <!-- Business -->
        <div class="text-subtitle2 q-mb-sm text-soft">Business</div>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input v-model="merchant.business_name" label="Business Name" outlined dense required
              :rules="[val => !!val || 'Business name is required']" />
          </div>
          <div class="col-12">
            <q-input v-model="merchant.website" label="Website" outlined dense
              :rules="[val => !val || /^https?:\/\/.+\..+/.test(val) || 'Enter a valid website URL']" />
          </div>
        </div>

        <!-- Branding -->
        <div class="text-subtitle2 q-mt-md q-mb-sm text-soft">Branding</div>
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="72px" square class="logo-preview dark-tile">
              <img :src="logoPreview || placeholderLogo" />
              <div class="logo-overlay" v-if="!logoPreview">
                <q-icon name="add_a_photo" size="24px" />
              </div>
            </q-avatar>
          </div>
          <div class="col-12">
            <q-file v-model="logoFile" label="Upload Logo" outlined dense accept="image/*" @rejected="onReject"
              class="file-uploader dark-field">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <q-linear-progress v-if="uploadProgress > 0" class="q-mt-md progress-bar" stripe rounded size="10px"
              :value="uploadProgress / 100" color="green" animation="glow" />
          </div>
        </div>

        <!-- Bank -->
        <div class="text-subtitle2 q-mt-md q-mb-sm text-soft">Bank</div>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input v-model="merchant.bank_account_name" label="Account Holder Name" outlined dense />
          </div>
          <div class="col-12">
            <q-input v-model="merchant.bank_account_number" label="Account Number" outlined dense />
          </div>
          <div class="col-12">
            <q-input v-model="merchant.bank_ifsc_swift" label="IFSC / SWIFT" outlined dense />
          </div>
          <div class="col-12">
            <q-select v-model="merchant.payout_preferences" :options="payoutOptions" label="Payout Preferences" multiple
              outlined dense class="payout-selector dark-field" />
          </div>
        </div>
      </q-step>

      <!-- Step 3: Review (only if merchant) -->
      <q-step v-if="isMerchant" :name="3" title="Review" icon="check_circle" class="dark-panel">
        <q-card flat bordered class="q-pa-md summary-card dark-card">
          <div class="text-subtitle1 q-mb-sm text-lime">Summary</div>
          <div class="text-caption summary-item text-soft">Name: {{ account.name }}</div>
          <div class="text-caption summary-item text-soft">Email: {{ account.email }}</div>
          <div class="text-caption summary-item text-soft">Role: {{ account.role }}</div>
          <q-separator class="q-my-md" />
          <div class="text-caption summary-item text-soft">Business: {{ merchant.business_name || '—' }}</div>
          <div class="text-caption summary-item text-soft">Website: {{ merchant.website || '—' }}</div>
          <div class="text-caption summary-item text-soft">Payouts: {{ (merchant.payout_preferences || []).join(', ') || '—' }}</div>
        </q-card>
        <div class="row items-center q-col-gutter-md q-mt-md">
          <div class="col-auto">
            <q-avatar size="64px" square class="logo-review dark-tile">
              <img :src="logoPreview || placeholderLogo" />
            </q-avatar>
          </div>
          <div class="col">
            <q-chip color="orange" text-color="white" icon="hourglass_empty" square class="status-chip">Pending verification</q-chip>
            <div class="text-caption status-text text-soft">After submission your account goes for verification.</div>
          </div>
        </div>
      </q-step>

      <template #navigation>
        <q-stepper-navigation class="stepper-navigation">
          <q-btn :label="primaryCta" class="btn-gradient" :loading="submitting" @click="handleSubmit" />
          <q-btn v-if="step > 1" flat class="q-ml-sm btn-outline-light" label="Back" @click="prev" />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSubmit = async () => {
  if (step.value === 1) {
    if (!account.value.name || !account.value.email || !account.value.password || !account.value.confirmPassword) {
      return Notify.create({ type: 'warning', message: 'Please fill in all fields', position: 'top', timeout: 2000 })
    }
    if (account.value.password !== account.value.confirmPassword) {
      return Notify.create({ type: 'negative', message: 'Passwords do not match', position: 'top', timeout: 2000 })
    }
    if (isMerchant.value) {
      step.value = 2
      setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, 300)
      return
    }
  }

  if (step.value === 2 && isMerchant.value) {
    if (!merchant.value.business_name) {
      return Notify.create({ type: 'warning', message: 'Please provide business name', position: 'top', timeout: 2000 })
    }
    step.value = 3
    setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, 300)
    return
  }

  try {
    submitting.value = true

    await api.post('/api/auth/register', {
      name: account.value.name,
      email: account.value.email,
      password: account.value.password,
      role: account.value.role
    })

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

    Notify.create({ type: 'positive', message: 'Account created. Please log in.', position: 'top', timeout: 3000, icon: 'check_circle' })
    setTimeout(() => { window.location.href = '/login' }, 1500)
  } catch (e) {
    console.error(e)
    Notify.create({ type: 'negative', message: 'Registration failed. Please try again.', position: 'top', timeout: 3000, icon: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Dark surfaces */
.dark-surface {
  background: #0e0f13 !important;
  border: 1px solid rgba(189, 240, 0, 0.12);
  border-radius: 16px;
}

.dark-panel {
  background: transparent;
  color: #e9e9ea;
}

.dark-card {
  background: rgba(12, 12, 14, 0.85);
  border: 1px solid rgba(189, 240, 0, 0.12);
  color: #e9e9ea;
}

.dark-tile {
  background: rgba(20, 22, 26, 0.8);
  border: 1px solid rgba(189, 240, 0, 0.14);
}

/* Quasar Stepper theming */
:deep(.q-stepper__header) {
  background: #0f1116;
  border-bottom: 1px solid rgba(189, 240, 0, 0.12);
}

:deep(.q-stepper__tab) {
  background: transparent;
  color: #cfd2d6;
}

:deep(.q-stepper__tab--active) {
  background: rgba(189, 240, 0, 0.08);
  color: #bdf000;
  border-radius: 10px;
}

:deep(.q-stepper__dot) {
  background: rgba(189, 240, 0, 0.18);
}

:deep(.q-stepper__dot .q-icon) {
  color: #0b0c10;
}

:deep(.q-stepper__content) {
  background: rgba(10, 11, 14, 0.9);
}

/* Inputs and selects - dark */
.dark-field,
:deep(.q-field--outlined .q-field__control) {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(189, 240, 0, 0.14) !important;
  border-radius: 12px !important;
}

:deep(.q-field--outlined .q-field__control:hover) {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(189, 240, 0, 0.22) !important;
}

:deep(.q-field__native),
:deep(.q-field__label),
:deep(.q-file__label) {
  color: #e2e5e9 !important;
}

:deep(.q-field__bottom) {
  color: #e07a7a !important;
}

/* Buttons */
.btn-outline-light {
  border: 1px solid rgba(189, 240, 0, 0.24);
  color: #e9e9ea;
  transition: all 0.3s ease;
}

.btn-outline-light:hover {
  background-color: rgba(189, 240, 0, 0.08);
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

/* Stepper container */
.custom-stepper {
  border-radius: 16px;
  overflow: hidden;
}

/* Logo/file blocks */
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
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(9, 9, 11, 0.55);
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

/* Payout selector */
.payout-selector {
  transition: all 0.3s ease;
}

.payout-selector:hover {
  transform: translateY(-2px);
}

/* Summary */
.summary-card {
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(189, 240, 0, 0.12);
}

.summary-item {
  padding: 4px 0;
  transition: all 0.3s ease;
}

.summary-item:hover {
  padding-left: 8px;
  color: #bdf000;
}

/* Logo review */
.logo-review {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.logo-review:hover {
  border-color: #bdf000;
  transform: scale(1.1);
}

/* Status */
.status-chip {
  animation: pulse 2s infinite;
}

.status-text {
  opacity: 0.85;
  transition: all 0.3s ease;
}

.status-text:hover {
  opacity: 1;
  color: #bdf000;
}

/* Navigation */
.stepper-navigation {
  padding: 16px 0;
  border-top: 1px solid rgba(189, 240, 0, 0.12);
  margin-top: 24px;
}
</style>
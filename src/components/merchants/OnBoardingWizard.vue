<template>
  <q-form @submit.prevent="next" class="merchant-registration-stepper">
    <q-stepper 
      v-model="step" 
      header-nav 
      color="primary" 
      animated 
      flat
      class="registration-stepper"
      :class="`step-${step}`"
    >
      <!-- 1. Business Details -->
      <q-step 
        :name="1" 
        title="Business Details" 
        icon="store" 
        :done="step > 1"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <q-icon name="store" size="32px" color="primary" class="step-icon" />
          <div class="step-text">
            <h3 class="step-title">Business Information</h3>
            <p class="step-subtitle">Tell us about your business</p>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input 
              v-model="form.business_name" 
              label="Business Name *" 
              outlined 
              dense 
              required 
              class="modern-input"
              :rules="[val => !!val || 'Business name is required']"
              @blur="validateStep(1)"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input 
              v-model="form.email" 
              type="email" 
              label="Business Email *" 
              outlined 
              dense 
              required 
              class="modern-input"
              :rules="[
                val => !!val || 'Email is required',
                val => /.+@.+\..+/.test(val) || 'Invalid email format'
              ]"
              @blur="validateStep(1)"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <q-input 
              v-model="form.website" 
              label="Website" 
              outlined 
              dense 
              class="modern-input"
              type="url"
              @blur="validateStep(1)"
            >
              <template v-slot:prepend>
                <q-icon name="language" color="primary" />
              </template>
            </q-input>
          </div>
        </div>
      </q-step>

      <!-- 2. Branding -->
      <q-step 
        :name="2" 
        title="Branding" 
        icon="image" 
        :done="step > 2"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <q-icon name="image" size="32px" color="primary" class="step-icon" />
          <div class="step-text">
            <h3 class="step-title">Brand Identity</h3>
            <p class="step-subtitle">Upload your business logo</p>
          </div>
        </div>

        <div class="row items-center q-col-gutter-lg">
          <div class="col-auto">
            <div class="logo-preview-container">
              <q-avatar size="96px" square class="logo-preview">
                <img :src="previewLogo || placeholderLogo" />
                <div v-if="!previewLogo" class="logo-placeholder">
                  <q-icon name="photo" size="32px" />
                </div>
              </q-avatar>
              <div v-if="previewLogo" class="logo-overlay">
                <q-btn 
                  round 
                  dense 
                  flat 
                  icon="close" 
                  color="negative" 
                  size="sm"
                  @click="removeLogo"
                  class="remove-logo-btn"
                />
              </div>
            </div>
          </div>
          <div class="col">
            <q-file 
              v-model="logoFile" 
              label="Upload Logo *" 
              outlined 
              dense 
              accept=".jpg,.jpeg,.png,.webp"
              class="modern-input file-input"
              max-file-size="2097152"
              @rejected="onReject"
              @update:model-value="onLogoSelected"
              :rules="[val => !!val || 'Logo is required']"
            >
              <template v-slot:prepend>
                <q-icon name="image" color="primary" />
              </template>
              <template v-slot:after>
                <q-btn 
                  round 
                  dense 
                  flat 
                  icon="help" 
                  color="grey"
                  @click="showLogoHelp = true"
                >
                  <q-tooltip>Logo requirements</q-tooltip>
                </q-btn>
              </template>
            </q-file>
            
            <q-linear-progress 
              v-if="uploadProgress > 0" 
              class="q-mt-md progress-bar" 
              stripe 
              rounded 
              size="12px"
              :value="uploadProgress / 100" 
              color="primary"
            >
              <div class="absolute-full flex flex-center">
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
            </q-linear-progress>
            
            <div class="file-hint">
              Recommended: 256×256px, PNG or JPG, max 2MB
            </div>
          </div>
        </div>
      </q-step>

      <!-- 3. Bank Details -->
      <q-step 
        :name="3" 
        title="Bank Details" 
        icon="account_balance" 
        :done="step > 3"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <q-icon name="account_balance" size="32px" color="primary" class="step-icon" />
          <div class="step-text">
            <h3 class="step-title">Banking Information</h3>
            <p class="step-subtitle">Where should we send your payments?</p>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input 
              v-model="form.bank_account_name" 
              label="Account Holder Name *" 
              outlined 
              dense 
              class="modern-input"
              :rules="[val => !!val || 'Account holder name is required']"
              @blur="validateStep(3)"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input 
              v-model="form.bank_account_number" 
              label="Account Number *" 
              outlined 
              dense 
              class="modern-input"
              :rules="[
                val => !!val || 'Account number is required',
                val => /^\d{8,20}$/.test(val) || 'Must be 8-20 digits'
              ]"
              mask="####################"
              @blur="validateStep(3)"
            >
              <template v-slot:prepend>
                <q-icon name="credit_card" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input 
              v-model="form.bank_ifsc_swift" 
              label="IFSC / SWIFT Code *" 
              outlined 
              dense 
              class="modern-input"
              :rules="[val => !!val || 'IFSC/SWIFT code is required']"
              @blur="validateStep(3)"
            >
              <template v-slot:prepend>
                <q-icon name="code" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-select 
              v-model="form.payout_preferences" 
              :options="payoutOptions"
              label="Payout Preferences *" 
              multiple 
              outlined 
              dense 
              class="modern-input"
              :rules="[val => val && val.length > 0 || 'Select at least one preference']"
              use-chips
              @update:model-value="validateStep(3)"
            >
              <template v-slot:prepend>
                <q-icon name="payments" color="primary" />
              </template>
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  dense
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                  color="primary"
                  text-color="white"
                >
                  {{ scope.opt.label }}
                </q-chip>
              </template>
            </q-select>
          </div>
        </div>
      </q-step>

      <!-- 4. Review & Submit -->
      <q-step 
        :name="4" 
        title="Review & Submit" 
        icon="check_circle"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <q-icon name="check_circle" size="32px" color="primary" class="step-icon" />
          <div class="step-text">
            <h3 class="step-title">Review & Submit</h3>
            <p class="step-subtitle">Confirm your information and complete registration</p>
          </div>
        </div>

        <q-card flat bordered class="summary-card q-pa-md">
          <div class="text-subtitle1 q-mb-md summary-title">Registration Summary</div>
          <div class="summary-grid">
            <div class="summary-item">
              <q-icon name="business" size="20px" color="primary" />
              <div class="summary-content">
                <div class="summary-label">Business Name</div>
                <div class="summary-value">{{ form.business_name || '—' }}</div>
              </div>
            </div>
            <div class="summary-item">
              <q-icon name="email" size="20px" color="primary" />
              <div class="summary-content">
                <div class="summary-label">Email</div>
                <div class="summary-value">{{ form.email || '—' }}</div>
              </div>
            </div>
            <div class="summary-item">
              <q-icon name="language" size="20px" color="primary" />
              <div class="summary-content">
                <div class="summary-label">Website</div>
                <div class="summary-value">{{ form.website || '—' }}</div>
              </div>
            </div>
            <div class="summary-item">
              <q-icon name="payments" size="20px" color="primary" />
              <div class="summary-content">
                <div class="summary-label">Payout Preferences</div>
                <div class="summary-value">{{ (form.payout_preferences || []).join(', ') || '—' }}</div>
              </div>
            </div>
          </div>
        </q-card>

        <div class="row items-center q-col-gutter-lg q-mt-lg">
          <div class="col-auto">
            <div class="logo-preview-container">
              <q-avatar size="80px" square class="logo-preview">
                <img :src="previewLogo || placeholderLogo" />
              </q-avatar>
            </div>
          </div>
          <div class="col">
            <div class="status-display">
              <q-chip :color="statusColor" text-color="white" icon="hourglass_empty" square class="status-chip">
                {{ statusText }}
              </q-chip>
              <div class="status-description">After submission, your account will be reviewed for verification.</div>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Navigation -->
      <template #navigation>
        <q-stepper-navigation class="stepper-navigation">
          <div class="navigation-content">
            <q-btn 
              :label="step < 4 ? 'Continue' : 'Complete Registration'" 
              class="btn-primary"
              :loading="submitting" 
              @click="next"
              :disable="!isStepValid(step)"
            >
              <template v-slot:loading>
                <q-spinner-dots />
                {{ step < 4 ? 'Processing...' : 'Submitting...' }}
              </template>
            </q-btn>
            
            <q-btn 
              v-if="step > 1" 
              flat 
              class="btn-outline q-ml-sm" 
              label="Back" 
              @click="prev" 
              :disable="submitting"
            />
            
            <div class="step-indicator">
              Step {{ step }} of 4
            </div>
          </div>
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <!-- Logo Help Dialog -->
    <q-dialog v-model="showLogoHelp">
      <q-card class="help-dialog">
        <q-card-section>
          <div class="text-h6">Logo Requirements</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="help-content">
            <div class="help-item">
              <q-icon name="check" color="positive" size="16px" />
              <span>Format: PNG, JPG, or WEBP</span>
            </div>
            <div class="help-item">
              <q-icon name="check" color="positive" size="16px" />
              <span>Size: Maximum 2MB</span>
            </div>
            <div class="help-item">
              <q-icon name="check" color="positive" size="16px" />
              <span>Dimensions: 256×256px recommended</span>
            </div>
            <div class="help-item">
              <q-icon name="check" color="positive" size="16px" />
              <span>Background: Transparent preferred</span>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Got it" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMerchantsStore } from '../../store/merchants'
import { pinia } from '../../store/pinia'

const $q = useQuasar()
const store = useMerchantsStore(pinia)

// Reactive data
const step = ref(1)
const submitting = ref(false)
const uploadProgress = ref(0)
const logoFile = ref(null)
const previewLogo = ref(null)
const showLogoHelp = ref(false)

const payoutOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

const form = ref({
  business_name: '',
  email: '',
  website: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  payout_preferences: []
})

const placeholderLogo = 'https://placehold.co/120x120/121018/bdf000?text=LOGO'

// Computed properties
const statusText = computed(() => {
  const status = (store.status || 'pending').toLowerCase()
  const statusMap = {
    verified: 'Verified',
    rejected: 'Rejected',
    pending: 'Pending Review'
  }
  return statusMap[status] || 'Pending Review'
})

const statusColor = computed(() => {
  const status = (store.status || 'pending').toLowerCase()
  const colorMap = {
    verified: 'positive',
    rejected: 'negative',
    pending: 'warning'
  }
  return colorMap[status] || 'warning'
})

// Methods
const isStepValid = (stepNumber) => {
  switch (stepNumber) {
    case 1:
      return form.value.business_name && 
             form.value.email && 
             /.+@.+\..+/.test(form.value.email)
    case 2:
      return !!logoFile.value
    case 3:
      return form.value.bank_account_name && 
             form.value.bank_account_number && 
             form.value.bank_ifsc_swift &&
             form.value.payout_preferences.length > 0
    case 4:
      return isStepValid(1) && isStepValid(2) && isStepValid(3)
    default:
      return false
  }
}

const validateStep = (stepNumber) => {
  return isStepValid(stepNumber)
}

const onLogoSelected = (file) => {
  if (!file) {
    previewLogo.value = null
    return
  }
  
  // Check file size
  if (file.size > 2 * 1024 * 1024) {
    $q.notify({ 
      type: 'warning', 
      message: 'File size must be less than 2MB',
      position: 'top'
    })
    logoFile.value = null
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => { previewLogo.value = e.target.result }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  logoFile.value = null
  previewLogo.value = null
}

const onReject = (rejectedEntries) => {
  const reason = rejectedEntries[0]?.failedPropValidation || 'Invalid file'
  $q.notify({ 
    type: 'negative', 
    message: `File rejected: ${reason}`,
    position: 'top'
  })
}

const prev = () => { 
  if (step.value > 1) step.value -= 1 
}

const next = async () => {
  if (!isStepValid(step.value)) {
    $q.notify({
      type: 'warning',
      message: 'Please complete all required fields',
      position: 'top'
    })
    return
  }

  if (step.value < 4) {
    step.value += 1
    return
  }

  // Submit form
  try {
    submitting.value = true
    const fd = new FormData()
    
    Object.entries(form.value).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach(val => fd.append(`${k}[]`, val.value || val))
      } else if (v !== undefined && v !== null) {
        fd.append(k, v)
      }
    })
    
    if (logoFile.value) {
      fd.append('logo', logoFile.value)
    }

    await store.register(fd, (e) => {
      if (!e?.total) return
      uploadProgress.value = Math.round((e.loaded * 100) / e.total)
    })

    $q.notify({ 
      type: 'positive', 
      message: 'Registration submitted for approval!',
      position: 'bottom-right',
      icon: 'check_circle',
      timeout: 3000
    })
    
  } catch (err) {
    console.error('Registration error:', err)
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Registration failed. Please try again.',
      position: 'bottom-right'
    })
  } finally {
    submitting.value = false
    uploadProgress.value = 0
  }
}

// Watch for step changes
watch(step, (newStep) => {
  // Reset upload progress when leaving step 2
  if (newStep !== 2) {
    uploadProgress.value = 0
  }
})
</script>

<style scoped>
.merchant-registration-stepper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.registration-stepper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.step-content {
  padding: 24px 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.step-icon {
  color: #667eea;
}

.step-text {
  flex: 1;
}

.step-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.step-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
}

.modern-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  border-color: #667eea;
}

.modern-input :deep(.q-field__control:focus-within) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.logo-preview-container {
  position: relative;
  display: inline-block;
}

.logo-preview {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.logo-preview:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f7fafc;
  color: #cbd5e0;
}

.logo-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: all 0.3s ease;
}

.logo-preview-container:hover .logo-overlay {
  opacity: 1;
}

.remove-logo-btn {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.file-input :deep(.q-field__control) {
  border-radius: 12px;
}

.progress-bar {
  border-radius: 6px;
  overflow: hidden;
}

.progress-text {
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.file-hint {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 8px;
  padding-left: 8px;
}

.summary-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.summary-title {
  color: #2d3748;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 2px;
}

.summary-value {
  font-size: 0.95rem;
  color: #2d3748;
  font-weight: 500;
}

.status-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-chip {
  align-self: flex-start;
}

.status-description {
  font-size: 0.9rem;
  color: #718096;
}

.stepper-navigation {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.navigation-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  border: 2px solid #e2e8f0;
  color: #4a5568;
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.step-indicator {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.help-dialog {
  border-radius: 16px;
  max-width: 400px;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2d3748;
}

/* Animation Classes */
.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .registration-stepper {
    padding: 24px;
    border-radius: 16px;
  }
  
  .step-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .step-title {
    font-size: 1.2rem;
  }
  
  .step-subtitle {
    font-size: 0.9rem;
  }
  
  .navigation-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-primary,
  .btn-outline {
    width: 100%;
  }
  
  .step-indicator {
    order: -1;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .registration-stepper {
    padding: 20px;
  }
  
  .step-content {
    padding: 16px 0;
  }
  
  .step-title {
    font-size: 1.1rem;
  }
  
  .logo-preview {
    width: 64px;
    height: 64px;
  }
  
  .summary-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .modern-input :deep(.q-field__control),
  .btn-primary,
  .btn-outline,
  .logo-preview,
  .logo-overlay {
    animation: none;
    transition: none;
  }
  
  .animate-fade-in {
    opacity: 1;
    transform: none;
  }
}

/* Enhanced focus states */
.btn-primary:focus-visible,
.btn-outline:focus-visible,
.modern-input:focus-within {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
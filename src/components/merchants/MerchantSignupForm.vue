<template>
  <q-form @submit.prevent="submit" class="merchant-registration-form">
    <q-stepper 
      v-model="step" 
      header-nav 
      color="primary" 
      animated
      class="registration-stepper"
      :class="`step-${step}`"
    >
      <!-- Step 1: Business Details -->
      <q-step 
        :name="1" 
        title="Business Details" 
        icon="store" 
        :done="step > 1"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="store" size="32px" color="primary" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Business Information</h3>
            <p class="step-subtitle">Tell us about your business</p>
          </div>
        </div>

        <div class="form-fields">
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

          <q-input 
            v-model="form.email" 
            label="Business Email *" 
            type="email" 
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
      </q-step>

      <!-- Step 2: Branding -->
      <q-step 
        :name="2" 
        title="Branding" 
        icon="image" 
        :done="step > 2"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="image" size="32px" color="primary" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Brand Identity</h3>
            <p class="step-subtitle">Upload your business logo</p>
          </div>
        </div>

        <div class="form-fields">
          <div class="file-upload-section">
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

            <!-- Logo preview -->
            <div v-if="logoPreview" class="logo-preview">
              <q-img :src="logoPreview" class="preview-image" />
              <q-btn 
                round 
                dense 
                flat 
                icon="close" 
                color="negative" 
                class="remove-logo-btn"
                @click="removeLogo"
              />
            </div>

            <div class="file-hint">
              Recommended: 256×256px, PNG or JPG, max 2MB
            </div>

            <q-linear-progress 
              v-if="uploadProgress > 0" 
              stripe 
              rounded 
              size="12px" 
              :value="uploadProgress / 100"
              color="primary" 
              class="q-mt-md progress-bar"
            >
              <div class="absolute-full flex flex-center">
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
            </q-linear-progress>
          </div>
        </div>
      </q-step>

      <!-- Step 3: Bank Details -->
      <q-step 
        :name="3" 
        title="Bank Details" 
        icon="account_balance" 
        :done="step > 3"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="account_balance" size="32px" color="primary" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Banking Information</h3>
            <p class="step-subtitle">Where should we send your payments?</p>
          </div>
        </div>

        <div class="form-fields">
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
      </q-step>

      <!-- Step 4: Security -->
      <q-step 
        :name="4" 
        title="Security" 
        icon="lock"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="lock" size="32px" color="primary" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Account Security</h3>
            <p class="step-subtitle">Create a secure password</p>
          </div>
        </div>

        <div class="form-fields">
          <q-input 
            v-model="form.password" 
            type="password" 
            label="Password *" 
            outlined 
            dense 
            required 
            class="modern-input"
            :rules="[
              val => !!val || 'Password is required',
              val => val.length >= 8 || 'Minimum 8 characters'
            ]"
            @blur="validateStep(4)"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <q-input 
            v-model="form.password_confirmation" 
            type="password" 
            label="Confirm Password *" 
            outlined 
            dense 
            required 
            class="modern-input"
            :rules="[
              val => !!val || 'Please confirm password',
              val => val === form.password || 'Passwords do not match'
            ]"
            @blur="validateStep(4)"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <div class="password-strength">
            <div class="strength-label">Password Strength</div>
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrengthClass"
                :style="{width: passwordStrength + '%'}"
              ></div>
            </div>
            <div class="strength-text">{{ passwordStrengthText }}</div>
          </div>
        </div>
      </q-step>

      <!-- Navigation -->
      <template #navigation>
        <q-stepper-navigation class="stepper-navigation">
          <div class="navigation-content">
            <q-btn 
              @click="next" 
              :label="step < 4 ? 'Continue' : 'Complete Registration'" 
              :loading="submitting" 
              class="btn-primary"
              :disable="!isStepValid(step)"
            >
              <template v-slot:loading>
                <q-spinner-dots />
                Processing...
              </template>
            </q-btn>
            
            <q-btn 
              v-if="step > 1" 
              flat 
              @click="prev" 
              label="Back" 
              class="btn-outline q-ml-sm" 
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

// Reactive data
const step = ref(1)
const submitting = ref(false)
const uploadProgress = ref(0)
const logoFile = ref(null)
const logoPreview = ref(null)
const showLogoHelp = ref(false)

const form = ref({
  business_name: '',
  email: '',
  website: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  payout_preferences: [],
  password: '',
  password_confirmation: ''
})

const payoutOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

const store = useMerchantsStore(pinia)

// Computed properties
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  if (/[^A-Za-z0-9]/.test(password)) strength += 25
  
  return Math.min(strength, 100)
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value < 25) return 'strength-weak'
  if (passwordStrength.value < 50) return 'strength-fair'
  if (passwordStrength.value < 75) return 'strength-good'
  return 'strength-strong'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 25) return 'Weak'
  if (passwordStrength.value < 50) return 'Fair'
  if (passwordStrength.value < 75) return 'Good'
  return 'Strong'
})

// Methods
const isStepValid = (stepNumber) => {
  switch (stepNumber) {
    case 1:
      return form.value.business_name && form.value.email && /.+@.+\..+/.test(form.value.email)
    case 2:
      return !!logoFile.value
    case 3:
      return form.value.bank_account_name && 
             form.value.bank_account_number && 
             form.value.bank_ifsc_swift &&
             form.value.payout_preferences.length > 0
    case 4:
      return form.value.password && 
             form.value.password_confirmation &&
             form.value.password === form.value.password_confirmation &&
             form.value.password.length >= 8
    default:
      return false
  }
}

const validateStep = (stepNumber) => {
  // Trigger validation for the current step
  return isStepValid(stepNumber)
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
  } else {
    await submit()
  }
}

const prev = () => { 
  if (step.value > 1) step.value -= 1 
}

const onLogoSelected = (file) => {
  if (!file) {
    logoPreview.value = null
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = null
}

const onReject = (rejectedEntries) => {
  const reason = rejectedEntries[0]?.failedPropValidation || 'Invalid file'
  $q.notify({
    type: 'negative',
    message: `File rejected: ${reason}`,
    position: 'top'
  })
}

const submit = async () => {
  if (!isStepValid(4)) {
    $q.notify({
      type: 'warning',
      message: 'Please complete all required fields',
      position: 'top'
    })
    return
  }

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

// Watch for step changes to trigger animations
watch(step, (newStep) => {
  // Reset upload progress when leaving step 2
  if (newStep !== 2) {
    uploadProgress.value = 0
  }
})
</script>

<style scoped>
.merchant-registration-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.registration-stepper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
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
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.step-text {
  flex: 1;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.step-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.file-upload-section {
  margin-bottom: 16px;
}

.file-input :deep(.q-field__control) {
  border-radius: 12px;
}

.logo-preview {
  position: relative;
  margin-top: 16px;
  display: inline-block;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.remove-logo-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.file-hint {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 8px;
  padding-left: 8px;
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

.password-strength {
  margin-top: 16px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.strength-label {
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 8px;
  font-weight: 600;
}

.strength-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.strength-weak {
  background: #e53e3e;
  width: 25% !important;
}

.strength-fair {
  background: #ed8936;
  width: 50% !important;
}

.strength-good {
  background: #38a169;
  width: 75% !important;
}

.strength-strong {
  background: #38a169;
  width: 100% !important;
}

.strength-text {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.strength-weak + .strength-text { color: #e53e3e; }
.strength-fair + .strength-text { color: #ed8936; }
.strength-good + .strength-text { color: #38a169; }
.strength-strong + .strength-text { color: #38a169; }

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
  .merchant-registration-form {
    padding: 16px;
  }
  
  .registration-stepper {
    padding: 20px;
    border-radius: 16px;
  }
  
  .step-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .step-icon {
    width: 50px;
    height: 50px;
  }
  
  .step-title {
    font-size: 1.3rem;
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
    padding: 16px;
  }
  
  .step-content {
    padding: 16px 0;
  }
  
  .step-title {
    font-size: 1.2rem;
  }
  
  .step-subtitle {
    font-size: 0.9rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .modern-input :deep(.q-field__control),
  .btn-primary,
  .btn-outline,
  .strength-fill {
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
<template>
  <q-page class="flex flex-center q-pa-md merchant-profile-page">
    <!-- Background effects -->
    <div class="background-effects">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <q-card class="merchant-profile-card animate-fade-in">
      <!-- Header -->
      <q-card-section class="text-center card-header">
        <div class="header-content">
          <q-icon name="store" size="48px" color="primary" class="header-icon" />
          <div class="text-h5 text-primary q-mb-xs header-title">Merchant Profile</div>
          <div class="text-subtitle2 text-grey header-subtitle">
            Complete your business and banking details to start accepting payments
          </div>
        </div>
      </q-card-section>

      <!-- Progress indicator -->
      <div class="progress-indicator">
        <div class="progress-bar">
          <div class="progress-fill" :style="{width: `${formProgress}%`}"></div>
        </div>
        <div class="progress-text">Complete: {{ Math.round(formProgress) }}%</div>
      </div>

      <!-- Form -->
      <q-form @submit.prevent="submitForm" class="q-gutter-lg form-content">
        <!-- Business Name -->
        <q-input
          filled
          v-model="businessName"
          label="Business Name *"
          dense
          class="modern-input"
          :rules="[val => !!val || 'Business name is required']"
          @blur="updateProgress"
        >
          <template v-slot:prepend>
            <q-icon name="business" color="primary" />
          </template>
        </q-input>

        <!-- Logo Upload -->
        <div class="file-upload-section">
          <q-file
            filled
            v-model="logoFile"
            label="Upload Business Logo"
            accept=".jpg,.jpeg,.png,.webp"
            use-chips
            outlined
            dense
            counter
            clearable
            class="modern-input file-input"
            max-file-size="2097152"
            @rejected="onFileRejected"
            @update:model-value="onLogoSelected"
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
        </div>

        <!-- Banking Information Section -->
        <div class="section-divider">
          <q-icon name="account_balance" size="20px" color="primary" />
          <span class="section-title">Banking Information</span>
        </div>

        <!-- Bank Account Name -->
        <q-input
          filled
          v-model="bankAccountName"
          label="Bank Account Name *"
          dense
          class="modern-input"
          :rules="[val => !!val || 'Account name is required']"
          @blur="updateProgress"
        >
          <template v-slot:prepend>
            <q-icon name="person" color="primary" />
          </template>
        </q-input>

        <!-- Bank Account Number -->
        <q-input
          filled
          v-model="bankAccountNumber"
          label="Bank Account Number *"
          dense
          class="modern-input"
          :rules="[val => !!val || 'Account number is required', validateAccountNumber]"
          mask="####################"
          @blur="updateProgress"
        >
          <template v-slot:prepend>
            <q-icon name="credit_card" color="primary" />
          </template>
        </q-input>

        <!-- Bank IFSC/SWIFT -->
        <q-input
          filled
          v-model="bankIfscSwift"
          label="Bank IFSC / SWIFT Code *"
          dense
          class="modern-input"
          :rules="[val => !!val || 'IFSC/SWIFT code is required']"
          @blur="updateProgress"
        >
          <template v-slot:prepend>
            <q-icon name="code" color="primary" />
          </template>
        </q-input>

        <!-- Payout Preferences -->
        <div class="section-divider">
          <q-icon name="payments" size="20px" color="primary" />
          <span class="section-title">Payout Settings</span>
        </div>

        <q-select
          filled
          v-model="payoutFrequency"
          :options="frequencyOptions"
          label="Payout Frequency *"
          dense
          class="modern-input"
          @update:model-value="updateProgress"
        >
          <template v-slot:prepend>
            <q-icon name="schedule" color="primary" />
          </template>
        </q-select>

        <q-select
          filled
          v-model="payoutMethod"
          :options="methodOptions"
          label="Payout Method *"
          dense
          class="modern-input"
          @update:model-value="updateProgress"
        >
          <template v-slot:prepend>
            <q-icon name="account_balance_wallet" color="primary" />
          </template>
        </q-select>

        <!-- Status Display -->
        <div class="status-display">
          <q-icon 
            :name="statusIcon" 
            :color="statusColor" 
            size="24px" 
            class="status-icon"
          />
          <div class="status-content">
            <div class="status-label">Account Status</div>
            <div :class="['status-value', `status-${status}`]">
              {{ statusDisplay }}
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="form-actions">
          <q-btn
            label="Cancel"
            flat
            color="grey"
            class="action-btn"
            @click="cancelForm"
          />
          <q-btn
            label="Save Profile"
            type="submit"
            color="primary"
            unelevated
            class="action-btn btn-primary"
            :loading="submitting"
            :disable="!isFormValid"
          >
            <template v-slot:loading>
              <q-spinner-dots />
              Saving...
            </template>
          </q-btn>
        </div>
      </q-form>
    </q-card>

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
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive data
const businessName = ref('')
const logoFile = ref(null)
const logoPreview = ref(null)
const bankAccountName = ref('')
const bankAccountNumber = ref('')
const bankIfscSwift = ref('')
const payoutFrequency = ref('weekly')
const payoutMethod = ref('bank_transfer')
const status = ref('pending')
const submitting = ref(false)
const showLogoHelp = ref(false)
const formProgress = ref(0)

// Options
const frequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

const methodOptions = [
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Digital Wallet', value: 'digital_wallet' },
  { label: 'Check', value: 'check' }
]

// Computed properties
const statusDisplay = computed(() => {
  const statusMap = {
    pending: 'Pending Review',
    verified: 'Verified',
    rejected: 'Rejected',
    suspended: 'Suspended'
  }
  return statusMap[status.value] || 'Pending'
})

const statusIcon = computed(() => {
  const iconMap = {
    pending: 'schedule',
    verified: 'verified',
    rejected: 'error',
    suspended: 'pause'
  }
  return iconMap[status.value] || 'schedule'
})

const statusColor = computed(() => {
  const colorMap = {
    pending: 'orange',
    verified: 'positive',
    rejected: 'negative',
    suspended: 'grey'
  }
  return colorMap[status.value] || 'orange'
})

const isFormValid = computed(() => {
  return businessName.value && 
         bankAccountName.value && 
         bankAccountNumber.value && 
         bankIfscSwift.value &&
         formProgress.value >= 80
})

// Methods
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
  updateProgress()
}

const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = null
  updateProgress()
}

const onFileRejected = (rejectedEntries) => {
  const reason = rejectedEntries[0]?.failedPropValidation || 'Invalid file'
  $q.notify({
    type: 'negative',
    message: `File rejected: ${reason}`,
    position: 'top'
  })
}

const validateAccountNumber = (val) => {
  if (!val) return true
  return /^\d{8,20}$/.test(val) || 'Account number must be 8-20 digits'
}

const updateProgress = () => {
  let progress = 0
  const fields = [
    businessName.value,
    bankAccountName.value,
    bankAccountNumber.value,
    bankIfscSwift.value,
    payoutFrequency.value,
    payoutMethod.value
  ]
  
  const completed = fields.filter(field => field && field.toString().length > 0).length
  progress = (completed / fields.length) * 100
  
  // Add bonus for logo upload
  if (logoFile.value) {
    progress = Math.min(100, progress + 10)
  }
  
  formProgress.value = progress
}

const submitForm = async () => {
  if (!isFormValid.value) {
    $q.notify({
      type: 'warning',
      message: 'Please complete all required fields',
      position: 'top'
    })
    return
  }

  submitting.value = true

  try {
    const payoutPreferences = {
      frequency: payoutFrequency.value,
      method: payoutMethod.value
    }

    const merchantData = {
      business_name: businessName.value,
      logo: logoFile.value,
      bank_account_name: bankAccountName.value,
      bank_account_number: bankAccountNumber.value,
      bank_ifsc_swift: bankIfscSwift.value,
      payout_preferences: payoutPreferences,
      status: status.value
    }

    console.log('Merchant Data Submitted:', merchantData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    $q.notify({
      type: 'positive',
      message: 'Profile saved successfully!',
      position: 'bottom-right',
      icon: 'check_circle'
    })
    
  } catch (error) {
    console.error('Error saving profile:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save profile. Please try again.',
      position: 'bottom-right'
    })
  } finally {
    submitting.value = false
  }
}

const cancelForm = () => {
  $q.dialog({
    title: 'Discard Changes?',
    message: 'Are you sure you want to discard your changes?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    // Reset form
    businessName.value = ''
    logoFile.value = null
    logoPreview.value = null
    bankAccountName.value = ''
    bankAccountNumber.value = ''
    bankIfscSwift.value = ''
    payoutFrequency.value = 'weekly'
    payoutMethod.value = 'bank_transfer'
    formProgress.value = 0
    
    $q.notify({
      type: 'info',
      message: 'Changes discarded',
      position: 'bottom-right'
    })
  })
}

// Watch for changes to update progress
watch([businessName, bankAccountName, bankAccountNumber, bankIfscSwift, payoutFrequency, payoutMethod], updateProgress, { deep: true })
</script>

<style scoped>
.merchant-profile-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.bg-circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.5;
  }
}

.merchant-profile-card {
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 32px 32px;
}

.header-content {
  text-align: center;
}

.header-icon {
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.header-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: white !important;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 1rem;
}

.progress-indicator {
  padding: 20px 32px 0;
  background: white;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
  transition: width 0.6s ease;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.form-content {
  padding: 32px;
  background: white;
}

.modern-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  border-color: #667eea;
}

.modern-input :deep(.q-field__control:focus-within) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
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
  border: 2px solid #e0e0e0;
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
  color: #666;
  margin-top: 8px;
  padding-left: 8px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0 16px;
  padding: 12px 0;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid v-bind(statusColor);
  margin: 24px 0;
}

.status-icon {
  flex-shrink: 0;
}

.status-content {
  flex: 1;
}

.status-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.status-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.status-pending {
  color: #ff9800;
}

.status-verified {
  color: #4caf50;
}

.status-rejected {
  color: #f44336;
}

.status-suspended {
  color: #9e9e9e;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
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
  color: #333;
}

/* Responsive design */
@media (max-width: 768px) {
  .merchant-profile-card {
    margin: 16px;
    max-width: calc(100% - 32px);
  }
  
  .card-header {
    padding: 32px 24px 24px;
  }
  
  .form-content {
    padding: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }
  
  .header-subtitle {
    font-size: 0.9rem;
  }
  
  .progress-indicator {
    padding: 16px 24px 0;
  }
  
  .form-content {
    padding: 20px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .bg-circle,
  .progress-fill,
  .modern-input :deep(.q-field__control),
  .btn-primary,
  .remove-logo-btn {
    animation: none;
    transition: none;
  }
  
  .animate-fade-in {
    opacity: 1;
    transform: none;
  }
}

/* Enhanced focus states */
.action-btn:focus-visible,
.modern-input:focus-within {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
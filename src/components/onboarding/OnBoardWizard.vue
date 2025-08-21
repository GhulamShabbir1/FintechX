<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <q-stepper v-model="step" header-nav color="primary" animated flat>
      <!-- Step 1: Account Setup -->
      <q-step :name="1" title="Account" icon="person" :done="step > 1">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="account.name" label="Full Name" outlined dense required />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="account.email" type="email" label="Email" outlined dense required />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="account.password" type="password" label="Password" outlined dense required />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="account.confirmPassword" type="password" label="Confirm Password" outlined dense required />
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
            <q-input v-model="merchant.business_name" label="Business Name" outlined dense required />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="merchant.website" label="Website" outlined dense />
          </div>
        </div>

        <!-- Branding -->
        <div class="text-subtitle2 q-mt-md q-mb-sm">Branding</div>
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="72px" square>
              <img :src="logoPreview || placeholderLogo" />
            </q-avatar>
          </div>
          <div class="col">
            <q-file v-model="logoFile" label="Upload Logo" outlined dense accept="image/*" @rejected="onReject" />
            <q-linear-progress
              v-if="uploadProgress > 0"
              class="q-mt-md"
              stripe
              rounded
              size="10px"
              :value="uploadProgress / 100"
              color="green"
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
            />
          </div>
        </div>
      </q-step>

      <!-- Step 3: Review (only if merchant) -->
      <q-step v-if="isMerchant" :name="3" title="Review" icon="check_circle">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm">Summary</div>
          <div class="text-caption">Name: {{ account.name }}</div>
          <div class="text-caption">Email: {{ account.email }}</div>
          <div class="text-caption">Role: {{ account.role }}</div>
          <q-separator class="q-my-md" />
          <div class="text-caption">Business: {{ merchant.business_name || '—' }}</div>
          <div class="text-caption">Website: {{ merchant.website || '—' }}</div>
          <div class="text-caption">Payouts: {{ (merchant.payout_preferences || []).join(', ') || '—' }}</div>
        </q-card>
        <div class="row items-center q-col-gutter-md q-mt-md">
          <div class="col-auto">
            <q-avatar size="64px" square>
              <img :src="logoPreview || placeholderLogo" />
            </q-avatar>
          </div>
          <div class="col">
            <q-chip color="orange" text-color="white" icon="hourglass_empty" square>Pending verification</q-chip>
            <div class="text-caption">After submission your account goes for verification.</div>
          </div>
        </div>
      </q-step>

      <template #navigation>
        <q-stepper-navigation>
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

const onReject = () => Notify.create({ type: 'warning', message: 'Only image files allowed' })
const prev = () => { if (step.value > 1) step.value -= 1 }

const handleSubmit = async () => {
  // Validate step transitions
  if (step.value === 1) {
    if (!account.value.name || !account.value.email || !account.value.password || !account.value.confirmPassword) {
      return Notify.create({ type: 'warning', message: 'Please fill in all fields' })
    }
    if (account.value.password !== account.value.confirmPassword) {
      return Notify.create({ type: 'negative', message: 'Passwords do not match' })
    }
    if (isMerchant.value) {
      step.value = 2
      return
    }
  }
  if (step.value === 2 && isMerchant.value) {
    // quick check before review
    if (!merchant.value.business_name) {
      return Notify.create({ type: 'warning', message: 'Please provide business name' })
    }
    step.value = 3
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

    Notify.create({ type: 'positive', message: 'Account created. Please log in.' })
    window.location.href = '/login'
  } catch (e) {
    console.error(e)
    Notify.create({ type: 'negative', message: 'Registration failed. Please try again.' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.btn-outline-light { border: 1px solid #fff; color: #fff; }
.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 0.5);
}
</style>
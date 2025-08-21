<template>
  <q-form @submit.prevent="next" class="q-gutter-md">
    <q-stepper v-model="step" header-nav color="primary" animated flat>
      <!-- 1. Business Details -->
      <q-step :name="1" title="Business Details" icon="store" :done="step > 1">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.business_name" label="Business Name" outlined dense required />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.email" type="email" label="Business Email" outlined dense required />
          </div>
          <div class="col-12">
            <q-input v-model="form.website" label="Website" outlined dense />
          </div>
        </div>
      </q-step>

      <!-- 2. Branding -->
      <q-step :name="2" title="Branding" icon="image" :done="step > 2">
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="72px" square>
              <img :src="previewLogo || placeholderLogo" />
            </q-avatar>
          </div>
          <div class="col">
            <q-file v-model="logoFile" label="Upload Logo" outlined dense accept="image/*" @rejected="onReject" />
            <q-linear-progress v-if="uploadProgress > 0" class="q-mt-md" stripe rounded size="10px" :value="uploadProgress / 100" color="green" />
          </div>
        </div>
      </q-step>

      <!-- 3. Bank Details -->
      <q-step :name="3" title="Bank Details" icon="account_balance" :done="step > 3">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.bank_account_name" label="Account Holder Name" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.bank_account_number" label="Account Number" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.bank_ifsc_swift" label="IFSC / SWIFT" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-select v-model="form.payout_preferences" :options="payoutOptions" label="Payout Preferences" multiple outlined dense />
          </div>
        </div>
      </q-step>

      <!-- 4. Review & Submit -->
      <q-step :name="4" title="Review & Submit" icon="check_circle">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm">Summary</div>
          <div class="text-caption">Business: {{ form.business_name || '—' }}</div>
          <div class="text-caption">Email: {{ form.email || '—' }}</div>
          <div class="text-caption">Website: {{ form.website || '—' }}</div>
          <div class="text-caption">Payouts: {{ (form.payout_preferences || []).join(', ') || '—' }}</div>
        </q-card>
        <div class="q-mt-md row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="64px" square>
              <img :src="previewLogo || placeholderLogo" />
            </q-avatar>
          </div>
          <div class="col">
            <q-chip :color="statusColor" text-color="white" icon="hourglass_empty" square>
              {{ statusText }}
            </q-chip>
            <div class="text-caption">After submission your account goes for verification.</div>
          </div>
        </div>
      </q-step>

      <template #navigation>
        <q-stepper-navigation>
          <q-btn :label="step < 4 ? 'Next' : 'Submit'" class="btn-gradient" :loading="submitting" @click="next" />
          <q-btn v-if="step > 1" flat class="q-ml-sm btn-outline-light" label="Back" @click="prev" />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Notify } from 'quasar'
import { useMerchantStore } from '../../store/merchant'
import { pinia } from '../../store/pinia'

const store = useMerchantStore(pinia)

const step = ref(1)
const submitting = ref(false)
const uploadProgress = ref(0)
const payoutOptions = ['daily', 'weekly', 'monthly']

const form = ref({
  business_name: '',
  email: '',
  website: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  payout_preferences: []
})

const logoFile = ref(null)
const previewLogo = ref('')
const placeholderLogo = 'https://placehold.co/120x120/121018/bdf000?text=LOGO'

watch(logoFile, (file) => {
  if (!file) { previewLogo.value = ''; return }
  const reader = new FileReader()
  reader.onload = (e) => { previewLogo.value = e.target?.result || '' }
  reader.readAsDataURL(file)
})

const statusText = computed(() => store.status || 'Pending')
const statusColor = computed(() => {
  const s = (store.status || 'pending').toLowerCase()
  if (s === 'verified') return 'green'
  if (s === 'rejected') return 'red'
  return 'orange'
})

const onReject = () => Notify.create({ type: 'warning', message: 'Only image files allowed' })

const prev = () => { if (step.value > 1) step.value -= 1 }

const next = async () => {
  if (step.value < 4) {
    step.value += 1
    return
  }
  try {
    submitting.value = true
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(val => fd.append(`${k}[]`, val))
      else if (v !== undefined && v !== null) fd.append(k, v)
    })
    if (logoFile.value) fd.append('logo', logoFile.value)

    await store.register(fd, (e) => {
      if (!e?.total) return
      uploadProgress.value = Math.round((e.loaded * 100) / e.total)
    })

    Notify.create({ type: 'positive', message: 'Registration submitted for approval' })
  } catch (err) {
    console.error(err)
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
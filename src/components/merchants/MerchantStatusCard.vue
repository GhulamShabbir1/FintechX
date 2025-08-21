<template>
  <q-card class="q-pa-md lime-glow">
    <div class="row items-center q-col-gutter-md">
      <div class="col-auto">
        <q-icon :name="statusIcon" :color="statusColor" size="lg" />
      </div>
      <div class="col">
        <div class="text-subtitle1">Status: {{ status }}</div>
        <div class="text-caption">Your onboarding and verification</div>
      </div>
      <div class="col-auto">
        <q-chip :color="statusColor" text-color="white" square>{{ status }}</q-chip>
      </div>
    </div>
    <q-separator class="q-my-md" />
    <div>
      <q-linear-progress :value="progressValue" color="green" rounded size="12px" stripe />
      <div class="text-caption q-mt-xs">Onboarding progress</div>
      <div class="row q-col-gutter-sm q-mt-sm text-caption">
        <div class="col">Business</div>
        <div class="col">Branding</div>
        <div class="col">Bank</div>
        <div class="col">Verification</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'Pending' },
  profile: { type: Object, default: () => ({}) }
})

const statusColor = computed(() => {
  const s = (props.status || '').toLowerCase()
  if (s === 'verified') return 'green'
  if (s === 'rejected') return 'red'
  return 'orange'
})
const statusIcon = computed(() => {
  const s = (props.status || '').toLowerCase()
  if (s === 'verified') return 'verified'
  if (s === 'rejected') return 'cancel'
  return 'hourglass_empty'
})
const progressValue = computed(() => {
  const p = props.profile || {}
  let c = 0
  if (p.business_name && p.email) c += 1
  if (p.logo_url) c += 1
  if (p.bank_account_number && p.bank_ifsc_swift) c += 1
  if (sVerified(props.status)) c += 1
  return c / 4
})
const sVerified = (s) => (s || '').toLowerCase() === 'verified'
</script>

<style scoped>
.lime-glow {
  border-radius: 14px;
  box-shadow:
    0 10px 28px rgba(0,0,0,0.35),
    0 0 0 1px rgba(189,240,0,0.28),
    0 0 24px rgba(189,240,0,0.18);
}
</style>
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-toolbar-title>FinteckX</q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="account_circle" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div
        v-if="showApprovalPending"
        class="q-pa-md q-mb-md bg-warning text-dark rounded-borders"
      >
        <div class="row items-center">
          <q-icon name="hourglass_empty" class="q-mr-sm" />
          <div class="text-body2">
            Your merchant account is awaiting admin approval. Some features may be limited.
          </div>
        </div>
      </div>

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../store/auth'
import { pinia } from '../store/pinia'

const auth = useAuthStore(pinia)

// Show banner only for merchants whose approval is not complete
const showApprovalPending = computed(() => {
  const user = auth.user
  const role = String(user?.role || '').toLowerCase()
  if (role !== 'merchant') return false

  // Prefer boolean 'approved' if available, otherwise fall back to status !== 'approved'
  if (user && 'approved' in user) return user.approved !== true
  if (user && 'status' in user) return String(user.status).toLowerCase() !== 'approved'

  // Default to showing the banner if unknown
  return true
})
</script>

<style scoped>
.bg-dark {
  background: #0e0f13;
}
</style>
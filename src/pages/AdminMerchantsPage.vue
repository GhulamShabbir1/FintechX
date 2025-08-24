<template>
  <q-layout view="lHh Lpr lFf">
    <AdminHeader />
    <q-page-container>
      <q-page class="admin-merchants-page">
        <div class="q-pa-md">
          <q-breadcrumbs class="text-grey-6 q-mb-md">
            <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
            <q-breadcrumbs-el icon="store" label="Merchants" />
          </q-breadcrumbs>
          <MerchantManagement />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import AdminHeader from '../components/navigation/AdminHeader.vue'
import MerchantManagement from '../components/admin/MerchantManagement.vue'
</script>

<style scoped>
.admin-merchants-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.text-grey-6 { color: #999; }
</style>
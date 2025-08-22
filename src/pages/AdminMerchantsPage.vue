<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Merchant Header -->
    <MerchantHeader />
    
    <!-- Page Content -->
    <q-page-container>
      <q-page class="merchant-dashboard-page">
        <!-- Breadcrumb -->
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="dashboard" label="Dashboard" />
            <q-breadcrumbs-el icon="home" label="Overview" />
          </q-breadcrumbs>
        </div>

        <!-- Main Dashboard Content -->
        <MerchantDashboard />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import MerchantHeader from '../components/navigation/MerchantHeader.vue'
import MerchantDashboard from '../components/merchants/MerchantDashboard.vue'
</script>

<style scoped>
.merchant-dashboard-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.breadcrumb-section {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.text-grey-6 {
  color: #999;
}
</style>
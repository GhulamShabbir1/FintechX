<template>
  <q-layout view="lHh Lpr lFf">
    <MerchantHeader />
    <q-page-container>
      <q-page class="q-pa-lg">
        <MerchantDashboard />
      </q-page>
    </q-page-container>
  </q-layout>
  
</template>

<script setup>
import MerchantHeader from '../components/navigation/MerchantHeader.vue'
import MerchantDashboard from '../components/merchants/MerchantDashboard.vue'
</script>

<style scoped></style>
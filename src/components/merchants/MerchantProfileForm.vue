<template>
  <q-page class="flex flex-center bg-grey-2 q-pa-md">
    <q-card class="q-pa-lg shadow-4 rounded-borders" style="width: 100%; max-width: 650px;">
      <!-- Header -->
      <q-card-section class="text-center">
        <div class="text-h5 text-primary q-mb-xs">Merchant Profile</div>
        <div class="text-subtitle2 text-grey">
          Fill out your business and banking details
        </div>
      </q-card-section>

      <!-- Form -->
      <q-form @submit.prevent="submitForm" class="q-gutter-md">
        <!-- Business Name -->
        <q-input
          filled
          v-model="businessName"
          label="Business Name"
          dense
        />

        <!-- Logo Upload -->
        <q-file
          filled
          v-model="logoFile"
          label="Upload Logo"
          accept="image/*"
          use-chips
          outlined
          dense
          counter
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="image" />
          </template>
        </q-file>

        <!-- Bank Account Name -->
        <q-input
          filled
          v-model="bankAccountName"
          label="Bank Account Name"
          dense
        />

        <!-- Bank Account Number -->
        <q-input
          filled
          v-model="bankAccountNumber"
          label="Bank Account Number"
          dense
        />

        <!-- Bank IFSC/SWIFT -->
        <q-input
          filled
          v-model="bankIfscSwift"
          label="Bank IFSC / SWIFT Code"
          dense
        />

        <!-- Payout Preferences -->
        <q-input
          filled
          v-model="payoutPreferences"
          label="Payout Preferences (JSON format)"
          type="textarea"
          autogrow
          hint='e.g. {"frequency":"weekly","method":"bank"}'
          dense
        />

        <!-- Status -->
        <q-input
          filled
          v-model="status"
          label="Status"
          readonly
          dense
        />

        <!-- Buttons -->
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn
            label="Save Profile"
            type="submit"
            color="primary"
            unelevated
            class="q-px-md"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const businessName = ref('')
const logoFile = ref(null)
const bankAccountName = ref('')
const bankAccountNumber = ref('')
const bankIfscSwift = ref('')
const payoutPreferences = ref('')
const status = ref('pending') // default as per schema

const submitForm = () => {
  let payoutJson = null
  if (payoutPreferences.value) {
    try {
      payoutJson = JSON.parse(payoutPreferences.value)
    } catch {
      alert('Payout preferences must be valid JSON!')
      return
    }
  }

  const merchantData = {
    business_name: businessName.value,
    logo: logoFile.value,
    bank_account_name: bankAccountName.value,
    bank_account_number: bankAccountNumber.value,
    bank_ifsc_swift: bankIfscSwift.value,
    payout_preferences: payoutJson,
    status: status.value
  }

  console.log('Merchant Data Submitted:', merchantData)
  alert('Merchant profile saved (check console for data).')
}
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}
.q-input, .q-file {
  font-size: 14px;
}
</style>

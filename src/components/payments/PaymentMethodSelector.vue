<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Customer Payments</div>

    <q-card flat bordered class="q-pa-md">
      <q-table
        :rows="payments"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 5 }"
      >
        <!-- Status Badge -->
        <template v-slot:body-cell-status="props">
          <q-td>
            <q-badge
              :color="props.row.status === 'Completed' ? 'green' : props.row.status === 'Pending' ? 'orange' : 'red'"
              class="q-pa-xs"
            >
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <!-- Amount with currency -->
        <template v-slot:body-cell-amount="props">
          <q-td>
            <span class="text-weight-bold text-primary">
              ${{ props.row.amount.toFixed(2) }}
            </span>
          </q-td>
        </template>

        <!-- Actions -->
        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn
              dense
              flat
              round
              color="primary"
              icon="visibility"
              @click="viewDetails(props.row)"
            >
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Transaction Details Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Payment Details</div>
        </q-card-section>
        <q-card-section>
          <div><strong>Customer:</strong> {{ selectedPayment.customer }}</div>
          <div><strong>Email:</strong> {{ selectedPayment.email }}</div>
          <div><strong>Amount:</strong> ${{ selectedPayment.amount }}</div>
          <div><strong>Status:</strong> {{ selectedPayment.status }}</div>
          <div><strong>Date:</strong> {{ selectedPayment.date }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from "vue";

const columns = [
  { name: "customer", label: "Customer Name", field: "customer", align: "left" },
  { name: "email", label: "Email", field: "email", align: "left" },
  { name: "amount", label: "Amount", field: "amount", align: "right" },
  { name: "status", label: "Status", field: "status", align: "center" },
  { name: "date", label: "Date", field: "date", align: "left" },
  { name: "actions", label: "Actions", align: "center" },
];

const payments = ref([
  {
    id: 1,
    customer: "John Doe",
    email: "john@example.com",
    amount: 120.5,
    status: "Completed",
    date: "2025-08-20",
  },
  {
    id: 2,
    customer: "Jane Smith",
    email: "jane@example.com",
    amount: 75.0,
    status: "Pending",
    date: "2025-08-19",
  },
  {
    id: 3,
    customer: "David Brown",
    email: "david@example.com",
    amount: 200.0,
    status: "Failed",
    date: "2025-08-18",
  },
]);

const showDialog = ref(false);
const selectedPayment = ref({});

function viewDetails(payment) {
  selectedPayment.value = payment;
  showDialog.value = true;
}
</script>

<style scoped>
.text-h5 {
  font-weight: 600;
  color: #2c3e50;
}
</style>

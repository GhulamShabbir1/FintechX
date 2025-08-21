<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Transactions</div>
    <div class="text-subtitle2 text-grey-7 q-mb-lg">
      Track all transaction history in this section.
    </div>

    <q-card flat bordered class="q-pa-md">
      <q-table
        :rows="transactions"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 7 }"
      >
        <!-- Status Badge -->
        <template v-slot:body-cell-status="props">
          <q-td>
            <q-badge
              :color="props.row.status === 'Success' ? 'green' : props.row.status === 'Pending' ? 'orange' : 'red'"
              class="q-pa-xs"
            >
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <!-- Amount -->
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
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">Transaction Details</div>
        </q-card-section>
        <q-card-section>
          <div><strong>Transaction ID:</strong> {{ selectedTransaction.id }}</div>
          <div><strong>Customer:</strong> {{ selectedTransaction.customer }}</div>
          <div><strong>Email:</strong> {{ selectedTransaction.email }}</div>
          <div><strong>Amount:</strong> ${{ selectedTransaction.amount }}</div>
          <div><strong>Status:</strong> {{ selectedTransaction.status }}</div>
          <div><strong>Payment Method:</strong> {{ selectedTransaction.method }}</div>
          <div><strong>Date:</strong> {{ selectedTransaction.date }}</div>
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
  { name: "id", label: "Transaction ID", field: "id", align: "left" },
  { name: "customer", label: "Customer", field: "customer", align: "left" },
  { name: "email", label: "Email", field: "email", align: "left" },
  { name: "amount", label: "Amount", field: "amount", align: "right" },
  { name: "status", label: "Status", field: "status", align: "center" },
  { name: "method", label: "Payment Method", field: "method", align: "center" },
  { name: "date", label: "Date", field: "date", align: "left" },
  { name: "actions", label: "Actions", align: "center" },
];

const transactions = ref([
  {
    id: "TXN-1001",
    customer: "Alice Johnson",
    email: "alice@example.com",
    amount: 250.75,
    status: "Success",
    method: "Credit Card",
    date: "2025-08-19",
  },
  {
    id: "TXN-1002",
    customer: "Bob Smith",
    email: "bob@example.com",
    amount: 120.0,
    status: "Pending",
    method: "PayPal",
    date: "2025-08-18",
  },
  {
    id: "TXN-1003",
    customer: "Charlie Brown",
    email: "charlie@example.com",
    amount: 500.0,
    status: "Failed",
    method: "Bank Transfer",
    date: "2025-08-17",
  },
]);

const showDialog = ref(false);
const selectedTransaction = ref({});

function viewDetails(transaction) {
  selectedTransaction.value = transaction;
  showDialog.value = true;
}
</script>

<style scoped>
.text-h5 {
  font-weight: 600;
  color: #2c3e50;
}
</style>

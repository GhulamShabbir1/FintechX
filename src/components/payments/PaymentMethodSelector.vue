<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md page-title">Customer Payments</div>

    <q-card flat bordered class="q-pa-md stats-card">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-card class="stat-item bg-primary text-white">
            <q-card-section>
              <div class="text-h6">Total Payments</div>
              <div class="text-h4">{{ payments.length }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="stat-item bg-green text-white">
            <q-card-section>
              <div class="text-h6">Completed</div>
              <div class="text-h4">{{ completedCount }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="stat-item bg-orange text-white">
            <q-card-section>
              <div class="text-h6">Pending</div>
              <div class="text-h4">{{ pendingCount }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-table
        :rows="filteredPayments"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 10 }"
        :loading="loading"
        class="payments-table"
      >
        <!-- Header Slot for Filters -->
        <template v-slot:top>
          <div class="row items-center full-width q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="filter"
                placeholder="Search payments..."
                dense
                outlined
                clearable
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="statusFilter"
                :options="statusOptions"
                label="Filter by Status"
                outlined
                dense
                clearable
                multiple
                class="filter-select"
              />
            </div>
          </div>
        </template>

        <!-- Status Badge -->
        <template v-slot:body-cell-status="props">
          <q-td>
            <q-badge
              :color="getStatusColor(props.row.status)"
              class="status-badge q-pa-xs"
              :class="`status-${props.row.status.toLowerCase()}`"
            >
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <!-- Amount with currency -->
        <template v-slot:body-cell-amount="props">
          <q-td>
            <span class="text-weight-bold amount-value" :class="`amount-${props.row.status.toLowerCase()}`">
              ${{ props.row.amount.toFixed(2) }}
            </span>
          </q-td>
        </template>

        <!-- Date Formatting -->
        <template v-slot:body-cell-date="props">
          <q-td>
            <div class="date-display">
              {{ formatDate(props.row.date) }}
            </div>
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
              class="action-btn"
            >
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 'Pending'"
              dense
              flat
              round
              color="green"
              icon="check"
              @click="approvePayment(props.row)"
              class="action-btn"
            >
              <q-tooltip>Approve Payment</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 'Pending' || props.row.status === 'Completed'"
              dense
              flat
              round
              color="red"
              icon="block"
              @click="refundPayment(props.row)"
              class="action-btn"
            >
              <q-tooltip>Refund Payment</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Loading State -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- Transaction Details Dialog -->
    <q-dialog v-model="showDialog" position="right" class="details-dialog">
      <q-card style="min-width: 400px; max-width: 500px" class="details-card">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Payment Details</div>
        </q-card-section>
        
        <q-card-section class="q-pt-lg">
          <div class="detail-item">
            <q-icon name="person" color="primary" class="q-mr-sm" />
            <strong>Customer:</strong> {{ selectedPayment.customer }}
          </div>
          <div class="detail-item">
            <q-icon name="email" color="primary" class="q-mr-sm" />
            <strong>Email:</strong> {{ selectedPayment.email }}
          </div>
          <div class="detail-item">
            <q-icon name="attach_money" color="primary" class="q-mr-sm" />
            <strong>Amount:</strong> 
            <span class="text-weight-bold text-primary">${{ selectedPayment.amount?.toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <q-icon name="info" color="primary" class="q-mr-sm" />
            <strong>Status:</strong> 
            <q-badge :color="getStatusColor(selectedPayment.status)" class="q-ml-sm">
              {{ selectedPayment.status }}
            </q-badge>
          </div>
          <div class="detail-item">
            <q-icon name="event" color="primary" class="q-mr-sm" />
            <strong>Date:</strong> {{ formatDate(selectedPayment.date) }}
          </div>
          <div class="detail-item" v-if="selectedPayment.paymentMethod">
            <q-icon name="credit_card" color="primary" class="q-mr-sm" />
            <strong>Method:</strong> {{ selectedPayment.paymentMethod }}
          </div>
          <div class="detail-item" v-if="selectedPayment.transactionId">
            <q-icon name="receipt" color="primary" class="q-mr-sm" />
            <strong>Transaction ID:</strong> {{ selectedPayment.transactionId }}
          </div>
        </q-card-section>
        
        <q-separator />
        
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Close" color="primary" v-close-popup class="close-btn" />
          <q-btn 
            v-if="selectedPayment.status === 'Pending'" 
            label="Approve" 
            color="green" 
            @click="approvePayment(selectedPayment)" 
          />
          <q-btn 
            v-if="selectedPayment.status === 'Completed'" 
            label="Refund" 
            color="red" 
            @click="refundPayment(selectedPayment)" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from 'quasar';

const $q = useQuasar();

const columns = [
  { name: "customer", label: "Customer Name", field: "customer", align: "left", sortable: true },
  { name: "email", label: "Email", field: "email", align: "left", sortable: true },
  { name: "amount", label: "Amount", field: "amount", align: "right", sortable: true },
  { name: "status", label: "Status", field: "status", align: "center", sortable: true },
  { name: "date", label: "Date", field: "date", align: "left", sortable: true },
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
    paymentMethod: "Credit Card",
    transactionId: "TX123456789"
  },
  {
    id: 2,
    customer: "Jane Smith",
    email: "jane@example.com",
    amount: 75.0,
    status: "Pending",
    date: "2025-08-19",
    paymentMethod: "PayPal",
    transactionId: "TX987654321"
  },
  {
    id: 3,
    customer: "David Brown",
    email: "david@example.com",
    amount: 200.0,
    status: "Failed",
    date: "2025-08-18",
    paymentMethod: "Bank Transfer",
    transactionId: "TX456789123"
  },
  {
    id: 4,
    customer: "Sarah Wilson",
    email: "sarah@example.com",
    amount: 150.0,
    status: "Completed",
    date: "2025-08-17",
    paymentMethod: "Credit Card",
    transactionId: "TX789123456"
  },
  {
    id: 5,
    customer: "Mike Johnson",
    email: "mike@example.com",
    amount: 99.99,
    status: "Pending",
    date: "2025-08-16",
    paymentMethod: "Apple Pay",
    transactionId: "TX321654987"
  }
]);

const showDialog = ref(false);
const selectedPayment = ref({});
const filter = ref("");
const statusFilter = ref([]);
const loading = ref(false);
const statusOptions = ["Completed", "Pending", "Failed"];

// Computed properties
const completedCount = computed(() => 
  payments.value.filter(p => p.status === "Completed").length
);

const pendingCount = computed(() => 
  payments.value.filter(p => p.status === "Pending").length
);

const filteredPayments = computed(() => {
  let filtered = payments.value;

  // Apply search filter
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    filtered = filtered.filter(payment =>
      payment.customer.toLowerCase().includes(searchTerm) ||
      payment.email.toLowerCase().includes(searchTerm) ||
      payment.amount.toString().includes(searchTerm)
    );
  }

  // Apply status filter
  if (statusFilter.value.length > 0) {
    filtered = filtered.filter(payment =>
      statusFilter.value.includes(payment.status)
    );
  }

  return filtered;
});

// Methods
function viewDetails(payment) {
  selectedPayment.value = { ...payment };
  showDialog.value = true;
}

function getStatusColor(status) {
  const statusColors = {
    'Completed': 'green',
    'Pending': 'orange',
    'Failed': 'red'
  };
  return statusColors[status] || 'grey';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function approvePayment(payment) {
  $q.dialog({
    title: 'Confirm Approval',
    message: `Approve payment of $${payment.amount.toFixed(2)} from ${payment.customer}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    const index = payments.value.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      payments.value[index].status = 'Completed';
      $q.notify({
        type: 'positive',
        message: 'Payment approved successfully!',
        position: 'top-right'
      });
    }
  });
}

function refundPayment(payment) {
  $q.dialog({
    title: 'Confirm Refund',
    message: `Process refund of $${payment.amount.toFixed(2)} to ${payment.customer}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    const index = payments.value.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      payments.value[index].status = 'Refunded';
      $q.notify({
        type: 'info',
        message: 'Refund processed successfully!',
        position: 'top-right'
      });
    }
  });
}

// Lifecycle
onMounted(() => {
  // Add smooth scrolling to the page
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Simulate loading
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<style scoped>
.page-title {
  font-weight: 600;
  color: #2c3e50;
  animation: slideInDown 0.6s ease;
}

.stats-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stats-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-item {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.payments-table {
  border-radius: 8px;
  overflow: hidden;
}

.search-input, .filter-select {
  transition: all 0.3s ease;
}

.search-input:focus-within, .filter-select:focus-within {
  transform: translateY(-1px);
}

.status-badge {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.status-badge:hover {
  transform: scale(1.05);
}

.status-completed {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.status-pending {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.status-failed {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.amount-value {
  transition: all 0.3s ease;
}

.amount-value:hover {
  transform: scale(1.1);
}

.amount-completed {
  color: #4caf50;
}

.amount-pending {
  color: #ff9800;
}

.amount-failed {
  color: #f44336;
}

.date-display {
  font-size: 0.875rem;
  color: #666;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.2);
}

.details-dialog {
  animation: slideInRight 0.4s ease;
}

.details-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background-color: #f9f9f9;
  padding-left: 8px;
  border-radius: 4px;
}

.close-btn {
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

/* Animations */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-card {
    border-radius: 8px;
  }
  
  .stat-item {
    margin-bottom: 12px;
  }
  
  .details-card {
    min-width: 90vw !important;
    max-width: 95vw !important;
  }
  
  .action-btn {
    margin: 2px;
  }
}
</style>
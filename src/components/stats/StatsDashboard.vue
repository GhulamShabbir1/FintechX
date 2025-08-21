<template>
  <q-page class="q-pa-md">
    <!-- Page Title -->
    <div class="text-h5 q-mb-md">📊 Stats & Analytics</div>

    <!-- Summary Stats -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-subtitle1">Total Revenue</div>
            <div class="text-h6">$120,000</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-subtitle1">Total Transactions</div>
            <div class="text-h6">4,523</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="bg-accent text-white">
          <q-card-section>
            <div class="text-subtitle1">Active Customers</div>
            <div class="text-h6">1,245</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row q-col-gutter-md">
      <!-- Revenue Trend -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">Revenue Trend</div>
          </q-card-section>
          <q-card-section style="height: 300px;">
            <LineChart :data="revenueData" :options="chartOptions" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Transaction Status -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">Transaction Status</div>
          </q-card-section>
          <q-card-section style="height: 300px;">
            <BarChart :data="statusData" :options="chartOptions" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Payment Methods -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">Payment Methods</div>
          </q-card-section>
          <q-card-section style="height: 300px;">
            <PieChart :data="paymentData" :options="chartOptions" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { Line as LineChart, Bar as BarChart, Pie as PieChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler   // ✅ Add this
} from 'chart.js'

// ✅ Register Filler plugin too
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler
)

// Dummy Data for Charts
const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue ($)',
      data: [12000, 15000, 10000, 18000, 22000, 20000],
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66,165,245,0.4)',
      fill: true, // ✅ Now works fine
      tension: 0.3
    }
  ]
}

const statusData = {
  labels: ['Completed', 'Pending', 'Failed'],
  datasets: [
    {
      label: 'Transactions',
      data: [3200, 900, 423],
      backgroundColor: ['#66BB6A', '#FFA726', '#EF5350']
    }
  ]
}

const paymentData = {
  labels: ['Credit Card', 'PayPal', 'Bank Transfer'],
  datasets: [
    {
      label: 'Payment Methods',
      data: [2500, 1500, 523],
      backgroundColor: ['#42A5F5', '#AB47BC', '#FF7043']
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' }
  }
}
</script>


<style scoped>
.text-subtitle1 {
  font-weight: 600;
}
</style>

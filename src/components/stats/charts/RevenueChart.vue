<template>
  <div class="revenue-chart">
    <div class="chart-placeholder">
      <q-icon name="trending_up" size="48px" color="lime" />
      <div class="chart-text">Revenue Chart</div>
      <div class="chart-subtext">Chart.js integration needed</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.revenue-chart {
  width: 100%;
  height: 100%;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.chart-text {
  color: #ffffff;
  font-size: 1.1rem;
  margin: 16px 0 8px 0;
}

.chart-subtext {
  color: #cfcfcf;
  font-size: 0.875rem;
}
</style>
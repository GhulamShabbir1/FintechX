<template>
  <div class="kpi-cards">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3" v-for="(kpi, index) in kpis" :key="index">
        <q-card class="kpi-card" :class="`kpi-${kpi.color}`">
          <q-card-section class="kpi-content">
            <div class="kpi-header">
              <div class="kpi-icon">
                <q-icon :name="kpi.icon" size="32px" :color="kpi.color" />
              </div>
              <div class="kpi-trend" :class="kpi.trend">
                <q-icon :name="getTrendIcon(kpi.trend)" size="16px" />
                <span>{{ kpi.change }}</span>
              </div>
            </div>
            
            <div class="kpi-body">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-title">{{ kpi.title }}</div>
            </div>
            
            <div class="kpi-footer">
              <q-linear-progress 
                :value="getProgressValue(kpi)" 
                :color="kpi.color" 
                size="sm"
                class="kpi-progress"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  kpis: {
    type: Array,
    required: true
  }
})

// Methods
const getTrendIcon = (trend) => {
  const icons = {
    up: 'trending_up',
    down: 'trending_down',
    neutral: 'trending_flat'
  }
  return icons[trend] || 'trending_flat'
}

const getProgressValue = (kpi) => {
  // Calculate progress based on KPI value
  // This is a simplified calculation - you might want to customize this
  if (kpi.maxValue) {
    return Math.min(kpi.value / kpi.maxValue, 1)
  }
  
  // Default progress calculation based on KPI type
  const progressMap = {
    'Total Revenue': 0.8,
    'Transactions': 0.7,
    'Success Rate': 0.9,
    'Active Customers': 0.6
  }
  
  return progressMap[kpi.title] || 0.5
}
</script>

<style scoped>
.kpi-cards {
  margin-bottom: 32px;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: rgba(189, 240, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.kpi-content {
  padding: 24px;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 8px;
}

.kpi-trend.up {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.kpi-trend.down {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.kpi-trend.neutral {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.kpi-body {
  margin-bottom: 20px;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1;
}

.kpi-title {
  color: #cfcfcf;
  font-size: 0.875rem;
  font-weight: 500;
}

.kpi-footer {
  margin-top: 16px;
}

.kpi-progress {
  border-radius: 4px;
}

/* KPI Color Variants */
.kpi-lime {
  border-left: 4px solid #bdf000;
}

.kpi-blue {
  border-left: 4px solid #2196f3;
}

.kpi-green {
  border-left: 4px solid #4caf50;
}

.kpi-purple {
  border-left: 4px solid #9c27b0;
}

/* Responsive */
@media (max-width: 768px) {
  .kpi-cards .row {
    margin: 0;
  }
  
  .kpi-cards .col-md-3 {
    margin-bottom: 16px;
  }
  
  .kpi-content {
    padding: 20px;
  }
  
  .kpi-value {
    font-size: 1.75rem;
  }
}
</style>
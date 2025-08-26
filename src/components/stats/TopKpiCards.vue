<template>
  <div class="kpi-cards-container">
    <div class="row q-col-gutter-lg">
      <!-- Revenue Card -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card revenue-card" @mouseenter="startAnimation('revenue')" @mouseleave="stopAnimation('revenue')">
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
          </div>
          
          <div class="card-content">
            <div class="icon-container">
              <q-icon name="payments" class="card-icon" />
              <div class="icon-glow"></div>
            </div>
            
            <div class="metrics">
              <div class="metric-value">
                <span class="currency">$</span>
                <span class="amount">{{ formatNumber(kpis.revenue) }}</span>
              </div>
              <div class="metric-label">Total Revenue</div>
              <div class="metric-change" :class="getChangeClass(kpis.revenueChange)">
                <q-icon :name="getChangeIcon(kpis.revenueChange)" size="16px" />
                <span>{{ Math.abs(kpis.revenueChange) }}%</span>
                <span class="change-label">vs last month</span>
              </div>
            </div>
            
            <div class="progress-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="rgba(255,255,255,0.1)"
                  stroke-width="4"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="#bdf000"
                  stroke-width="4"
                  fill="none"
                  stroke-dasharray="157"
                  :stroke-dashoffset="157 - (157 * kpis.revenueProgress) / 100"
                  stroke-linecap="round"
                  class="progress-circle"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Card -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card transactions-card" @mouseenter="startAnimation('transactions')" @mouseleave="stopAnimation('transactions')">
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
          </div>
          
          <div class="card-content">
            <div class="icon-container">
              <q-icon name="receipt_long" class="card-icon" />
              <div class="icon-glow"></div>
            </div>
            
            <div class="metrics">
              <div class="metric-value">
                <span class="amount">{{ formatNumber(kpis.transactions) }}</span>
              </div>
              <div class="metric-label">Transactions</div>
              <div class="metric-change" :class="getChangeClass(kpis.transactionsChange)">
                <q-icon :name="getChangeIcon(kpis.transactionsChange)" size="16px" />
                <span>{{ Math.abs(kpis.transactionsChange) }}%</span>
                <span class="change-label">vs last month</span>
              </div>
            </div>
            
            <div class="progress-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="rgba(255,255,255,0.1)"
                  stroke-width="4"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="#4CAF50"
                  stroke-width="4"
                  fill="none"
                  stroke-dasharray="157"
                  :stroke-dashoffset="157 - (157 * kpis.transactionsProgress) / 100"
                  stroke-linecap="round"
                  class="progress-circle"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Rate Card -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card success-card" @mouseenter="startAnimation('success')" @mouseleave="stopAnimation('success')">
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
          </div>
          
          <div class="card-content">
            <div class="icon-container">
              <q-icon name="check_circle" class="card-icon" />
              <div class="icon-glow"></div>
            </div>
            
            <div class="metrics">
              <div class="metric-value">
                <span class="amount">{{ kpis.successRate }}</span>
                <span class="percentage">%</span>
              </div>
              <div class="metric-label">Success Rate</div>
              <div class="metric-change" :class="getChangeClass(kpis.successRateChange)">
                <q-icon :name="getChangeIcon(kpis.successRateChange)" size="16px" />
                <span>{{ Math.abs(kpis.successRateChange) }}%</span>
                <span class="change-label">vs last month</span>
              </div>
            </div>
            
            <div class="progress-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="rgba(255,255,255,0.1)"
                  stroke-width="4"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="#FF9800"
                  stroke-width="4"
                  fill="none"
                  stroke-dasharray="157"
                  :stroke-dashoffset="157 - (157 * kpis.successRateProgress) / 100"
                  stroke-linecap="round"
                  class="progress-circle"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Average Order Card -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card order-card" @mouseenter="startAnimation('order')" @mouseleave="stopAnimation('order')">
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
          </div>
          
          <div class="card-content">
            <div class="icon-container">
              <q-icon name="shopping_cart" class="card-icon" />
              <div class="icon-glow"></div>
            </div>
            
            <div class="metrics">
              <div class="metric-value">
                <span class="currency">$</span>
                <span class="amount">{{ formatNumber(kpis.averageOrder) }}</span>
              </div>
              <div class="metric-label">Avg. Order Value</div>
              <div class="metric-change" :class="getChangeClass(kpis.averageOrderChange)">
                <q-icon :name="getChangeIcon(kpis.averageOrderChange)" size="16px" />
                <span>{{ Math.abs(kpis.averageOrderChange) }}%</span>
                <span class="change-label">vs last month</span>
              </div>
            </div>
            
            <div class="progress-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="rgba(255,255,255,0.1)"
                  stroke-width="4"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="#9C27B0"
                  stroke-width="4"
                  fill="none"
                  stroke-dasharray="157"
                  :stroke-dashoffset="157 - (157 * kpis.averageOrderProgress) / 100"
                  stroke-linecap="round"
                  class="progress-circle"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Props
const props = defineProps({
  kpis: {
    type: Object,
    default: () => ({
      revenue: 0,
      revenueChange: 0,
      revenueProgress: 0,
      transactions: 0,
      transactionsChange: 0,
      transactionsProgress: 0,
      successRate: 0,
      successRateChange: 0,
      successRateProgress: 0,
      averageOrder: 0,
      averageOrderChange: 0,
      averageOrderProgress: 0
    })
  }
})

// Reactive data
const animations = ref({
  revenue: false,
  transactions: false,
  success: false,
  order: false
})

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

const getChangeClass = (change) => {
  return change >= 0 ? 'positive' : 'negative'
}

const getChangeIcon = (change) => {
  return change >= 0 ? 'trending_up' : 'trending_down'
}

const startAnimation = (type) => {
  animations.value[type] = true
}

const stopAnimation = (type) => {
  animations.value[type] = false
}

// Initialize with demo data if not provided
onMounted(() => {
  if (!props.kpis.revenue) {
    Object.assign(props.kpis, {
      revenue: 284750,
      revenueChange: 12.5,
      revenueProgress: 75,
      transactions: 1247,
      transactionsChange: 8.3,
      transactionsProgress: 85,
      successRate: 98.7,
      successRateChange: 2.1,
      successRateProgress: 90,
      averageOrder: 228,
      averageOrderChange: -1.2,
      averageOrderProgress: 65
    })
  }
})
</script>

<style scoped>
.kpi-cards-container {
  margin-bottom: 2rem;
}

.kpi-card {
  position: relative;
  background: #121212;
  border-radius: 16px;
  padding: 24px;
  height: 160px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(189, 240, 0, 0.1);
}

.kpi-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(189, 240, 0, 0.3);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.05) 0%, transparent 50%, rgba(189, 240, 0, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover .gradient-overlay {
  opacity: 1;
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(189, 240, 0, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover .pattern-overlay {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(189, 240, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.kpi-card:hover .icon-container {
  transform: scale(1.1);
  background: rgba(189, 240, 0, 0.2);
}

.card-icon {
  font-size: 28px;
  color: #bdf000;
  z-index: 2;
}

.icon-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.3) 0%, transparent 70%);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover .icon-glow {
  opacity: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.metrics {
  flex: 1;
  margin-left: 20px;
}

.metric-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.currency {
  font-size: 16px;
  color: #bdf000;
  font-weight: 600;
  margin-right: 4px;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.percentage {
  font-size: 20px;
  color: #bdf000;
  font-weight: 600;
  margin-left: 4px;
}

.metric-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.metric-change {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  gap: 4px;
}

.metric-change.positive {
  color: #4CAF50;
}

.metric-change.negative {
  color: #F44336;
}

.change-label {
  color: #666;
  font-weight: 400;
}

.progress-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle {
  transition: stroke-dashoffset 0.8s ease;
  transform: rotate(-90deg);
  transform-origin: center;
}

/* Card-specific styles */
.revenue-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%);
}

.transactions-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%);
}

.success-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%);
}

.order-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .kpi-card {
    height: 140px;
    padding: 20px;
  }
  
  .amount {
    font-size: 28px;
  }
  
  .icon-container {
    width: 50px;
    height: 50px;
  }
  
  .card-icon {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .kpi-card {
    height: 120px;
    padding: 16px;
  }
  
  .amount {
    font-size: 24px;
  }
  
  .metrics {
    margin-left: 16px;
  }
}
</style>
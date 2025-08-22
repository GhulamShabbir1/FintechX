<template>
  <div class="status-card-container">
    <div class="status-card" :class="statusClass">
      <div class="card-background">
        <div class="status-glow"></div>
        <div class="pattern-dots"></div>
      </div>
      
      <div class="card-content">
        <div class="status-header">
          <div class="status-icon-container">
            <q-icon :name="statusIcon" class="status-icon" />
            <div class="icon-ring"></div>
          </div>
          <div class="status-info">
            <div class="status-title">{{ statusTitle }}</div>
            <div class="status-subtitle">{{ statusSubtitle }}</div>
          </div>
        </div>
        
        <div class="progress-section">
          <div class="progress-info">
            <span class="progress-label">Onboarding Progress</span>
            <span class="progress-percentage">{{ progressPercentage }}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
          <div class="progress-steps">
            <div 
              v-for="(step, index) in onboardingSteps" 
              :key="index"
              class="step-item"
              :class="{ completed: step.completed, current: step.current }"
            >
              <div class="step-dot">
                <q-icon v-if="step.completed" name="check" size="12px" />
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>
        </div>
        
        <div class="action-section" v-if="showActions">
          <q-btn
            v-if="status === 'pending'"
            color="lime"
            icon="check"
            label="Complete Setup"
            class="action-btn"
            @click="completeSetup"
          />
          <q-btn
            v-if="status === 'verified'"
            flat
            color="lime"
            icon="settings"
            label="Manage Account"
            class="action-btn"
            @click="manageAccount"
          />
          <q-btn
            v-if="status === 'rejected'"
            color="orange"
            icon="refresh"
            label="Resubmit"
            class="action-btn"
            @click="resubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  status: {
    type: String,
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

// Reactive data
const onboardingSteps = ref([
  { label: 'Account Created', completed: true, current: false },
  { label: 'Business Details', completed: false, current: true },
  { label: 'Documents Uploaded', completed: false, current: false },
  { label: 'Verification Complete', completed: false, current: false }
])

// Computed properties
const statusClass = computed(() => {
  return `status-${props.status}`
})

const statusIcon = computed(() => {
  switch (props.status) {
    case 'verified': return 'check_circle'
    case 'rejected': return 'cancel'
    case 'suspended': return 'block'
    case 'pending': return 'pending'
    default: return 'help'
  }
})

const statusTitle = computed(() => {
  switch (props.status) {
    case 'verified': return 'Account Verified'
    case 'rejected': return 'Account Rejected'
    case 'suspended': return 'Account Suspended'
    case 'pending': return 'Pending Verification'
    default: return 'Unknown Status'
  }
})

const statusSubtitle = computed(() => {
  switch (props.status) {
    case 'verified': return 'Your account is fully active and ready to process payments'
    case 'rejected': return 'Please review the feedback and resubmit your application'
    case 'suspended': return 'Your account has been temporarily suspended'
    case 'pending': return 'We are reviewing your application'
    default: return 'Please contact support for assistance'
  }
})

const progressPercentage = computed(() => {
  return Math.min(100, Math.max(0, props.progress))
})

// Methods
const completeSetup = () => {
  router.push('/business/setup')
}

const manageAccount = () => {
  router.push('/business/settings')
}

const resubmit = () => {
  router.push('/business/resubmit')
}

const updateProgressSteps = () => {
  const progress = props.progress
  const steps = onboardingSteps.value
  
  if (progress >= 25) {
    steps[0].completed = true
    steps[0].current = false
    steps[1].current = true
  }
  
  if (progress >= 50) {
    steps[1].completed = true
    steps[1].current = false
    steps[2].current = true
  }
  
  if (progress >= 75) {
    steps[2].completed = true
    steps[2].current = false
    steps[3].current = true
  }
  
  if (progress >= 100) {
    steps[3].completed = true
    steps[3].current = false
  }
}

// Lifecycle
onMounted(() => {
  updateProgressSteps()
})
</script>

<style scoped>
.status-card-container {
  margin-bottom: 1.5rem;
}

.status-card {
  position: relative;
  background: #121212;
  border-radius: 16px;
  padding: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(189, 240, 0, 0.1);
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.status-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: rotate 20s linear infinite;
}

.status-card:hover .status-glow {
  opacity: 1;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pattern-dots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(189, 240, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.card-content {
  position: relative;
  z-index: 2;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.status-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(189, 240, 0, 0.1);
  margin-right: 16px;
  transition: all 0.3s ease;
}

.status-card:hover .status-icon-container {
  transform: scale(1.05);
  background: rgba(189, 240, 0, 0.2);
}

.status-icon {
  font-size: 28px;
  color: #bdf000;
  z-index: 2;
}

.icon-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: linear-gradient(45deg, #bdf000, #ffffff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.status-card:hover .icon-ring {
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

.status-info {
  flex: 1;
}

.status-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.status-subtitle {
  font-size: 14px;
  color: #999;
  line-height: 1.4;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  color: #ccc;
  font-weight: 500;
}

.progress-percentage {
  font-size: 16px;
  color: #bdf000;
  font-weight: 700;
}

.progress-bar-container {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #bdf000, #4CAF50);
  border-radius: 4px;
  transition: width 0.8s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step-item.completed .step-dot {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.step-item.current .step-dot {
  background: #bdf000;
  border-color: #bdf000;
  box-shadow: 0 0 12px rgba(189, 240, 0, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

.step-label {
  font-size: 11px;
  color: #999;
  text-align: center;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.step-item.completed .step-label {
  color: #4CAF50;
}

.step-item.current .step-label {
  color: #bdf000;
  font-weight: 600;
}

.action-section {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Status-specific styles */
.status-verified {
  border-color: rgba(76, 175, 80, 0.3);
}

.status-verified .status-icon {
  color: #4CAF50;
}

.status-pending {
  border-color: rgba(255, 152, 0, 0.3);
}

.status-pending .status-icon {
  color: #FF9800;
}

.status-rejected {
  border-color: rgba(244, 67, 54, 0.3);
}

.status-rejected .status-icon {
  color: #F44336;
}

.status-suspended {
  border-color: rgba(158, 158, 158, 0.3);
}

.status-suspended .status-icon {
  color: #9E9E9E;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .status-card {
    padding: 20px;
  }
  
  .status-header {
    flex-direction: column;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .status-icon-container {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .progress-steps {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .step-item {
    flex: 0 0 calc(50% - 6px);
  }
  
  .action-section {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .status-card {
    padding: 16px;
  }
  
  .status-title {
    font-size: 16px;
  }
  
  .status-subtitle {
    font-size: 13px;
  }
  
  .step-label {
    font-size: 10px;
  }
}
</style>
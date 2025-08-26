<template>
  <div class="status-card-container">
    <div class="status-card" :class="statusClass">
      <!-- Background effects -->
      <div class="card-background">
        <div class="status-glow" :class="statusClass"></div>
        <div class="pattern-dots"></div>
        <div class="gradient-overlay"></div>
      </div>
      
      <div class="card-content">
        <!-- Status Header -->
        <div class="status-header">
          <div class="status-icon-container">
            <q-icon :name="statusIcon" class="status-icon" />
            <div class="icon-ring" :class="statusClass"></div>
            <div class="icon-pulse" :class="statusClass"></div>
          </div>
          <div class="status-info">
            <div class="status-title">{{ statusTitle }}</div>
            <div class="status-subtitle">{{ statusSubtitle }}</div>
          </div>
        </div>
        
        <!-- Progress Section -->
        <div class="progress-section">
          <div class="progress-info">
            <span class="progress-label">Onboarding Progress</span>
            <span class="progress-percentage">{{ progressPercentage }}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :class="statusClass"
                :style="{ width: progressPercentage + '%' }"
              >
                <div class="progress-shimmer"></div>
              </div>
            </div>
          </div>
          <div class="progress-steps">
            <div 
              v-for="(step, index) in onboardingSteps" 
              :key="index"
              class="step-item"
              :class="{ 
                completed: step.completed, 
                current: step.current,
                [statusClass]: step.current
              }"
            >
              <div class="step-dot">
                <q-icon v-if="step.completed" name="check" size="12px" />
                <div v-else class="step-number">{{ index + 1 }}</div>
              </div>
              <span class="step-label">{{ step.label }}</span>
              <div class="step-connector" v-if="index < onboardingSteps.length - 1"></div>
            </div>
          </div>
        </div>
        
        <!-- Action Section -->
        <div class="action-section" v-if="showActions">
          <q-btn
            v-if="status === 'pending'"
            color="lime"
            icon="check"
            label="Complete Setup"
            class="action-btn btn-primary"
            @click="completeSetup"
            :disable="progressPercentage < 100"
          >
            <q-tooltip v-if="progressPercentage < 100">
              Complete all steps to activate
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="status === 'verified'"
            flat
            color="lime"
            icon="settings"
            label="Manage Account"
            class="action-btn btn-outline"
            @click="manageAccount"
          />
          <q-btn
            v-if="status === 'rejected'"
            color="orange"
            icon="refresh"
            label="Resubmit Application"
            class="action-btn btn-warning"
            @click="resubmit"
          />
          <q-btn
            v-if="status === 'suspended'"
            color="grey"
            icon="support_agent"
            label="Contact Support"
            class="action-btn btn-secondary"
            @click="contactSupport"
          />
        </div>

        <!-- Status Badge -->
        <div class="status-badge" :class="statusClass">
          <q-icon :name="statusIcon" size="16px" />
          <span>{{ statusDisplay }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  status: {
    type: String,
    default: 'pending',
    validator: (value) => ['pending', 'verified', 'rejected', 'suspended'].includes(value)
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
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
  const icons = {
    verified: 'check_circle',
    rejected: 'cancel',
    suspended: 'block',
    pending: 'pending_actions'
  }
  return icons[props.status] || 'help'
})

const statusTitle = computed(() => {
  const titles = {
    verified: 'Account Verified',
    rejected: 'Application Rejected',
    suspended: 'Account Suspended',
    pending: 'Pending Verification'
  }
  return titles[props.status] || 'Unknown Status'
})

const statusSubtitle = computed(() => {
  const subtitles = {
    verified: 'Your account is fully active and ready to process payments',
    rejected: 'Please review the feedback and resubmit your application',
    suspended: 'Your account has been temporarily suspended',
    pending: 'We are reviewing your application. Complete all steps to activate.'
  }
  return subtitles[props.status] || 'Please contact support for assistance'
})

const statusDisplay = computed(() => {
  return props.status.charAt(0).toUpperCase() + props.status.slice(1)
})

const progressPercentage = computed(() => {
  return Math.min(100, Math.max(0, props.progress))
})

// Methods
const completeSetup = () => {
  if (progressPercentage.value < 100) {
    return // Prevent action if not complete
  }
  router.push('/business/setup')
}

const manageAccount = () => {
  router.push('/business/settings')
}

const resubmit = () => {
  router.push('/business/resubmit')
}

const contactSupport = () => {
  router.push('/support')
}

const updateProgressSteps = () => {
  const progress = props.progress
  const steps = onboardingSteps.value
  
  // Reset all steps
  steps.forEach((step, index) => {
    step.completed = index === 0 // Only first step completed by default
    step.current = index === 1 // Second step current by default
  })
  
  // Update based on progress
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

// Watch for progress changes
watch(() => props.progress, updateProgressSteps)

// Lifecycle
onMounted(() => {
  updateProgressSteps()
})
</script>

<style scoped>
.status-card-container {
  margin-bottom: 2rem;
  perspective: 1000px;
}

.status-card {
  position: relative;
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  padding: 28px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transform-style: preserve-3d;
}

.status-card:hover {
  transform: translateY(-6px) rotateX(2deg);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 40px rgba(189, 240, 0, 0.15);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.status-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  animation: rotate 20s linear infinite;
}

.status-glow.status-verified {
  --glow-color: rgba(76, 175, 80, 0.15);
}

.status-glow.status-pending {
  --glow-color: rgba(255, 152, 0, 0.15);
}

.status-glow.status-rejected {
  --glow-color: rgba(244, 67, 54, 0.15);
}

.status-glow.status-suspended {
  --glow-color: rgba(158, 158, 158, 0.15);
}

.status-card:hover .status-glow {
  opacity: 0.6;
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
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.4;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0.8;
}

.card-content {
  position: relative;
  z-index: 2;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  gap: 20px;
}

.status-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  flex-shrink: 0;
}

.status-card:hover .status-icon-container {
  transform: scale(1.1) rotate(5deg);
  background: rgba(255, 255, 255, 0.15);
}

.status-icon {
  font-size: 32px;
  z-index: 3;
  transition: all 0.3s ease;
}

.status-verified .status-icon {
  color: #4CAF50;
  filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.5));
}

.status-pending .status-icon {
  color: #FF9800;
  filter: drop-shadow(0 0 10px rgba(255, 152, 0, 0.5));
}

.status-rejected .status-icon {
  color: #F44336;
  filter: drop-shadow(0 0 10px rgba(244, 67, 54, 0.5));
}

.status-suspended .status-icon {
  color: #9E9E9E;
  filter: drop-shadow(0 0 10px rgba(158, 158, 158, 0.5));
}

.icon-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid transparent;
  border-radius: 18px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.icon-ring.status-verified {
  border-color: #4CAF50;
  background: linear-gradient(45deg, transparent, rgba(76, 175, 80, 0.2), transparent);
}

.icon-ring.status-pending {
  border-color: #FF9800;
  background: linear-gradient(45deg, transparent, rgba(255, 152, 0, 0.2), transparent);
}

.icon-ring.status-rejected {
  border-color: #F44336;
  background: linear-gradient(45deg, transparent, rgba(244, 67, 54, 0.2), transparent);
}

.icon-ring.status-suspended {
  border-color: #9E9E9E;
  background: linear-gradient(45deg, transparent, rgba(158, 158, 158, 0.2), transparent);
}

.status-card:hover .icon-ring {
  opacity: 1;
  animation: pulseRing 2s ease-in-out infinite;
}

.icon-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  opacity: 0;
  animation: pulse 3s ease-in-out infinite;
}

.icon-pulse.status-verified {
  background: rgba(76, 175, 80, 0.3);
}

.icon-pulse.status-pending {
  background: rgba(255, 152, 0, 0.3);
}

.icon-pulse.status-rejected {
  background: rgba(244, 67, 54, 0.3);
}

.icon-pulse.status-suspended {
  background: rgba(158, 158, 158, 0.3);
}

@keyframes pulseRing {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    opacity: 0.4;
  }
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.2;
}

.status-subtitle {
  font-size: 0.95rem;
  color: #ccc;
  line-height: 1.4;
  opacity: 0.9;
}

.progress-section {
  margin-bottom: 28px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-label {
  font-size: 0.95rem;
  color: #ccc;
  font-weight: 500;
}

.progress-percentage {
  font-size: 1.1rem;
  font-weight: 700;
  color: #bdf000;
}

.progress-bar-container {
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill.status-verified {
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
}

.progress-fill.status-pending {
  background: linear-gradient(90deg, #FF9800, #FFB74D);
}

.progress-fill.status-rejected {
  background: linear-gradient(90deg, #F44336, #EF5350);
}

.progress-fill.status-suspended {
  background: linear-gradient(90deg, #9E9E9E, #BDBDBD);
}

.progress-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.progress-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.4s ease;
  border: 2px solid transparent;
  position: relative;
}

.step-item.completed .step-dot {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
  transform: scale(1.1);
}

.step-item.current .step-dot {
  background: #bdf000;
  border-color: #bdf000;
  color: #000;
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

.step-item.current.status-verified .step-dot {
  background: #4CAF50;
  border-color: #4CAF50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
}

.step-item.current.status-pending .step-dot {
  background: #FF9800;
  border-color: #FF9800;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.6);
}

.step-item.current.status-rejected .step-dot {
  background: #F44336;
  border-color: #F44336;
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.6);
}

.step-item.current.status-suspended .step-dot {
  background: #9E9E9E;
  border-color: #9E9E9E;
  box-shadow: 0 0 20px rgba(158, 158, 158, 0.6);
}

.step-number {
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
}

.step-item.completed .step-number,
.step-item.current .step-number {
  color: white;
}

.step-label {
  font-size: 0.8rem;
  color: #999;
  text-align: center;
  line-height: 1.2;
  transition: all 0.3s ease;
  font-weight: 500;
}

.step-item.completed .step-label {
  color: #4CAF50;
  font-weight: 600;
}

.step-item.current .step-label {
  color: #bdf000;
  font-weight: 700;
}

.step-connector {
  position: absolute;
  top: 16px;
  right: -6px;
  width: calc(100% + 12px);
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.step-item:last-child .step-connector {
  display: none;
}

.step-item.completed .step-connector {
  background: #4CAF50;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 12px 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #000;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(189, 240, 0, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  border: 2px solid rgba(189, 240, 0, 0.3);
  color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
}

.btn-outline:hover {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.2);
  transform: translateY(-2px);
}

.btn-warning {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  color: #000;
  border: none;
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}

.btn-secondary {
  background: rgba(158, 158, 158, 0.2);
  color: #e0e0e0;
  border: 1px solid rgba(158, 158, 158, 0.3);
}

.btn-secondary:hover {
  background: rgba(158, 158, 158, 0.3);
  transform: translateY(-2px);
}

.status-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 3;
}

.status-badge.status-verified {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-badge.status-pending {
  background: rgba(255, 152, 0, 0.2);
  color: #FF9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.status-badge.status-rejected {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-badge.status-suspended {
  background: rgba(158, 158, 158, 0.2);
  color: #9E9E9E;
  border: 1px solid rgba(158, 158, 158, 0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .status-card {
    padding: 24px;
    border-radius: 16px;
  }
  
  .status-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .status-icon-container {
    width: 60px;
    height: 60px;
  }
  
  .progress-steps {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .step-connector {
    display: none;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .status-title {
    font-size: 1.2rem;
  }
  
  .status-subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .status-card {
    padding: 20px;
  }
  
  .progress-steps {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .step-item {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
  
  .step-dot {
    margin-bottom: 0;
    flex-shrink: 0;
  }
  
  .step-label {
    text-align: left;
    flex: 1;
  }
  
  .status-badge {
    top: 16px;
    right: 16px;
    font-size: 0.7rem;
    padding: 4px 10px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .status-card,
  .status-icon-container,
  .progress-fill,
  .step-dot,
  .action-btn,
  .status-glow,
  .icon-ring,
  .icon-pulse,
  .progress-shimmer {
    animation: none;
    transition: none;
  }
  
  .status-card:hover {
    transform: none;
  }
  
  .status-card:hover .status-icon-container {
    transform: none;
  }
}

/* Enhanced focus states */
.action-btn:focus-visible {
  outline: 2px solid #bdf000;
  outline-offset: 2px;
}
</style>
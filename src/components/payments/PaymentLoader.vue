<template>
  <div class="payment-loader-container">
    <!-- Main Loader Animation -->
    <div class="loader-main">
      <div class="pulse-circle">
        <div class="pulse-ring" v-for="n in 3" :key="n" :style="{ animationDelay: `${n * 0.5}s` }"></div>
        <div class="loader-center">
          <q-icon name="lock" size="32px" color="lime" class="lock-icon" />
        </div>
      </div>
    </div>

    <!-- Processing Steps -->
    <div class="processing-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        :class="['step-item', { 
          active: currentStep >= index, 
          completed: currentStep > index 
        }]"
      >
        <div class="step-icon">
          <q-icon 
            :name="currentStep > index ? 'check_circle' : step.icon" 
            :color="currentStep > index ? 'green' : (currentStep >= index ? 'lime' : 'grey')"
            size="sm"
          />
        </div>
        <div class="step-text">{{ step.label }}</div>
      </div>
    </div>

    <!-- Processing Message -->
    <div class="processing-message">
      <div class="message-text">{{ message }}</div>
      <div class="progress-dots">
        <span v-for="n in 3" :key="n" class="dot" :style="{ animationDelay: `${n * 0.3}s` }"></span>
      </div>
    </div>

    <!-- Security Indicators -->
    <div class="security-indicators">
      <div class="security-item" v-for="(item, index) in securityItems" :key="item.id" :style="{ animationDelay: `${index * 0.2}s` }">
        <q-icon :name="item.icon" :color="item.color" size="sm" />
        <span>{{ item.text }}</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
      <q-linear-progress 
        :value="progressValue" 
        color="lime" 
        track-color="rgba(255,255,255,0.1)"
        size="4px" 
        rounded
        animation-speed="200"
        class="progress-bar"
      />
      <div class="progress-text">{{ Math.round(progressValue * 100) }}% Complete</div>
    </div>

    <!-- Additional Visual Elements -->
    <div class="visual-elements">
      <div class="floating-particle" v-for="n in 8" :key="n" :style="getParticleStyle(n)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  message: { type: String, default: 'Processing payment...' },
  type: { type: String, default: 'payment' }, // payment, redirect, verification
  duration: { type: Number, default: 5000 } // milliseconds
})

// Reactive data
const currentStep = ref(0)
const progressValue = ref(0)
const startTime = ref(Date.now())
let progressInterval = null

// Security items
const securityItems = ref([
  { id: 'ssl', icon: 'security', color: 'green', text: 'SSL Encrypted' },
  { id: 'pci', icon: 'verified_user', color: 'blue', text: 'PCI Compliant' },
  { id: 'secure', icon: 'lock', color: 'lime', text: '256-bit Encryption' }
])

// Processing steps based on type
const steps = computed(() => {
  if (props.type === 'payment') {
    return [
      { id: 'validate', label: 'Validating Details', icon: 'verified' },
      { id: 'process', label: 'Processing Payment', icon: 'payment' },
      { id: 'confirm', label: 'Confirming Transaction', icon: 'check_circle' },
      { id: 'complete', label: 'Redirecting...', icon: 'launch' }
    ]
  } else if (props.type === 'redirect') {
    return [
      { id: 'prepare', label: 'Preparing Redirect', icon: 'link' },
      { id: 'secure', label: 'Securing Connection', icon: 'security' },
      { id: 'redirect', label: 'Redirecting...', icon: 'launch' }
    ]
  } else {
    return [
      { id: 'verify', label: 'Verifying Information', icon: 'verified' },
      { id: 'process', label: 'Processing Request', icon: 'hourglass_empty' },
      { id: 'complete', label: 'Almost Done...', icon: 'check_circle' }
    ]
  }
})

// Methods
const updateProgress = () => {
  const elapsed = Date.now() - startTime.value
  const progress = Math.min(elapsed / props.duration, 1)
  progressValue.value = progress
  
  // Update current step based on progress
  const stepProgress = progress * steps.value.length
  currentStep.value = Math.floor(stepProgress)
  
  if (progress >= 1) {
    clearInterval(progressInterval)
  }
}

const getParticleStyle = (index) => {
  const angle = (index / 8) * Math.PI * 2
  const distance = 60 + (index % 3) * 20
  return {
    left: `calc(50% + ${Math.cos(angle) * distance}px)`,
    top: `calc(50% + ${Math.sin(angle) * distance}px)`,
    animationDelay: `${index * 0.2}s`,
    backgroundColor: `hsl(${index * 45}, 100%, 70%)`
  }
}

// Lifecycle
onMounted(() => {
  startTime.value = Date.now()
  progressInterval = setInterval(updateProgress, 100)
  
  // Add smooth entrance animation
  const container = document.querySelector('.payment-loader-container')
  if (container) {
    container.classList.add('animate-in')
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})

// Watch for message changes to reset if needed
watch(() => props.message, () => {
  // Reset progress if message indicates a new phase
  if (props.message.includes('Validating')) {
    currentStep.value = 0
    progressValue.value = 0
    startTime.value = Date.now()
  }
})
</script>

<style scoped>
.payment-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #ffffff;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.payment-loader-container.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Main Loader Animation */
.loader-main {
  margin-bottom: 40px;
  position: relative;
  z-index: 10;
}

.pulse-circle {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #bdf000;
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
  opacity: 0;
}

.loader-center {
  position: relative;
  z-index: 10;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #bdf000, #a0d000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(189, 240, 0, 0.4);
  transition: all 0.3s ease;
}

.loader-center:hover {
  transform: scale(1.1);
  box-shadow: 0 0 40px rgba(189, 240, 0, 0.6);
}

.lock-icon {
  color: #000000;
  animation: lockPulse 2s ease-in-out infinite;
}

/* Processing Steps */
.processing-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
  min-width: 200px;
  position: relative;
  z-index: 10;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInRight 0.6s ease forwards;
}

.step-item:nth-child(1) { animation-delay: 0.1s; }
.step-item:nth-child(2) { animation-delay: 0.2s; }
.step-item:nth-child(3) { animation-delay: 0.3s; }
.step-item:nth-child(4) { animation-delay: 0.4s; }

.step-item.active {
  background: rgba(189, 240, 0, 0.15);
  border-left: 4px solid #bdf000;
  transform: translateX(0);
  box-shadow: 0 4px 12px rgba(189, 240, 0, 0.2);
}

.step-item.completed {
  background: rgba(34, 197, 94, 0.15);
  border-left: 4px solid #22c55e;
  transform: translateX(0);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.step-icon {
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-item.active .step-icon,
.step-item.completed .step-icon {
  transform: scale(1.2);
}

.step-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  transition: all 0.3s ease;
}

.step-item.active .step-text {
  color: #bdf000;
  font-weight: 600;
}

.step-item.completed .step-text {
  color: #22c55e;
}

/* Processing Message */
.processing-message {
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
}

.message-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #bdf000;
  margin-bottom: 12px;
  text-shadow: 0 0 10px rgba(189, 240, 0, 0.3);
  animation: textGlow 2s ease-in-out infinite;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #bdf000;
  border-radius: 50%;
  animation: dotPulse 1.5s ease-in-out infinite;
}

/* Security Indicators */
.security-indicators {
  display: flex;
  gap: 24px;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #a0a0a0;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.security-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Progress Bar */
.progress-container {
  width: 100%;
  max-width: 300px;
  position: relative;
  z-index: 10;
}

.progress-bar {
  transition: all 0.3s ease;
}

.progress-bar:hover {
  transform: scaleY(1.2);
}

.progress-text {
  font-size: 0.75rem;
  color: #a0a0a0;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.progress-container:hover .progress-text {
  color: #bdf000;
}

/* Visual Elements */
.visual-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes lockPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes dotPulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes slideInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(189, 240, 0, 0.3);
  }
  50% {
    text-shadow: 0 0 20px rgba(189, 240, 0, 0.6);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .payment-loader-container {
    padding: 20px 10px;
    min-height: 300px;
  }
  
  .pulse-circle {
    width: 100px;
    height: 100px;
  }
  
  .loader-center {
    width: 50px;
    height: 50px;
  }
  
  .lock-icon {
    font-size: 24px;
  }
  
  .security-indicators {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .processing-steps {
    min-width: auto;
    width: 100%;
  }
  
  .step-item {
    padding: 10px 12px;
  }
  
  .security-item {
    width: 100%;
    justify-content: center;
  }
}
</style>
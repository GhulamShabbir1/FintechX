<template>
  <div class="payment-loader-container">
    <div class="loader-content">
      <div class="payment-animation">
        <div class="card-animation">
          <q-icon name="credit_card" size="60px" color="lime" class="card-icon" />
          <div class="processing-waves">
            <div class="wave wave-1"></div>
            <div class="wave wave-2"></div>
            <div class="wave wave-3"></div>
          </div>
        </div>
      </div>

      <div class="loader-message">
        <div class="text-h6 text-lime q-mb-sm">{{ message }}</div>
        <div class="text-caption text-grey-5">Please do not refresh or close this page</div>
      </div>

      <div class="security-indicators">
        <div class="security-item">
          <q-icon name="security" color="green" size="sm" />
          <span>Secure Connection</span>
        </div>
        <div class="security-item">
          <q-icon name="lock" color="blue" size="sm" />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Processing your payment...'
  }
})
</script>

<style scoped>
.payment-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px 20px;
}

.loader-content {
  max-width: 300px;
}

.payment-animation {
  position: relative;
  margin-bottom: 30px;
}

.card-animation {
  position: relative;
  display: inline-block;
}

.card-icon {
  animation: cardPulse 2s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.processing-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #bdf000;
  border-radius: 50%;
  opacity: 0;
  animation: waveAnimation 2s ease-out infinite;
}

.wave-2 {
  animation-delay: 0.5s;
}

.wave-3 {
  animation-delay: 1s;
}

.loader-message {
  margin-bottom: 30px;
}

.security-indicators {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #aaa;
}

/* Animations */
@keyframes cardPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes waveAnimation {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }

  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.text-lime {
  color: #bdf000;
}

.text-grey-5 {
  color: #aaa;
}
</style>
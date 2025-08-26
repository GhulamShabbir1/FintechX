<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <!-- Background Elements -->
    <div class="bg-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="square square-1"></div>
      <div class="square square-2"></div>
      <div class="floating-dots">
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="dot dot-3"></div>
        <div class="dot dot-4"></div>
        <div class="dot dot-5"></div>
        <div class="dot dot-6"></div>
      </div>
    </div>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer class="auth-footer text-center">
      <div class="footer-content">
        <div class="footer-text">
          <span class="text-lime">FinteckX</span> - Next Generation Payment Platform
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a>
          <span class="footer-separator">•</span>
          <a href="#" class="footer-link">Terms of Service</a>
          <span class="footer-separator">•</span>
          <a href="#" class="footer-link">Support</a>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let animationFrame = null

onMounted(() => {
  initBackgroundAnimations()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

const initBackgroundAnimations = () => {
  const animate = () => {
    // Add any additional background animation logic here
    animationFrame = requestAnimationFrame(animate)
  }
  animate()
}
</script>

<style scoped>
.auth-layout {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.bg-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.square {
  position: absolute;
  background: linear-gradient(45deg, rgba(189, 240, 0, 0.05) 0%, transparent 100%);
  animation: rotate 8s linear infinite;
}

.square-1 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 25%;
  animation-delay: 1s;
}

.square-2 {
  width: 80px;
  height: 80px;
  bottom: 40%;
  right: 10%;
  animation-delay: 3s;
}

.floating-dots {
  position: absolute;
  width: 100%;
  height: 100%;
}

.dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(189, 240, 0, 0.6);
  border-radius: 50%;
  animation: float-dot 4s ease-in-out infinite;
}

.dot-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.dot-2 {
  top: 40%;
  right: 30%;
  animation-delay: 0.5s;
}

.dot-3 {
  top: 70%;
  left: 40%;
  animation-delay: 1s;
}

.dot-4 {
  bottom: 30%;
  right: 20%;
  animation-delay: 1.5s;
}

.dot-5 {
  top: 50%;
  left: 60%;
  animation-delay: 2s;
}

.dot-6 {
  bottom: 60%;
  left: 80%;
  animation-delay: 2.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float-dot {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-15px) scale(1.2);
    opacity: 1;
  }
}

.auth-footer {
  background: rgba(10, 10, 10, 0.8);
  border-top: 1px solid rgba(189, 240, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  position: relative;
  z-index: 1;
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.footer-text {
  color: #ccc;
  font-size: 14px;
  margin-bottom: 8px;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.footer-link {
  color: #999;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: #bdf000;
  transform: translateY(-1px);
}

.footer-separator {
  color: #666;
  font-size: 12px;
}

.text-lime {
  color: #bdf000;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .circle-1 { width: 200px; height: 200px; }
  .circle-2 { width: 150px; height: 150px; }
  .circle-3 { width: 100px; height: 100px; }
  .square-1 { width: 70px; height: 70px; }
  .square-2 { width: 60px; height: 60px; }
  
  .footer-links {
    flex-direction: column;
    gap: 4px;
  }
  
  .footer-separator {
    display: none;
  }
}

/* Enhanced animations */
.circle:hover {
  animation-play-state: paused;
  transform: scale(1.1);
}

.square:hover {
  animation-play-state: paused;
  transform: scale(1.1) rotate(45deg);
}

.dot:hover {
  animation-play-state: paused;
  transform: scale(1.5);
  background: rgba(189, 240, 0.8);
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Performance optimizations */
.circle, .square, .dot {
  will-change: transform, opacity;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .circle, .square, .dot {
    animation: none;
  }
}
</style>
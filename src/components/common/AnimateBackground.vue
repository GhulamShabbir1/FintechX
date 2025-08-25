<template>
  <div class="animated-bg">
    <div class="gradient-background"></div>
    <div class="particles-container">
      <div v-for="i in particleCount" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>
    <div class="noise-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const particleCount = 20
const mousePosition = ref({ x: 0, y: 0 })
const isReducedMotion = ref(false)

const particleStyle = () => {
  const size = Math.random() * 4 + 1
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5
  const opacity = Math.random() * 0.1 + 0.05
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity: opacity,
    transform: `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`
  }
}

const handleMouseMove = (event) => {
  if (isReducedMotion.value) return
  
  const { clientX, clientY } = event
  const x = (clientX / window.innerWidth - 0.5) * 20
  const y = (clientY / window.innerHeight - 0.5) * 20
  
  mousePosition.value = { x, y }
  
  // Update CSS variables for parallax effect
  document.documentElement.style.setProperty('--mouse-x', `${x}px`)
  document.documentElement.style.setProperty('--mouse-y', `${y}px`)
}

const checkReducedMotion = () => {
  isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  checkReducedMotion()
  if (!isReducedMotion.value) {
    window.addEventListener('mousemove', handleMouseMove)
  }
})

onBeforeUnmount(() => {
  if (!isReducedMotion.value) {
    window.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style scoped>
.animated-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.gradient-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg, 
    #0c0f1a 0%, 
    #11172a 50%, 
    #0c0f1a 100%
  );
  animation: gradientShift 15s ease infinite;
  transform: translate3d(
    calc(var(--mouse-x, 0px) * 0.5),
    calc(var(--mouse-y, 0px) * 0.5),
    0
  );
}

.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(189, 240, 0, 0.3);
  border-radius: 50%;
  animation: float infinite ease-in-out;
  pointer-events: none;
  will-change: transform, opacity;
  filter: blur(1px);
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.15;
  mix-blend-mode: overlay;
}

@keyframes gradientShift {
  0%, 100% {
    background: linear-gradient(
      180deg, 
      #0c0f1a 0%, 
      #11172a 50%, 
      #0c0f1a 100%
    );
  }
  25% {
    background: linear-gradient(
      180deg, 
      #0d101b 0%, 
      #12182b 50%, 
      #0d101b 100%
    );
  }
  50% {
    background: linear-gradient(
      180deg, 
      #0e111c 0%, 
      #13192c 50%, 
      #0e111c 100%
    );
  }
  75% {
    background: linear-gradient(
      180deg, 
      #0d101b 0%, 
      #12182b 50%, 
      #0d101b 100%
    );
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.1;
  }
  25% {
    transform: translate(10px, -15px) scale(1.1);
    opacity: 0.2;
  }
  50% {
    transform: translate(-5px, 20px) scale(0.9);
    opacity: 0.15;
  }
  75% {
    transform: translate(-15px, -5px) scale(1.05);
    opacity: 0.25;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .gradient-background {
    animation: none;
  }
  
  .particle {
    animation: none;
    opacity: 0.02;
  }
  
  .noise-overlay {
    animation: none;
  }
}

/* Performance optimizations */
.animated-bg {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.gradient-background {
  will-change: transform, background;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .particle {
    animation-duration: 25s !important;
  }
  
  .gradient-background {
    animation-duration: 20s;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .gradient-background {
    background: linear-gradient(
      180deg, 
      #000000 0%, 
      #0a0a0a 50%, 
      #000000 100%
    );
  }
  
  .particle {
    opacity: 0.2;
  }
  
  .noise-overlay {
    opacity: 0.1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .gradient-background {
    background: linear-gradient(
      180deg, 
      #0c0f1a 0%, 
      #11172a 50%, 
      #0c0f1a 100%
    );
  }
}

/* Light mode support (if needed) */
@media (prefers-color-scheme: light) {
  .gradient-background {
    background: linear-gradient(
      180deg, 
      #f8fafc 0%, 
      #e2e8f0 50%, 
      #f8fafc 100%
    );
  }
  
  .particle {
    background: rgba(189, 240, 0, 0.2);
  }
  
  .noise-overlay {
    opacity: 0.1;
    mix-blend-mode: multiply;
  }
}

/* Hardware acceleration */
.animated-bg {
  transform: translateZ(0);
}

.gradient-background {
  transform: translate3d(
    calc(var(--mouse-x, 0px) * 0.5),
    calc(var(--mouse-y, 0px) * 0.5),
    0
  );
  transition: transform 0.1s linear;
}

/* Smooth animations */
* {
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
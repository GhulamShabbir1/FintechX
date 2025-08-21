<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="text-white header-gradient" reveal>
      <q-toolbar class="q-py-sm">
        <q-btn v-if="isAuthed" flat round dense icon="menu" @click="drawerOpen = !drawerOpen" class="q-mr-sm lt-md" />
        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="payments" class="q-mr-sm text-lime" />
          <span class="text-weight-bold text-lime">FinteckX</span>
        </q-toolbar-title>

        <div class="gt-sm">
          <q-btn flat icon="home" label="Home" to="/" class="q-mx-xs" />
          <q-btn flat icon="star" label="Advantages" to="/" @click.prevent="scrollTo('advantages')" class="q-mx-xs" />
          <q-btn flat icon="diversity_3" label="Services" to="/" @click.prevent="scrollTo('services')"
            class="q-mx-xs" />
          <q-btn flat icon="group" label="Users" to="/" @click.prevent="scrollTo('metrics')" class="q-mx-xs" />
          <q-btn flat icon="handshake" label="Partners" to="/" @click.prevent="scrollTo('partners')" class="q-mx-xs" />
        </div>

        <q-space />
        <q-btn flat rounded class="btn-gradient" to="/register" icon="rocket_launch" label="Get Started" />
        <q-btn flat class="q-ml-sm btn-outline-light" to="/login" icon="login" label="Access Account" />
      </q-toolbar>
    </q-header>

    <!-- Hero (text left, 3D image right) -->
    <section class="hero-section row items-center">
      <div class="col-12 col-md-6 q-pa-lg">
        <h2 class="text-h2 text-lime text-bold">Next-Gen Payments with FinteckX</h2>
        <p class="text-subtitle1 q-mt-md">
          Secure. Fast. Scalable. Empowering merchants and users with future-ready payment infrastructure.
        </p>
        <div class="q-mt-lg">
          <q-btn rounded class="btn-gradient q-mx-sm" icon="rocket_launch" label="Get Started" to="/register" />
          <q-btn flat rounded class="btn-outline-light q-mx-sm" icon="info" label="Learn More" to="/" />
        </div>
      </div>
      <div class="col-12 col-md-6 text-center">
        <q-img :src="heroImg" alt="Fintech 3D" class="hero-img floating" fit="contain" ratio="16/10"
          crossorigin="anonymous" referrerpolicy="no-referrer" @error="onImgError('hero')" />
      </div>
    </section>

    <!-- Advantages (Row 1: card left + 3D image right; Row 2: 3D image left + card right) -->
    <section id="advantages" class="q-pa-xl">
      <div class="row items-center q-my-xl">
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg card-dark lime-glow tall-card card-with-margins">
            <div class="text-h5 text-lime text-bold">Global Reach</div>
            <p class="q-mt-sm">
              Expand your business with our cross-border payment solutions trusted by thousands of merchants worldwide.
            </p>
            <div class="text-h4 text-lime q-mt-md">+200K</div>
            <div class="text-caption">Active Merchants</div>
          </q-card>
        </div>
        <div class="col-12 col-md-6 text-center">
          <q-img :src="reachImg" alt="Global Reach" class="section-img floating" fit="contain" ratio="16/10"
            crossorigin="anonymous" referrerpolicy="no-referrer" @error="onImgError('reach')" />
        </div>
      </div>

      <div class="row items-center q-my-xl">
        <div class="col-12 col-md-6 text-center q-mb-lg q-mb-none-md">
          <q-img :src="securityImg" alt="Security" class="section-img floating" fit="contain" ratio="16/10"
            crossorigin="anonymous" referrerpolicy="no-referrer" @error="onImgError('security')" />
        </div>
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg card-dark lime-glow tall-card card-with-margins">
            <div class="text-h5 text-lime text-bold">Bank-Grade Security</div>
            <p class="q-mt-sm">
              Transactions are encrypted with multi-layer authentication, giving peace of mind to merchants and
              customers.
            </p>
            <div class="text-h4 text-lime q-mt-md">99.99%</div>
            <div class="text-caption">System Uptime</div>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="q-pa-xl">
      <div class="text-center q-mb-xl">
        <h2 class="text-h4 text-lime text-bold">Our Services</h2>
        <p class="text-subtitle2">All-in-one fintech platform for payments, analytics, and growth.</p>
      </div>
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg card-dark lime-glow text-center tall-card card-with-margins">
            <q-icon name="credit_card" size="40px" class="text-lime q-mb-md" />
            <div class="text-h6 text-lime text-bold">Smart Checkout</div>
            <p>Fast and seamless checkout experience with multiple payment methods.</p>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg card-dark lime-glow text-center tall-card card-with-margins">
            <q-icon name="stacked_bar_chart" size="40px" class="text-lime q-mb-md" />
            <div class="text-h6 text-lime text-bold">Analytics</div>
            <p>Track and optimize your performance with real-time insights and reporting tools.</p>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg card-dark lime-glow text-center tall-card card-with-margins">
            <q-icon name="support" size="40px" class="text-lime q-mb-md" />
            <div class="text-h6 text-lime text-bold">24/7 Support</div>
            <p>Always-on support system to resolve issues instantly and keep business running.</p>
          </q-card>
        </div>
      </div>
    </section>

    <!-- How It Works (extra attractive section) -->
    <section id="how-it-works" class="q-pa-xl">
      <div class="text-center q-mb-xl">
        <h2 class="text-h4 text-lime text-bold">How It Works</h2>
        <p class="text-subtitle2">From onboarding to growth — start accepting payments in minutes.</p>
      </div>
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg card-dark lime-glow text-center tall-card card-with-margins">
            <q-img :src="how1" ratio="1" fit="contain" class="q-mb-md floating" crossorigin="anonymous"
              referrerpolicy="no-referrer" @error="onHowImgError(1)" />
            <div class="text-h6 text-lime text-bold">Sign Up</div>
            <p>Create your merchant profile and upload required documents.</p>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg card-dark lime-glow text-center tall-card card-with-margins">
            <q-img :src="how2" ratio="1" fit="contain" class="q-mb-md floating" crossorigin="anonymous"
              referrerpolicy="no-referrer" @error="onHowImgError(2)" />
            <div class="text-h6 text-lime text-bold">Integrate</div>
            <p>Use our hosted checkout or API to start processing securely.</p>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg card-dark lime-glow text-center tall-card card-with-margins">
            <q-img :src="how3" ratio="1" fit="contain" class="q-mb-md floating" crossorigin="anonymous"
              referrerpolicy="no-referrer" @error="onHowImgError(3)" />
            <div class="text-h6 text-lime text-bold">Grow</div>
            <p>Analyze performance and scale with insights and automation.</p>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Metrics -->
    <section id="metrics" class="q-pa-xl">
      <q-card class="q-pa-xl card-dark lime-glow">
        <div class="row text-center items-stretch">
          <div class="col-6 col-md-3 q-mb-md q-mb-none-md">
            <div class="text-h4 text-lime">120K+</div>
            <div class="text-caption">Users</div>
          </div>
          <div class="col-6 col-md-3 q-mb-md q-mb-none-md">
            <div class="text-h4 text-lime">48</div>
            <div class="text-caption">Countries</div>
          </div>
          <div class="col-6 col-md-3 q-mb-md q-mb-none-md">
            <div class="text-h4 text-lime">$2.3B</div>
            <div class="text-caption">Amount Processed</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-h4 text-lime">99.98%</div>
            <div class="text-caption">Uptime</div>
          </div>
        </div>
      </q-card>
    </section>

    <!-- Partners (gapless continuous marquee) -->
    <section id="partners" class="q-pa-xl">
      <div class="text-center q-mb-md">
        <h2 class="text-h5 text-lime text-bold">Official Partners</h2>
      </div>
      <div class="partners-marquee">
        <div class="track">
          <img v-for="(logo, i) in doubleLogos" :key="i" :src="logo" :alt="'logo-' + i" />
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="q-pa-xl text-center">
      <q-card class="q-pa-xl card-dark lime-glow">
        <div class="text-h5 text-lime text-bold">Ready to scale with FinteckX?</div>
        <div class="q-mt-sm">Onboard in minutes and start accepting secure payments.</div>
        <div class="q-mt-md">
          <q-btn rounded class="btn-gradient q-mx-sm" icon="rocket_launch" label="Get Started" to="/register" />
          <q-btn flat rounded class="btn-outline-light q-mx-sm" icon="info" label="Talk to Sales" to="/" />
        </div>
      </q-card>
    </section>

    <!-- Footer -->
    <footer class="custom-footer q-pa-xl">
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-3">
          <h5 class="text-lime">FinteckX</h5>
          <p>A complete fintech ecosystem designed to scale your payments securely and globally.</p>
        </div>
        <div class="col-6 col-md-2">
          <h6 class="text-bold">Company</h6>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Newsroom</a></li>
          </ul>
        </div>
        <div class="col-6 col-md-2">
          <h6 class="text-bold">Resources</h6>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">API Docs</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
        <div class="col-6 col-md-2">
          <h6 class="text-bold">Legal</h6>
          <ul>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Cookies</a></li>
          </ul>
        </div>
        <div class="col-12 col-md-3">
          <h6 class="text-bold">Follow Us</h6>
          <div class="row q-gutter-sm">
            <q-btn round flat icon="public" />
            <q-btn round flat icon="code" />
            <q-btn round flat icon="business" />
          </div>
        </div>
      </div>
      <div class="text-center q-mt-lg text-caption">
        © {{ new Date().getFullYear() }} FinteckX. All Rights Reserved.
      </div>
    </footer>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isAuthed = ref(false)
const drawerOpen = ref(false)

/**
 * Multi-tier image fallbacks to ensure visibility:
 * - Primary: 3D illustration source
 * - Secondary: Unsplash backup
 * - Tertiary: Dummy branded placeholder
 */
const imageSources = {
  hero: [
    'https://cdn3d.iconscout.com/3d/premium/thumb/online-payment-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--ecommerce-finance-cashless-transaction-pack-illustrations-7517833.png',
    'https://images.unsplash.com/photo-1556742400-b5d3f1b2a9f9?auto=format&fit=crop&w=1400&q=80',
    'https://dummyimage.com/1200x675/121018/bdf000.png&text=FinteckX'
  ],
  reach: [
    'https://cdn3d.iconscout.com/3d/premium/thumb/global-network-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--world-map-connections-earth-business-pack-illustrations-6303322.png',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
    'https://dummyimage.com/1200x675/121018/bdf000.png&text=Global+Reach'
  ],
  security: [
    'https://cdn3d.iconscout.com/3d/premium/thumb/secure-payment-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--security-finance-cashless-transaction-pack-illustrations-7517831.png',
    'https://images.unsplash.com/photo-1605901309584-818e25960a8b?auto=format&fit=crop&w=1400&q=80',
    'https://dummyimage.com/1200x675/121018/bdf000.png&text=Security'
  ]
}

const howSources = {
  1: [
    'https://cdn3d.iconscout.com/3d/premium/thumb/sign-up-3d-illustration-9727193-7887060.png',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    'https://dummyimage.com/800x800/121018/bdf000.png&text=Sign+Up'
  ],
  2: [
    'https://cdn3d.iconscout.com/3d/premium/thumb/payment-gateway-3d-illustration-8470841-6716425.png',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    'https://dummyimage.com/800x800/121018/bdf000.png&text=Integrate'
  ],
  3: [
    'https://cdn3d.iconscout.com/3d/premium/thumb/growth-3d-illustration-5930862-4918115.png',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    'https://dummyimage.com/800x800/121018/bdf000.png&text=Grow'
  ]
}

const heroImg = ref(imageSources.hero[0])
const reachImg = ref(imageSources.reach[0])
const securityImg = ref(imageSources.security[0])

const how1 = ref(howSources[1][0])
const how2 = ref(howSources[2][0])
const how3 = ref(howSources[3][0])

const imageRefs = {
  hero: heroImg,
  reach: reachImg,
  security: securityImg
}

const onImgError = (key) => {
  const srcList = imageSources[key] || []
  const currentRef = imageRefs[key]
  if (!currentRef) return
  const currentIdx = srcList.indexOf(currentRef.value)
  const nextIdx = currentIdx >= 0 ? currentIdx + 1 : 1
  if (nextIdx < srcList.length) {
    currentRef.value = srcList[nextIdx]
  }
}

const onHowImgError = (index) => {
  const list = howSources[index] || []
  const map = { 1: how1, 2: how2, 3: how3 }
  const currentRef = map[index]
  if (!currentRef) return
  const currentIdx = list.indexOf(currentRef.value)
  const nextIdx = currentIdx >= 0 ? currentIdx + 1 : 1
  if (nextIdx < list.length) {
    currentRef.value = list[nextIdx]
  }
}

const logos = [
  'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png',
  'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png',
  'https://upload.wikimedia.org/wikipedia/commons/2/2a/Stripe_Logo%2C_revised_2016.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.png'
]
const doubleLogos = computed(() => [...logos, ...logos])

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const refreshAuth = () => { isAuthed.value = !!localStorage.getItem('auth_token') }
onMounted(refreshAuth)
watch(() => route.fullPath, refreshAuth)
</script>

<style scoped>
/* Float animation */
.floating {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-12px)
  }
}

/* Hero */
.hero-section {
  min-height: 80vh;
  padding: 40px;
}

.hero-img {
  max-width: 92%;
  height: auto;
  border-radius: 12px;
}

/* Section images */
.section-img {
  max-width: 85%;
  height: auto;
  border-radius: 12px;
}

/* Cards */
.card-dark {
  background: #000;
  color: #fff;
  border-radius: 14px;
}

.lime-glow {
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(189, 240, 0, 0.28),
    0 0 24px rgba(189, 240, 0, 0.18);
}

.tall-card {
  min-height: 240px;
}

.card-with-margins {
  margin-top: 12px;
  margin-bottom: 12px;
}

/* Buttons */
.btn-gradient {
  background: linear-gradient(135deg, #bdf000, #ffffff);
  color: #09050d;
  font-weight: 700;
  border: 1px solid rgba(189, 240, 0, 0.5);
}

.btn-outline-light {
  border: 1px solid #fff;
  color: #fff;
}

/* Partners marquee (gapless, masked edges) */
.partners-marquee {
  position: relative;
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(189, 240, 0, 0.25);
  border-radius: 12px;
  -webkit-mask-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent);
  mask-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent);
}

.track {
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 18px 24px;
  width: max-content;
  animation: scroll-left 22s linear infinite;
}

.track img {
  height: 26px;
  width: auto;
  filter: grayscale(100%);
  opacity: 0.9;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }

  /* content duplicated, so -50% loops seamlessly */
}

/* Footer */
.custom-footer {
  background: #000;
  color: #ccc;
}

.custom-footer h5,
.custom-footer h6 {
  color: #bdf000;
}

.custom-footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.custom-footer li {
  margin: 6px 0;
}

.custom-footer a {
  color: #ccc;
  text-decoration: none;
}

.custom-footer a:hover {
  color: #bdf000;
}

/* Lime + header gradient */
.text-lime {
  color: #bdf000;
}

.header-gradient {
  background: linear-gradient(90deg, #09050d 0%, #121018 60%, #171719 100%);
}
</style>
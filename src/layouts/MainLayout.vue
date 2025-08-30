<template>
  <q-layout view="lHh Lpr lFf" class="fintech-layout">
    <!-- Header -->
    <q-header elevated class="text-white header-glass" reveal>
      <q-toolbar class="header-toolbar">
        <q-btn v-if="isAuthed" flat round dense icon="menu" @click="drawerOpen = !drawerOpen" class="q-mr-sm lt-md" />
        <q-toolbar-title class="row items-center no-wrap header-title">
          <div class="logo-container">
            <q-img :src="appLogo" alt="FintechX Logo" width="32px" height="32px" fit="contain" class="app-logo"
              @error="onLogoError" />
            <span class="text-weight-bold text-lime brand-text">FintechX</span>
          </div>
        </q-toolbar-title>

        <div class="gt-sm header-links">
          <q-btn flat dense label="Home" to="/" class="nav-btn" />
          <q-btn flat dense label="Advantages" to="/" @click.prevent="scrollTo('advantages')" class="nav-btn" />
          <q-btn flat dense label="Services" to="/" @click.prevent="scrollTo('services')" class="nav-btn" />
          <q-btn flat dense label="Reviews" to="/" @click.prevent="scrollTo('reviews')" class="nav-btn" />
          <q-btn flat dense label="Users" to="/" @click.prevent="scrollTo('metrics')" class="nav-btn" />
          <q-btn flat dense label="Partners" to="/" @click.prevent="scrollTo('partners')" class="nav-btn" />
        </div>

        <q-space />
        <div class="header-actions">
          <q-btn rounded class="btn-primary q-mr-sm" icon="rocket_launch" label="Get Started"
            @click="navigateToRegister" />
          <q-btn rounded dense class="btn-secondary" icon="login" label="Access" @click="navigateToLogin" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- Page container with conditional home content and router view -->
    <q-page-container>
      <div v-if="isHome">
        <!-- Hero (text left, 3D image right) -->
        <section class="hero-section row items-center">
          <div class="col-12 col-md-6 q-pa-xl hero-content">
            <div class="hero-badge">Next Generation Platform</div>
            <h1 class="text-h2 text-lime text-bold hero-title">Next-Gen Payments <span class="text-white">with
                FintechX</span></h1>
            <p class="text-subtitle1 q-mt-md hero-description">
              Secure. Fast. Scalable. Empowering merchants and users with future-ready payment infrastructure.
            </p>
            <div class="q-mt-xl hero-actions">
              <q-btn rounded class="btn-primary q-mr-md" icon="rocket_launch" label="Get Started"
                @click="navigateToRegister" />
              <q-btn flat rounded class="btn-outline" icon="play_circle" label="Watch Demo" />
            </div>
            <div class="q-mt-xl hero-stats">
              <div class="stat-item">
                <div class="stat-value">200K+</div>
                <div class="stat-label">Active Merchants</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">99.99%</div>
                <div class="stat-label">Uptime</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">48</div>
                <div class="stat-label">Countries</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 text-center hero-visual">
            <q-img :src="heroImg" alt="Fintech 3D" class="hero-img floating-3d" fit="contain" ratio="16/10"
              @error="onImgError('hero')" />
            <div class="hero-glow"></div>
          </div>
        </section>

        <!-- Advantages Section - Left and Right Cards -->
        <section id="advantages" class="section-advantages q-px-xl q-pt-xl q-pb-lg">
          <div class="text-center q-mb-xl section-header">
            <div class="text-h4 text-lime text-bold">Why Choose FintechX</div>
            <p class="text-subtitle2 section-subtitle">Powerful features designed for growth</p>
          </div>

          <!-- First Advantage: Left Card, Right Image -->
          <div class="row items-center q-mb-xl advantage-item">
            <div class="col-12 col-md-6 advantage-content">
              <q-card class="advantage-card card-glass lime-glow slide-in-left">
                <div class="advantage-icon">
                  <q-icon name="public" size="32px" class="text-lime" />
                </div>
                <div class="text-h5 text-lime text-bold q-mt-md">Global Reach</div>
                <p class="q-mt-sm advantage-description">
                  Expand your business with our cross-border payment solutions trusted by thousands of merchants
                  worldwide.
                </p>
                <div class="text-h3 text-lime q-mt-lg">+200K</div>
                <div class="text-caption advantage-stat-label">Active Merchants</div>
              </q-card>
            </div>
            <div class="col-12 col-md-6 text-center advantage-visual">
              <q-img :src="reachImg" alt="Global Reach" class="advantage-img floating slide-in-right" fit="contain"
                ratio="16/10" @error="onImgError('reach')" />
            </div>
          </div>

          <!-- Second Advantage: Left Image, Right Card -->
          <div class="row items-center q-mb-xl advantage-item advantage-reverse">
            <div class="col-12 col-md-6 text-center advantage-visual">
              <q-img :src="securityImg" alt="Security" class="advantage-img floating slide-in-left" fit="contain"
                ratio="16/10" @error="onImgError('security')" />
            </div>
            <div class="col-12 col-md-6 advantage-content">
              <q-card class="advantage-card card-glass lime-glow slide-in-right">
                <div class="advantage-icon">
                  <q-icon name="security" size="32px" class="text-lime" />
                </div>
                <div class="text-h5 text-lime text-bold q-mt-md">Bank-Grade Security</div>
                <p class="q-mt-sm advantage-description">
                  Transactions are encrypted with multi-layer authentication, giving peace of mind to merchants and
                  customers.
                </p>
                <div class="text-h3 text-lime q-mt-lg">99.99%</div>
                <div class="text-caption advantage-stat-label">System Uptime</div>
              </q-card>
            </div>
          </div>

          <!-- Third Advantage: Left Card, Right Image -->
          <div class="row items-center q-mb-xl advantage-item">
            <div class="col-12 col-md-6 advantage-content">
              <q-card class="advantage-card card-glass lime-glow slide-in-left">
                <div class="advantage-icon">
                  <q-icon name="trending_up" size="32px" class="text-lime" />
                </div>
                <div class="text-h5 text-lime text-bold q-mt-md">Smart Analytics</div>
                <p class="q-mt-sm advantage-description">
                  AI-powered insights and real-time analytics help you make data-driven decisions for business growth.
                </p>
                <div class="text-h3 text-lime q-mt-lg">+45%</div>
                <div class="text-caption advantage-stat-label">Revenue Growth</div>
              </q-card>
            </div>
            <div class="col-12 col-md-6 text-center advantage-visual">
              <q-img :src="analyticsImg" alt="Analytics" class="advantage-img floating slide-in-right" fit="contain"
                ratio="16/10" @error="onImgError('analytics')" />
            </div>
          </div>
        </section>

        <!-- Services -->
        <section id="services" class="section-services q-px-xl q-py-lg">
          <div class="text-center q-mb-xl section-header">
            <div class="text-h4 text-lime text-bold">Our Services</div>
            <p class="text-subtitle2 section-subtitle">All-in-one fintech platform for payments, analytics, and growth
            </p>
          </div>
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-4" v-for="(service, index) in services" :key="index">
              <q-card class="service-card card-glass text-center hover-lift" :class="{ 'lime-glow': index === 1 }">
                <div class="service-icon">
                  <q-icon :name="service.icon" size="40px" :class="index === 1 ? 'text-lime' : 'text-white'" />
                </div>
                <div class="text-h6 text-bold q-mt-md" :class="index === 1 ? 'text-lime' : 'text-white'">{{
                  service.title }}</div>
                <p class="q-mt-sm service-description">{{ service.description }}</p>
                <q-btn flat :color="index === 1 ? 'lime' : 'white'" label="Learn more" class="q-mt-md" />
              </q-card>
            </div>
          </div>
        </section>

        <!-- Reviews Section -->
        <section id="reviews" class="section-reviews q-px-xl q-py-lg">
          <div class="text-center q-mb-xl section-header">
            <div class="text-h4 text-lime text-bold">What Our Users Say</div>
            <p class="text-subtitle2 section-subtitle">Trusted by thousands of merchants worldwide</p>
          </div>
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-4" v-for="(review, index) in reviews" :key="index">
              <q-card class="review-card card-glass text-center hover-lift">
                <div class="review-avatar">
                  <q-avatar size="80px" class="review-avatar-img">
                    <q-img :src="review.avatar" @error="onAvatarError(index)" />
                  </q-avatar>
                </div>
                <div class="review-rating q-mt-md">
                  <q-icon v-for="star in 5" :key="star" name="star" size="20px"
                    :class="star <= review.rating ? 'text-yellow' : 'text-grey-6'" />
                </div>
                <div class="text-h6 text-bold q-mt-md text-white">{{ review.name }}</div>
                <div class="text-caption text-lime q-mb-md">{{ review.position }}</div>
                <p class="review-text">{{ review.comment }}</p>
              </q-card>
            </div>
          </div>
        </section>

        <!-- How It Works -->
        <section id="how-it-works" class="section-how-it-works q-px-xl q-py-lg">
          <div class="text-center q-mb-xl section-header">
            <div class="text-h4 text-lime text-bold">How It Works</div>
            <p class="text-subtitle2 section-subtitle">From onboarding to growth — start accepting payments in minutes
            </p>
          </div>
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-4" v-for="(step, index) in howItWorks" :key="index">
              <q-card class="how-card card-glass text-center hover-lift">
                <div class="step-number">{{ index + 1 }}</div>
                <q-img :src="step.image" ratio="1" fit="contain" class="q-mb-md floating-slow"
                  @error="onHowImgError(index + 1)" />
                <div class="text-h6 text-lime text-bold">{{ step.title }}</div>
                <p class="q-mt-sm how-description">{{ step.description }}</p>
              </q-card>
            </div>
          </div>
        </section>

        <!-- Features Grid -->
        <section id="features" class="section-features q-px-xl q-py-lg">
          <div class="text-center q-mb-xl section-header">
            <div class="text-h4 text-lime text-bold">Advanced Features</div>
            <p class="text-subtitle2 section-subtitle">Everything you need to scale your business</p>
          </div>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6 col-lg-3" v-for="(feature, index) in features" :key="index">
              <q-card class="feature-card card-glass text-center hover-lift">
                <div class="feature-icon">
                  <q-icon :name="feature.icon" size="32px" class="text-lime" />
                </div>
                <div class="text-h6 text-bold q-mt-md text-white">{{ feature.title }}</div>
                <p class="q-mt-sm feature-description">{{ feature.description }}</p>
              </q-card>
            </div>
          </div>
        </section>

        <!-- Metrics -->
        <section id="metrics" class="section-metrics q-px-xl q-py-lg">
          <q-card class="metrics-card card-glass lime-glow">
            <div class="row text-center items-stretch metrics-container">
              <div class="col-6 col-md-3 metric-item" v-for="(metric, index) in metrics" :key="index">
                <div class="metric-value">{{ metric.value }}</div>
                <div class="metric-label">{{ metric.label }}</div>
              </div>
            </div>
          </q-card>
        </section>

        <!-- Partners -->
        <section id="partners" class="section-partners q-px-xl q-py-lg">
          <div class="text-center q-mb-lg section-header">
            <div class="text-h5 text-lime text-bold">Trusted by Industry Leaders</div>
          </div>
          <div class="partners-marquee">
            <div class="track">
              <img v-for="(logo, i) in doubleLogos" :key="i" :src="logo" :alt="'logo-' + i" />
            </div>
          </div>
        </section>

        <!-- CTA Banner -->
        <section class="section-cta q-px-xl q-py-lg">
          <q-card class="cta-card card-glass lime-glow">
            <div class="row items-center">
              <div class="col-12 col-md-8">
                <div class="text-h5 text-lime text-bold">Ready to scale with FintechX?</div>
                <div class="q-mt-sm cta-description">Onboard in minutes and start accepting secure payments.</div>
              </div>
              <div class="col-12 col-md-4 text-right">
                <q-btn rounded class="btn-primary q-mr-sm" icon="rocket_launch" label="Get Started"
                  @click="navigateToRegister" />
                <q-btn flat rounded class="btn-outline" icon="info" label="Talk to Sales" />
              </div>
            </div>
          </q-card>
        </section>
      </div>

      <!-- Non-home routes render here (e.g., /register, /login) -->
      <router-view v-else />
    </q-page-container>

    <!-- Footer -->
    <footer class="custom-footer q-px-xl q-pt-xl q-pb-lg">
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-4">
          <div class="footer-brand">
            <q-img :src="appLogo" alt="FintechX Logo" width="40px" height="40px" fit="contain"
              class="q-mr-sm footer-logo" @error="onLogoError" />
            <h5 class="text-lime">FintechX</h5>
          </div>
          <p class="q-mt-md footer-description">A complete fintech ecosystem designed to scale your payments securely
            and globally.</p>
          <div class="row q-gutter-sm q-mt-md">
            <q-btn round flat icon="facebook" class="social-btn" />
            <q-btn round flat icon="code" class="social-btn" />
            <q-btn round flat icon="business" class="social-btn" />
          </div>
        </div>
        <div class="col-6 col-md-2" v-for="(group, index) in footerLinks" :key="index">
          <h6 class="text-bold footer-heading">{{ group.title }}</h6>
          <ul class="footer-links">
            <li v-for="(link, i) in group.links" :key="i"><a :href="link.url">{{ link.label }}</a></li>
          </ul>
        </div>
      </div>
      <div class="text-center q-mt-xl text-caption footer-copyright">
        © {{ new Date().getFullYear() }} FintechX. All Rights Reserved.
      </div>
    </footer>
  </q-layout>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'MainLayout',

  setup() {
    const route = useRoute()
    const router = useRouter()

    const isAuthed = ref(false)
    const drawerOpen = ref(false)
    const isHome = computed(() => route.path === '/' || route.name === 'home')

    // Navigation functions
    const navigateToRegister = () => {
      router.push('/register')
    }

    const navigateToLogin = () => {
      router.push('/login')
    }

    // Data for dynamic content
    const services = ref([
      {
        icon: 'credit_card',
        title: 'Smart Checkout',
        description: 'Fast and seamless checkout experience with multiple payment methods.'
      },
      {
        icon: 'stacked_bar_chart',
        title: 'Analytics',
        description: 'Track and optimize your performance with real-time insights and reporting tools.'
      },
      {
        icon: 'support',
        title: '24/7 Support',
        description: 'Always-on support system to resolve issues instantly and keep business running.'
      }
    ])

    const reviews = ref([
      {
        name: 'Sarah Johnson',
        position: 'CEO, TechStart Inc.',
        rating: 5,
        comment: 'FintechX transformed our payment processing. The analytics helped us increase revenue by 40% in just 3 months.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Michael Chen',
        position: 'Founder, GlobalCommerce',
        rating: 5,
        comment: 'The global reach and security features are unmatched. Our customers trust us more than ever.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Emma Rodriguez',
        position: 'CTO, PaymentFlow',
        rating: 5,
        comment: 'Integration was seamless and the support team is incredibly responsive. Highly recommended!',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    ])

    const features = ref([
      {
        icon: 'api',
        title: 'REST API',
        description: 'Powerful API for custom integrations and automation.'
      },
      {
        icon: 'webhook',
        title: 'Webhooks',
        description: 'Real-time notifications for all payment events.'
      },
      {
        icon: 'shield',
        title: 'Fraud Protection',
        description: 'Advanced AI-powered fraud detection system.'
      },
      {
        icon: 'language',
        title: 'Multi-language',
        description: 'Support for 15+ languages and local currencies.'
      },
      {
        icon: 'mobile_friendly',
        title: 'Mobile First',
        description: 'Optimized for all devices and screen sizes.'
      },
      {
        icon: 'sync',
        title: 'Real-time Sync',
        description: 'Instant synchronization across all platforms.'
      },
      {
        icon: 'backup',
        title: 'Auto Backup',
        description: 'Automatic data backup and disaster recovery.'
      },
      {
        icon: 'speed',
        title: 'High Performance',
        description: 'Lightning-fast processing with 99.99% uptime.'
      }
    ])

    const howItWorks = ref([
      {
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
        title: 'Sign Up',
        description: 'Create your merchant profile and upload required documents.'
      },
      {
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        title: 'Integrate',
        description: 'Use our hosted checkout or API to start processing securely.'
      },
      {
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
        title: 'Grow',
        description: 'Analyze performance and scale with insights and automation.'
      }
    ])

    const metrics = ref([
      { value: '120K+', label: 'Users' },
      { value: '48', label: 'Countries' },
      { value: '$2.3B', label: 'Amount Processed' },
      { value: '99.98%', label: 'Uptime' }
    ])

    const footerLinks = ref([
      {
        title: 'Company',
        links: [
          { label: 'About Us', url: '#' },
          { label: 'Careers', url: '#' },
          { label: 'Newsroom', url: '#' }
        ]
      },
      {
        title: 'Resources',
        links: [
          { label: 'Help Center', url: '#' },
          { label: 'API Docs', url: '#' },
          { label: 'Blog', url: '#' }
        ]
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy', url: '#' },
          { label: 'Terms', url: '#' },
          { label: 'Cookies', url: '#' }
        ]
      }
    ])

    // Fixed image sources using reliable CDNs
    const imageSources = {
      hero: [
        'https://images.unsplash.com/photo-1556742400-b5d3f1b2a9f9?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
        'https://dummyimage.com/1200x675/121018/bdf000.png&text=FintechX+Payments'
      ],
      reach: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
        'https://dummyimage.com/1200x675/121018/bdf000.png&text=Global+Reach'
      ],
      security: [
        'https://images.unsplash.com/photo-1605901309584-818e25960a8b?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
        'https://dummyimage.com/1200x675/121018/bdf000.png&text=Bank+Grade+Security'
      ],
      analytics: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
        'https://dummyimage.com/1200x675/121018/bdf000.png&text=Smart+Analytics'
      ]
    }

    const heroImg = ref(imageSources.hero[0])
    const reachImg = ref(imageSources.reach[0])
    const securityImg = ref(imageSources.security[0])
    const analyticsImg = ref(imageSources.analytics[0])

    const appLogo = ref('https://dummyimage.com/200x200/121018/bdf000.png&text=FX')

    const imageRefs = {
      hero: heroImg,
      reach: reachImg,
      security: securityImg,
      analytics: analyticsImg
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
      // Fallback image sources for how it works section
      const howSources = {
        1: [
          'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
          'https://dummyimage.com/800x800/121018/bdf000.png&text=Sign+Up'
        ],
        2: [
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
          'https://dummyimage.com/800x800/121018/bdf000.png&text=Integrate'
        ],
        3: [
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
          'https://dummyimage.com/800x800/121018/bdf000.png&text=Grow'
        ]
      }

      const list = howSources[index] || []
      const map = { 1: howItWorks.value[0], 2: howItWorks.value[1], 3: howItWorks.value[2] }
      const currentRef = map[index]
      if (!currentRef) return
      const currentIdx = list.indexOf(currentRef.image)
      const nextIdx = currentIdx >= 0 ? currentIdx + 1 : 1
      if (nextIdx < list.length) {
        currentRef.image = list[nextIdx]
      }
    }

    const onAvatarError = (index) => {
      reviews.value[index].avatar = 'https://dummyimage.com/150x150/121018/bdf000.png&text=User'
    }

    const onLogoError = () => {
      appLogo.value = 'https://dummyimage.com/200x200/121018/bdf000.png&text=F'
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

    const refreshAuth = () => { isAuthed.value = !!localStorage.getItem('token') }
    onMounted(refreshAuth)
    watch(() => route.fullPath, refreshAuth)

    return {
      isAuthed,
      drawerOpen,
      isHome,
      services,
      reviews,
      features,
      howItWorks,
      metrics,
      footerLinks,
      heroImg,
      reachImg,
      securityImg,
      analyticsImg,
      appLogo,
      doubleLogos,
      onImgError,
      onHowImgError,
      onAvatarError,
      onLogoError,
      scrollTo,
      navigateToRegister,
      navigateToLogin
    }
  }
}
</script>
<style scoped>
/* Global Styles */
.fintech-layout {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  color: #fff;
}

/* Header Styles */
.header-glass {
  background: rgba(10, 10, 10, 0.85) !important;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(189, 240, 0, 0.15);
}

.header-toolbar {
  padding: 8px 16px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.app-logo {
  border-radius: 10px;
}

.brand-text {
  font-size: 1.4rem;
  margin-left: 10px;
}

.nav-btn {
  color: #cfcfcf !important;
  font-weight: 500;
}

.nav-btn:hover {
  color: #bdf000 !important;
}

/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #09050d;
  font-weight: 700;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(189, 240, 0, 0.4);
}

.btn-secondary {
  background: rgba(189, 240, 0, 0.1);
  color: #bdf000;
  border: 1px solid rgba(189, 240, 0.4);
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(189, 240, 0, 0.2);
  transform: translateY(-2px);
}

.btn-outline {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Card Styles */
.card-glass {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.card-glass:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-5px);
}

.lime-glow {
  box-shadow: 0 0 25px rgba(189, 240, 0, 0.25);
}

.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero-content {
  z-index: 2;
  position: relative;
}

.hero-badge {
  display: inline-block;
  background: rgba(189, 240, 0, 0.15);
  color: #bdf000;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero-description {
  font-size: 1.2rem;
  color: #cfcfcf;
  max-width: 90%;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;
}

.stat-item {
  text-align: left;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #bdf000;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #cfcfcf;
  margin-top: 4px;
}

.hero-visual {
  position: relative;
  z-index: 1;
}

.hero-img {
  max-width: 90%;
  height: auto;
  border-radius: 16px;
  z-index: 2;
  position: relative;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
  filter: blur(60px);
}

/* Section Styles */
.section-header {
  margin-bottom: 60px;
}

.section-subtitle {
  color: #cfcfcf;
  font-size: 1.1rem;
  margin-top: 12px;
}

/* Advantages Section */
.advantage-item {
  margin-bottom: 100px;
}

.advantage-reverse {
  flex-direction: row-reverse;
}

.advantage-card {
  padding: 30px;
  height: 100%;
}

.advantage-icon {
  width: 60px;
  height: 60px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.advantage-description {
  color: #cfcfcf;
  font-size: 1rem;
  line-height: 1.6;
}

.advantage-stat-label {
  color: #cfcfcf;
  font-size: 0.9rem;
}

.advantage-img {
  max-width: 85%;
  height: auto;
  border-radius: 16px;
}

/* Services Section */
.service-card {
  padding: 30px;
  height: 100%;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-8px);
}

.service-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.service-description {
  color: #cfcfcf;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Reviews Section */
.review-card {
  padding: 30px;
  height: 100%;
  position: relative;
}

.review-avatar {
  position: relative;
}

.review-avatar-img {
  border: 3px solid rgba(189, 240, 0.3);
  border-radius: 50%;
}

.review-rating {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.review-text {
  color: #cfcfcf;
  font-size: 0.95rem;
  line-height: 1.6;
  font-style: italic;
}

/* Features Section */
.feature-card {
  padding: 25px;
  height: 100%;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.feature-description {
  color: #cfcfcf;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* How It Works Section */
.how-card {
  padding: 30px;
  height: 100%;
  position: relative;
}

.step-number {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: #bdf000;
  color: #09050d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.how-description {
  color: #cfcfcf;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Metrics Section */
.metrics-card {
  padding: 50px 30px;
}

.metrics-container {
  padding: 20px 0;
}

.metric-item {
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-item:last-child {
  border-right: none;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #bdf000;
  line-height: 1;
  margin-bottom: 8px;
}

.metric-label {
  color: #cfcfcf;
  font-size: 0.9rem;
}

/* Partners Section */
.partners-marquee {
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 30px 0;
  -webkit-mask-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, transparent);
  mask-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, transparent);
}

.track {
  display: flex;
  align-items: center;
  gap: 60px;
  width: max-content;
  animation: scroll-left 30s linear infinite;
}

.track img {
  height: 40px;
  width: auto;
  filter: grayscale(100%) brightness(2);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.track img:hover {
  filter: grayscale(0) brightness(1);
  opacity: 1;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

/* CTA Section */
.cta-card {
  padding: 40px;
}

.cta-description {
  color: #cfcfcf;
  font-size: 1.1rem;
  margin-top: 8px;
}

/* Footer */
.custom-footer {
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.footer-logo {
  border-radius: 12px;
}

.footer-description {
  color: #cfcfcf;
  line-height: 1.6;
}

.social-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #cfcfcf;
}

.social-btn:hover {
  background: rgba(189, 240, 0, 0.2);
  color: #bdf000;
}

.footer-heading {
  color: #bdf000;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #cfcfcf;
  text-decoration: none;
  transition: all 0.2s ease;
}

.footer-links a:hover {
  color: #bdf000;
}

.footer-copyright {
  color: #8f8f8f;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animations */
.floating {
  animation: float 6s ease-in-out infinite;
}

.floating-3d {
  animation: float 8s ease-in-out infinite;
}

.floating-slow {
  animation: float 10s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

/* Slide-in animations */
.slide-in-left {
  animation: slideInLeft 0.8s ease-out;
}

.slide-in-right {
  animation: slideInRight 0.8s ease-out;
}

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(50px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Styles */
@media (max-width: 1023px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-stats {
    gap: 20px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .advantage-item,
  .advantage-reverse {
    flex-direction: column;
  }

  .advantage-content {
    order: 2;
    margin-bottom: 40px;
  }

  .advantage-visual {
    order: 1;
    margin-bottom: 30px;
  }

  .metric-item {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 20px;
    padding-bottom: 30px;
  }

  .metric-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .cta-card .row {
    flex-direction: column;
    gap: 20px;
  }

  .cta-card .text-right {
    text-align: left !important;
  }
}

@media (max-width: 600px) {
  .hero-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats {
    flex-direction: column;
    gap: 20px;
  }

  .track img {
    height: 30px;
  }
}
</style>
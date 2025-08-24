// PATH: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Import all page components
import LandingPage from '../pages/LandingPage.vue'
import Login from '../pages/LoginPage.vue'
import Register from '../pages/RegisterPage.vue'
import Checkout from '../pages/CheckoutPage.vue'
import MerchantDashboard from '../pages/MerchantDashboardPage.vue'
import PaymentStatus from '../pages/PaymentStatus.vue'
import HostedCheckout from '../pages/HostedCheckout.vue'
import TransactionsPage from '../pages/TransactionsPage.vue'
import StatsPage from '../pages/StatsPage.vue'
import AdminDashboardPage from '../pages/AdminDashboardPage.vue'
import AdminActivityPage from '../pages/AdminActivityPage.vue'
import AdminAlertsPage from '../pages/AdminAlertsPage.vue'
import AdminMerchantsPage from '../pages/AdminMerchantsPage.vue'
import AdminProfilePage from '../pages/AdminProfilePage.vue'
import AdminSettingsPage from '../pages/AdminSettingsPage.vue'
import AdminSupportPage from '../pages/AdminSupportPage.vue'

const routes = [
  // Landing and Authentication
  { 
    path: '/', 
    name: 'home', 
    component: LandingPage,
    meta: { title: 'FinteckX - Home' }
  },
  { 
    path: '/login', 
    name: 'login', 
    component: Login,
    meta: { title: 'Login - FinteckX' }
  },
  { 
    path: '/register', 
    name: 'register', 
    component: Register,
    meta: { title: 'Register - FinteckX' }
  },
  
  // Checkout and Payment Routes
  { 
    path: '/checkout', 
    name: 'checkout', 
    component: Checkout,
    meta: { title: 'Checkout - FinteckX' }
  },
  { 
    path: '/checkout/:merchantId', //error in showing data
    name: 'hosted-checkout', 
    component: HostedCheckout,
    meta: { title: 'Secure Checkout - FinteckX' }
  },
  { 
    path: '/payments/status/:id', 
    name: 'payment-status',
    component: PaymentStatus,
    meta: { title: 'Payment Status - FinteckX' }
  },
  
  // Dashboard Routes
  { 
    path: '/dashboard', 
    name: 'dashboard', 
    component: MerchantDashboard,
    meta: { 
      title: 'Merchant Dashboard - FinteckX',
      requiresAuth: true,
      role: 'merchant'
    }
  },
  { 
    path: '/admin-dashboard', //error in showing data
    name: 'admin-dashboard', 
    component: AdminDashboardPage,
    meta: { 
      title: 'Admin Dashboard - FinteckX',
      requiresAuth: true,
      role: 'admin'
    }
  },
  
  // Feature Pages
  { 
    path: '/transactions', 
    name: 'transactions', 
    component: TransactionsPage,
    meta: { 
      title: 'Transactions - FinteckX',
      requiresAuth: true
    }
  },
  { 
    path: '/stats', //incomplete
    name: 'stats', 
    component: StatsPage,
    meta: { 
      title: 'Analytics - FinteckX',
      requiresAuth: true
    }
  },
  
  // Additional Checkout Routes
  { 
    path: '/checkout/embedded/:merchantId', //error in showing data
    name: 'embedded-checkout', 
    component: HostedCheckout,
    meta: { title: 'Embedded Checkout - FinteckX' }
  },
  
  // Payment Processing Routes
  { 
    path: '/payment/process', // missing required parameters
    name: 'payment-process', 
    component: () => import('../components/checkout/CheckoutRouter.vue'),
    meta: { title: 'Processing Payment - FinteckX' }
  },
  
  // Admin Routes
  { 
    path: '/admin/activity',  // this page is under development
    name: 'admin-activity', 
    component: AdminActivityPage,
    meta: { 
      title: 'Activity Log - FinteckX',
      requiresAuth: true,
      role: 'admin'
    }
  },
  { 
    path: '/admin/alerts', //this page is under development
    name: 'admin-alerts', 
    component: AdminAlertsPage,
    meta: { 
      title: 'Alerts - FinteckX',
      requiresAuth: true,
      role: 'admin'
    }
  },
  { 
    path: '/admin/merchants', // not fatch information not show ddata
    name: 'admin-merchants', 
    component: AdminMerchantsPage,
    meta: { 
      title: 'Merchant Management - FinteckX',
      requiresAuth: true,
      role: 'admin'
    }
  },
  { 
    path: '/admin/profile', //show blank page
    name: 'admin-profile', 
    component: AdminProfilePage,
    meta: { 
      title: 'Admin Profile - FinteckX',
      requiresAuth: true,
      role: 'admin'
    }
  },
  { 
    path: '/admin/settings', //this page is under development
    name: 'admin-settings', 
    component: AdminSettingsPage,
    meta: { 
      title: 'Admin Settings - FinteckX',
      requiresAuth: true,
      role: 'admin'
    }
  },
  { 
    path: '/admin/support', // this page is under development
    name: 'admin-support', 
    component: AdminSupportPage,
    meta: { 
      title: 'Admin Support - FinteckX',
      requiresAuth: true,
      role: 'admin'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication and role-based access
// COMMENTED OUT FOR DEVELOPMENT - UNCOMMENT WHEN READY FOR PRODUCTION
router.beforeEach((to, from, next) => {
  if (to.meta.title) document.title = to.meta.title

  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('auth_token')
    if (!token) return next({ name: 'login', query: { redirect: to.fullPath } })

    if (to.meta.role) {
      const userRole = (localStorage.getItem('user_role') || '').toLowerCase()
      if (userRole !== to.meta.role) {
        if (userRole === 'admin') return next({ name: 'admin-dashboard' })
        if (userRole === 'merchant') return next({ name: 'dashboard' })
        return next({ name: 'login' })
      }
    }
  }

  next()
})

// Navigation guard for checkout routes
// COMMENTED OUT FOR DEVELOPMENT - UNCOMMENT WHEN READY FOR PRODUCTION
/*
router.beforeEach((to, from, next) => {
  if (to.name === 'checkout' || to.name === 'hosted-checkout' || to.name === 'embedded-checkout') {
    // Validate required query parameters for checkout
    if (to.name === 'checkout' && !to.query.amount) {
      next({ name: 'home' })
      return
    }
    
    if (to.name === 'hosted-checkout' && !to.params.merchantId) {
      next({ name: 'home' })
      return
    }
  }
  
  next()
})
*/
export default router
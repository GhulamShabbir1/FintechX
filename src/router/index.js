// PATH: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
// Pages
import LandingPage from '../pages/LandingPage.vue'
import Login from '../pages/LoginPage.vue'
import Register from '../pages/RegisterPage.vue'
import Checkout from '../pages/CheckoutPage.vue'
import MerchantDashboard from '../pages/SimpleMerchantDashboard.vue'
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
import PaymentStatusPage from '../pages/PaymentStatus.vue'

const routes = [
  { path: '/', name: 'home', component: LandingPage, meta: { title: 'FinteckX - Home' } },
  { path: '/login', name: 'login', component: Login, meta: { title: 'Login - FinteckX' } },
  { path: '/register', name: 'register', component: Register, meta: { title: 'Register - FinteckX' } },

  { path: '/checkout', name: 'checkout', component: Checkout, meta: { title: 'Checkout - FinteckX' } },
  { path: '/checkout/:merchantId', name: 'hosted-checkout', component: HostedCheckout, meta: { title: 'Secure Checkout - FinteckX' } },
  { path: '/payments/status/:id', name: 'payment-status', component: PaymentStatusPage, meta: { title: 'Payment Status - FinteckX' } },
  { path: '/checkout/embedded/:merchantId', name: 'embedded-checkout', component: HostedCheckout, meta: { title: 'Embedded Checkout - FinteckX' } },

  { path: '/dashboard', name: 'dashboard', component: MerchantDashboard, meta: { title: 'Merchant Dashboard - FinteckX', requiresAuth: true, role: 'merchant' } },
  { path: '/admin-dashboard', name: 'admin-dashboard', component: AdminDashboardPage, meta: { title: 'Admin Dashboard - FinteckX', requiresAuth: true, role: 'admin' } },

  { path: '/transactions', name: 'transactions', component: TransactionsPage, meta: { title: 'Transactions - FinteckX', requiresAuth: true } },
  { path: '/stats', name: 'stats', component: StatsPage, meta: { title: 'Analytics - FinteckX', requiresAuth: true } },

  { path: '/payment/process', name: 'payment-process', component: () => import('../components/checkout/CheckoutRouter.vue'), meta: { title: 'Processing Payment - FinteckX' } },

  { path: '/admin/activity', name: 'admin-activity', component: AdminActivityPage, meta: { title: 'Activity Log - FinteckX', requiresAuth: true, role: 'admin' } },
  { path: '/admin/alerts', name: 'admin-alerts', component: AdminAlertsPage, meta: { title: 'Alerts - FinteckX', requiresAuth: true, role: 'admin' } },
  { path: '/admin/merchants', name: 'admin-merchants', component: AdminMerchantsPage, meta: { title: 'Merchant Management - FinteckX', requiresAuth: true, role: 'admin' } },
  { path: '/admin/profile', name: 'admin-profile', component: AdminProfilePage, meta: { title: 'Admin Profile - FinteckX', requiresAuth: true, role: 'admin' } },
  { path: '/admin/settings', name: 'admin-settings', component: AdminSettingsPage, meta: { title: 'Admin Settings - FinteckX', requiresAuth: true, role: 'admin' } },
  { path: '/admin/support', name: 'admin-support', component: AdminSupportPage, meta: { title: 'Admin Support - FinteckX', requiresAuth: true, role: 'admin' } },
  
  // ✅ Add missing routes
  { path: '/business', name: 'business', redirect: '/dashboard' },
  { path: '/admin/transactions', name: 'admin-transactions', redirect: '/admin/activity' },
  { path: '/admin/analytics', name: 'admin-analytics', redirect: '/admin/activity' },
  { path: '/admin/security', name: 'admin-security', redirect: '/admin/settings' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) document.title = to.meta.title

  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) return next({ name: 'login', query: { redirect: to.fullPath } })

    if (to.meta.role) {
      const userRole = (localStorage.getItem('role') || '').toLowerCase()
      const storedUser = localStorage.getItem('user')
      let userEmail = ''
      
      // ✅ Get user email for admin detection
      try {
        const user = JSON.parse(storedUser || '{}')
        userEmail = user.email || ''
      } catch (e) {
        console.warn('Could not parse stored user')
      }
      
      // ✅ Admin detection - check both role and email
      const isAdmin = userRole === 'admin' || userEmail === 'admin@example.com'
      const isMerchant = userRole === 'merchant' && userEmail !== 'admin@example.com'
      
      if (to.meta.role === 'admin' && !isAdmin) {
        // Non-admin trying to access admin route
        if (isMerchant) return next({ name: 'dashboard' })
        return next({ name: 'login' })
      }
      
      if (to.meta.role === 'merchant' && !isMerchant) {
        // Non-merchant trying to access merchant route
        if (isAdmin) return next({ name: 'admin-dashboard' })
        return next({ name: 'login' })
      }
    }
  }

  next()
})

export default router
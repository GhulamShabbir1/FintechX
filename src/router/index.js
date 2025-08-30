// PATH: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Pages
import LandingPage from '../pages/LandingPage.vue'
import Login from '../pages/LoginPage.vue'
import Register from '../pages/RegisterPage.vue'
import Checkout from '../pages/CheckoutPage.vue'
import MerchantDashboard from '../pages/MerchantDashboardPage.vue'
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
  { path: '/admin/support', name: 'admin-support', component: AdminSupportPage, meta: { title: 'Admin Support - FinteckX', requiresAuth: true, role: 'admin' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router.beforeEach(async (to, from, next) => {
//   if (to.meta.title) document.title = to.meta.title

//   // If already authenticated, prevent going back to login/register
//   const token = localStorage.getItem('token')
//   if (token && (to.name === 'login' || to.name === 'register')) {
//     // Determine best dashboard based on role
//     let role = ''
//     try {
//       const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
//       role = String(storedUser?.role || '').toLowerCase()
//     } catch { 
//       console.log("error")
//     }

//     if (!role) {
//       role = String(localStorage.getItem('role') || '').toLowerCase()
//     }

//     if (role === 'admin') return next({ name: 'admin-dashboard' })
//     if (role === 'merchant') return next({ name: 'dashboard' })
//     return next({ name: 'dashboard' })
//   }

//   // Public routes
//   if (!to.meta.requiresAuth) {
//     return next()
//   }

//   // Require auth
//   if (!token) {
//     return next({ name: 'login', query: { redirect: to.fullPath } })
//   }

//   // Role-based protection
//   if (to.meta.role) {
//     let storedRole = ''

//     // Try multiple sources for role
//     try {
//       const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
//       storedRole = String(storedUser?.role || '').toLowerCase()
//     } catch {
//       console.log("error")
//      }

//     if (!storedRole) {
//       storedRole = String(localStorage.getItem('role') || '').toLowerCase()
//     }

//     // If we still don't have a role, fetch profile once
//     if (!storedRole) {
//       try {
//         console.log('No stored role found, fetching profile...')
//         const resp = await api.get('/api/profile')
//         const profileUser = resp?.data?.user || resp?.data
//         if (profileUser) {
//           localStorage.setItem('user', JSON.stringify(profileUser))
//           localStorage.setItem('role', String(profileUser.role || '').toLowerCase())
//           storedRole = String(profileUser.role || '').toLowerCase()
//           console.log('Role fetched from profile:', storedRole)
//         }
//       } catch (profileError) {
//         console.error('Profile fetch error:', profileError)
//       }
//     }

//     console.log('Current role:', storedRole, 'Required role:', to.meta.role)

//     // If role mismatches, redirect to the appropriate dashboard
//     if (storedRole !== to.meta.role) {
//       if (storedRole === 'admin') return next({ name: 'admin-dashboard' })
//       if (storedRole === 'merchant') return next({ name: 'dashboard' })
//       // Unknown role: force login to refresh context
//       return next({ name: 'login', query: { redirect: to.fullPath } })
//     }
//   }

//   next()
// })

export default router
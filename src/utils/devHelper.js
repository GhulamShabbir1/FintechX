// Development Helper Utilities
export const devHelper = {
  // Admin credentials for quick testing
  adminCredentials: {
    email: 'admin@example.com',
    password: 'password123'
  },

  // Mock data for when backend endpoints are not available
  mockData: {
    adminStats: {
      totalMerchants: 1250,
      merchantsGrowth: 12,
      totalTransactions: 45680,
      transactionsGrowth: 8,
      totalRevenue: 2450000,
      revenueGrowth: 15,
      systemHealth: 99
    },

    merchantProfile: {
      business_name: 'Test Business',
      email: 'merchant@example.com',
      bank_account_name: 'Test Account',
      status: 'approved',
      logo_url: 'https://dummyimage.com/200x200/121018/bdf000.png&text=Logo'
    },

    transactions: [
      {
        id: 1,
        customer_name: 'John Doe',
        amount: 9999,
        status: 'completed',
        created_at: new Date().toISOString(),
        customer_email: 'john@example.com'
      },
      {
        id: 2,
        customer_name: 'Jane Smith',
        amount: 5500,
        status: 'pending',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        customer_email: 'jane@example.com'
      }
    ]
  },

  // Check if we're in development mode
  isDevelopment() {
    return import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development'
  },

  // Log helper for development
  log(message, data = null) {
    if (this.isDevelopment()) {
      console.log(`🔧 [DEV] ${message}`, data || '')
    }
  },

  // Error helper for development
  error(message, error = null) {
    if (this.isDevelopment()) {
      console.error(`❌ [DEV] ${message}`, error || '')
    }
  },

  // Create mock user based on email
  createMockUser(email) {
    if (email === 'admin@example.com') {
      return {
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin'
      }
    } else {
      return {
        email: email,
        name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
        role: 'merchant'
      }
    }
  },

  // Test if backend endpoint is available
  async testEndpoint(api, endpoint) {
    try {
      const response = await api.get(endpoint)
      this.log(`Endpoint ${endpoint} is available`, response.status)
      return true
    } catch (error) {
      this.error(`Endpoint ${endpoint} is not available`, error.response?.status)
      return false
    }
  }
}

export default devHelper
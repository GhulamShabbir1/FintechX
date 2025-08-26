<template>
  <q-layout view="lHh Lpr lFf">
    <AdminHeader />
    <q-page-container>
      <q-page class="admin-support-page">
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
            <q-breadcrumbs-el icon="support" label="Support" />
          </q-breadcrumbs>
        </div>
        
        <div class="admin-content">
          <!-- Support Statistics -->
          <div class="row q-col-gutter-lg q-mb-lg">
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="help_outline" size="40px" color="blue" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value text-blue">{{ supportStats.open }}</div>
                    <div class="stats-label">Open Tickets</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="schedule" size="40px" color="orange" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value text-orange">{{ supportStats.pending }}</div>
                    <div class="stats-label">Pending Response</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="check_circle" size="40px" color="green" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value text-green">{{ supportStats.resolved }}</div>
                    <div class="stats-label">Resolved Today</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card class="stats-card lime-glow">
                <q-card-section>
                  <div class="stats-icon">
                    <q-icon name="trending_up" size="40px" color="lime" />
                  </div>
                  <div class="stats-content">
                    <div class="stats-value text-lime">{{ supportStats.satisfaction }}%</div>
                    <div class="stats-label">Satisfaction Rate</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="row q-col-gutter-lg">
            <!-- Support Tickets List -->
            <div class="col-12 col-lg-8">
              <q-card class="lime-glow">
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="text-h6 text-lime">Support Tickets</div>
                    <q-space />
                    <q-btn color="lime" icon="add" label="New Ticket" @click="showNewTicketDialog = true" />
                  </div>

                  <!-- Ticket Filters -->
                  <div class="row q-col-gutter-md q-mb-lg">
                    <div class="col-12 col-md-3">
                      <q-input
                        v-model="ticketFilters.search"
                        placeholder="Search tickets..."
                        outlined
                        dense
                        clearable
                        @input="applyFilters"
                      >
                        <template v-slot:prepend>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-2">
                      <q-select
                        v-model="ticketFilters.status"
                        :options="statusOptions"
                        label="Status"
                        outlined
                        dense
                        clearable
                        @update:model-value="applyFilters"
                      />
                    </div>
                    <div class="col-12 col-md-2">
                      <q-select
                        v-model="ticketFilters.priority"
                        :options="priorityOptions"
                        label="Priority"
                        outlined
                        dense
                        clearable
                        @update:model-value="applyFilters"
                      />
                    </div>
                    <div class="col-12 col-md-2">
                      <q-select
                        v-model="ticketFilters.category"
                        :options="categoryOptions"
                        label="Category"
                        outlined
                        dense
                        clearable
                        @update:model-value="applyFilters"
                      />
                    </div>
                    <div class="col-12 col-md-2">
                      <q-select
                        v-model="ticketFilters.assignee"
                        :options="assigneeOptions"
                        label="Assignee"
                        outlined
                        dense
                        clearable
                        @update:model-value="applyFilters"
                      />
                    </div>
                    <div class="col-12 col-md-1">
                      <q-btn
                        color="lime"
                        icon="refresh"
                        @click="loadTickets"
                        class="full-width"
                      />
                    </div>
                  </div>

                  <!-- Tickets List -->
                  <div v-if="loading" class="text-center q-pa-xl">
                    <q-spinner-dots color="lime" size="50px" />
                    <div class="text-caption text-grey-6 q-mt-md">Loading tickets...</div>
                  </div>

                  <div v-else class="tickets-list">
                    <div
                      v-for="ticket in filteredTickets"
                      :key="ticket.id"
                      class="ticket-item"
                      :class="[`ticket-${ticket.priority}`]"
                      @click="selectTicket(ticket)"
                    >
                      <div class="ticket-header">
                        <div class="ticket-id">#{{ ticket.id }}</div>
                        <div class="ticket-status">
                          <q-chip
                            :color="getStatusColor(ticket.status)"
                            text-color="white"
                            size="sm"
                          >
                            {{ ticket.status }}
                          </q-chip>
                        </div>
                      </div>
                      
                      <div class="ticket-title">{{ ticket.title }}</div>
                      <div class="ticket-description">{{ ticket.description }}</div>
                      
                      <div class="ticket-meta">
                        <div class="ticket-meta-item">
                          <q-icon name="person" size="sm" />
                          <span>{{ ticket.requester }}</span>
                        </div>
                        <div class="ticket-meta-item">
                          <q-icon name="category" size="sm" />
                          <span>{{ ticket.category }}</span>
                        </div>
                        <div class="ticket-meta-item">
                          <q-icon name="flag" size="sm" />
                          <q-chip
                            :color="getPriorityColor(ticket.priority)"
                            text-color="white"
                            size="xs"
                          >
                            {{ ticket.priority }}
                          </q-chip>
                        </div>
                        <div class="ticket-meta-item">
                          <q-icon name="schedule" size="sm" />
                          <span>{{ formatTime(ticket.createdAt) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- No Tickets Message -->
                    <div v-if="filteredTickets.length === 0" class="text-center q-pa-xl">
                      <q-icon name="support" size="64px" color="grey-5" />
                      <div class="text-h6 text-grey-5 q-mt-md">No Support Tickets</div>
                      <div class="text-caption text-grey-6">All tickets have been resolved</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Ticket Details Sidebar -->
            <div class="col-12 col-lg-4">
              <q-card v-if="selectedTicket" class="lime-glow ticket-details">
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="text-h6 text-lime">Ticket #{{ selectedTicket.id }}</div>
                    <q-space />
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      @click="selectedTicket = null"
                    />
                  </div>

                  <div class="ticket-detail-content">
                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Title</div>
                      <div class="detail-value">{{ selectedTicket.title }}</div>
                    </div>

                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Description</div>
                      <div class="detail-value">{{ selectedTicket.description }}</div>
                    </div>

                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Status</div>
                      <q-select
                        v-model="selectedTicket.status"
                        :options="statusOptions"
                        outlined
                        dense
                        @update:model-value="updateTicketStatus"
                      />
                    </div>

                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Priority</div>
                      <q-select
                        v-model="selectedTicket.priority"
                        :options="priorityOptions"
                        outlined
                        dense
                        @update:model-value="updateTicketPriority"
                      />
                    </div>

                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Assignee</div>
                      <q-select
                        v-model="selectedTicket.assignee"
                        :options="assigneeOptions"
                        outlined
                        dense
                        @update:model-value="updateTicketAssignee"
                      />
                    </div>

                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Category</div>
                      <div class="detail-value">{{ selectedTicket.category }}</div>
                    </div>

                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Requester</div>
                      <div class="detail-value">{{ selectedTicket.requester }}</div>
                    </div>

                    <div class="detail-section q-mb-md">
                      <div class="detail-label">Created</div>
                      <div class="detail-value">{{ formatFullTime(selectedTicket.createdAt) }}</div>
                    </div>
                  </div>

                  <!-- Ticket Actions -->
                  <div class="ticket-actions q-mt-lg">
                    <q-btn
                      color="green"
                      icon="check"
                      label="Resolve"
                      @click="resolveTicket"
                      class="full-width q-mb-sm"
                      v-if="selectedTicket.status !== 'resolved'"
                    />
                    <q-btn
                      color="blue"
                      icon="email"
                      label="Send Response"
                      @click="showResponseDialog = true"
                      class="full-width q-mb-sm"
                    />
                    <q-btn
                      color="orange"
                      icon="assignment_ind"
                      label="Assign to Me"
                      @click="assignToMe"
                      class="full-width"
                      v-if="selectedTicket.assignee !== currentUser"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Quick Actions -->
              <q-card class="lime-glow q-mt-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Quick Actions</div>
                  <div class="quick-actions">
                    <q-btn
                      flat
                      icon="analytics"
                      label="View Reports"
                      class="full-width q-mb-sm action-btn"
                      @click="viewReports"
                    />
                    <q-btn
                      flat
                      icon="download"
                      label="Export Tickets"
                      class="full-width q-mb-sm action-btn"
                      @click="exportTickets"
                    />
                    <q-btn
                      flat
                      icon="settings"
                      label="Support Settings"
                      class="full-width action-btn"
                      @click="showSettingsDialog = true"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- New Ticket Dialog -->
        <q-dialog v-model="showNewTicketDialog" persistent>
          <q-card class="new-ticket-dialog">
            <q-card-section>
              <div class="text-h6">Create New Support Ticket</div>
            </q-card-section>
            
            <q-card-section>
              <q-form @submit="createTicket" class="q-gutter-md">
                <q-input
                  v-model="newTicket.title"
                  label="Title"
                  outlined
                  dense
                  required
                  :rules="[val => !!val || 'Title is required']"
                />
                <q-textarea
                  v-model="newTicket.description"
                  label="Description"
                  outlined
                  rows="4"
                  required
                  :rules="[val => !!val || 'Description is required']"
                />
                <q-select
                  v-model="newTicket.category"
                  :options="categoryOptions"
                  label="Category"
                  outlined
                  dense
                  required
                />
                <q-select
                  v-model="newTicket.priority"
                  :options="priorityOptions"
                  label="Priority"
                  outlined
                  dense
                  required
                />
                <q-input
                  v-model="newTicket.requester"
                  label="Requester Email"
                  type="email"
                  outlined
                  dense
                  required
                  :rules="[val => !!val || 'Requester email is required']"
                />
                
                <div class="q-mt-lg">
                  <q-btn type="submit" color="lime" label="Create Ticket" :loading="creating" />
                  <q-btn flat label="Cancel" @click="showNewTicketDialog = false" class="q-ml-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Response Dialog -->
        <q-dialog v-model="showResponseDialog" persistent>
          <q-card class="response-dialog">
            <q-card-section>
              <div class="text-h6">Send Response</div>
            </q-card-section>
            
            <q-card-section>
              <q-form @submit="sendResponse" class="q-gutter-md">
                <q-input
                  v-model="response.subject"
                  label="Subject"
                  outlined
                  dense
                  required
                />
                <q-textarea
                  v-model="response.message"
                  label="Message"
                  outlined
                  rows="6"
                  required
                  :rules="[val => !!val || 'Message is required']"
                />
                <q-toggle
                  v-model="response.resolveTicket"
                  label="Mark ticket as resolved"
                  color="lime"
                />
                
                <div class="q-mt-lg">
                  <q-btn type="submit" color="lime" label="Send Response" :loading="sending" />
                  <q-btn flat label="Cancel" @click="showResponseDialog = false" class="q-ml-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import AdminHeader from '../components/navigation/AdminHeader.vue'
import api from '../boot/axios'

// Reactive data
const loading = ref(false)
const creating = ref(false)
const sending = ref(false)
const showNewTicketDialog = ref(false)
const showResponseDialog = ref(false)
const showSettingsDialog = ref(false)
const selectedTicket = ref(null)
const currentUser = ref('admin@finteckx.com')

const tickets = ref([])
const supportStats = ref({
  open: 12,
  pending: 8,
  resolved: 25,
  satisfaction: 94
})

const ticketFilters = ref({
  search: '',
  status: null,
  priority: null,
  category: null,
  assignee: null
})

const newTicket = ref({
  title: '',
  description: '',
  category: null,
  priority: 'medium',
  requester: ''
})

const response = ref({
  subject: '',
  message: '',
  resolveTicket: false
})

const statusOptions = ['open', 'pending', 'in_progress', 'resolved', 'closed']
const priorityOptions = ['low', 'medium', 'high', 'urgent']
const categoryOptions = ['technical', 'billing', 'account', 'feature_request', 'bug_report', 'general']
const assigneeOptions = ['admin@finteckx.com', 'support1@finteckx.com', 'support2@finteckx.com', 'unassigned']

// Computed
const filteredTickets = computed(() => {
  let result = tickets.value

  if (ticketFilters.value.search) {
    const search = ticketFilters.value.search.toLowerCase()
    result = result.filter(ticket =>
      ticket.title.toLowerCase().includes(search) ||
      ticket.description.toLowerCase().includes(search) ||
      ticket.requester.toLowerCase().includes(search)
    )
  }

  if (ticketFilters.value.status) {
    result = result.filter(ticket => ticket.status === ticketFilters.value.status)
  }

  if (ticketFilters.value.priority) {
    result = result.filter(ticket => ticket.priority === ticketFilters.value.priority)
  }

  if (ticketFilters.value.category) {
    result = result.filter(ticket => ticket.category === ticketFilters.value.category)
  }

  if (ticketFilters.value.assignee) {
    result = result.filter(ticket => ticket.assignee === ticketFilters.value.assignee)
  }

  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// Methods
const loadTickets = async () => {
  try {
    loading.value = true
    const response = await api.get('/api/admin/support/tickets')
    tickets.value = response.data.tickets || getDemoTickets()
    supportStats.value = response.data.stats || supportStats.value
  } catch (error) {
    console.error('Failed to load tickets:', error)
    tickets.value = getDemoTickets()
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Filters are applied through computed property
}

const selectTicket = (ticket) => {
  selectedTicket.value = ticket
}

const getStatusColor = (status) => {
  const colorMap = {
    open: 'blue',
    pending: 'orange',
    in_progress: 'purple',
    resolved: 'green',
    closed: 'grey'
  }
  return colorMap[status] || 'grey'
}

const getPriorityColor = (priority) => {
  const colorMap = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }
  return colorMap[priority] || 'grey'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  
  return date.toLocaleDateString()
}

const formatFullTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const updateTicketStatus = async () => {
  try {
    await api.put(`/api/admin/support/tickets/${selectedTicket.value.id}/status`, {
      status: selectedTicket.value.status
    })
    const ticket = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (ticket) {
      ticket.status = selectedTicket.value.status
    }
    Notify.create({
      type: 'positive',
      message: 'Ticket status updated',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to update ticket status:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update ticket status',
      position: 'top'
    })
  }
}

const updateTicketPriority = async () => {
  try {
    await api.put(`/api/admin/support/tickets/${selectedTicket.value.id}/priority`, {
      priority: selectedTicket.value.priority
    })
    const ticket = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (ticket) {
      ticket.priority = selectedTicket.value.priority
    }
    Notify.create({
      type: 'positive',
      message: 'Ticket priority updated',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to update ticket priority:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update ticket priority',
      position: 'top'
    })
  }
}

const updateTicketAssignee = async () => {
  try {
    await api.put(`/api/admin/support/tickets/${selectedTicket.value.id}/assignee`, {
      assignee: selectedTicket.value.assignee
    })
    const ticket = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (ticket) {
      ticket.assignee = selectedTicket.value.assignee
    }
    Notify.create({
      type: 'positive',
      message: 'Ticket assignee updated',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to update ticket assignee:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update ticket assignee',
      position: 'top'
    })
  }
}

const resolveTicket = async () => {
  try {
    await api.put(`/api/admin/support/tickets/${selectedTicket.value.id}/resolve`)
    selectedTicket.value.status = 'resolved'
    const ticket = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (ticket) {
      ticket.status = 'resolved'
    }
    supportStats.value.resolved += 1
    Notify.create({
      type: 'positive',
      message: 'Ticket resolved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to resolve ticket:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to resolve ticket',
      position: 'top'
    })
  }
}

const assignToMe = async () => {
  try {
    selectedTicket.value.assignee = currentUser.value
    await updateTicketAssignee()
  } catch (error) {
    console.error('Failed to assign ticket:', error)
  }
}

const createTicket = async () => {
  try {
    creating.value = true
    const response = await api.post('/api/admin/support/tickets', newTicket.value)
    tickets.value.unshift(response.data)
    showNewTicketDialog.value = false
    newTicket.value = { title: '', description: '', category: null, priority: 'medium', requester: '' }
    Notify.create({
      type: 'positive',
      message: 'Support ticket created successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to create ticket:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to create ticket',
      position: 'top'
    })
  } finally {
    creating.value = false
  }
}

const sendResponse = async () => {
  try {
    sending.value = true
    await api.post(`/api/admin/support/tickets/${selectedTicket.value.id}/response`, response.value)
    
    if (response.value.resolveTicket) {
      selectedTicket.value.status = 'resolved'
      const ticket = tickets.value.find(t => t.id === selectedTicket.value.id)
      if (ticket) {
        ticket.status = 'resolved'
      }
    }
    
    showResponseDialog.value = false
    response.value = { subject: '', message: '', resolveTicket: false }
    Notify.create({
      type: 'positive',
      message: 'Response sent successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to send response:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to send response',
      position: 'top'
    })
  } finally {
    sending.value = false
  }
}

const viewReports = () => {
  Notify.create({
    type: 'info',
    message: 'Support reports feature coming soon',
    position: 'top'
  })
}

const exportTickets = async () => {
  try {
    const response = await api.get('/api/admin/support/tickets/export', {
      responseType: 'blob',
      params: ticketFilters.value
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `support-tickets-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    Notify.create({
      type: 'positive',
      message: 'Support tickets exported successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to export tickets:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export tickets',
      position: 'top'
    })
  }
}

const getDemoTickets = () => [
  {
    id: 'TKT001',
    title: 'Payment Gateway Integration Issue',
    description: 'Unable to process payments through Stripe gateway. Getting timeout errors.',
    status: 'open',
    priority: 'high',
    category: 'technical',
    requester: 'merchant@techcorp.com',
    assignee: 'support1@finteckx.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: 'TKT002',
    title: 'Account Verification Pending',
    description: 'Submitted business documents 3 days ago but account is still pending verification.',
    status: 'pending',
    priority: 'medium',
    category: 'account',
    requester: 'owner@foodexpress.com',
    assignee: 'admin@finteckx.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 'TKT003',
    title: 'Transaction Fees Inquiry',
    description: 'Need clarification on transaction fee structure for high volume merchants.',
    status: 'in_progress',
    priority: 'low',
    category: 'billing',
    requester: 'finance@bigstore.com',
    assignee: 'support2@finteckx.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
  },
  {
    id: 'TKT004',
    title: 'Dashboard Not Loading',
    description: 'Merchant dashboard shows blank page after login. Browser console shows JS errors.',
    status: 'resolved',
    priority: 'urgent',
    category: 'bug_report',
    requester: 'admin@quickpay.com',
    assignee: 'admin@finteckx.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
  },
  {
    id: 'TKT005',
    title: 'Feature Request: Recurring Payments',
    description: 'Would like to implement recurring payment functionality for subscription services.',
    status: 'open',
    priority: 'medium',
    category: 'feature_request',
    requester: 'dev@subscriptionapp.com',
    assignee: 'unassigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
  }
]

// Lifecycle
onMounted(() => {
  loadTickets()
})
</script>

<style scoped>
.admin-support-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.breadcrumb-section {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.admin-content {
  padding: 20px;
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(189, 240, 0, 0.2),
              0 0 20px rgba(189, 240, 0, 0.15);
  background: #121212;
  border-radius: 12px;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-card .q-card__section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 50%;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 1.8rem;
  font-weight: 700;
}

.stats-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.ticket-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border-left: 4px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ticket-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.ticket-item.ticket-urgent {
  border-left-color: #f44336;
}

.ticket-item.ticket-high {
  border-left-color: #ff9800;
}

.ticket-item.ticket-medium {
  border-left-color: #2196f3;
}

.ticket-item.ticket-low {
  border-left-color: #4caf50;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ticket-id {
  font-weight: 700;
  color: #bdf000;
}

.ticket-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.ticket-description {
  color: #cccccc;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.8rem;
  color: #999;
}

.ticket-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ticket-details {
  position: sticky;
  top: 20px;
}

.ticket-detail-content {
  max-height: 400px;
  overflow-y: auto;
}

.detail-section {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.8rem;
  color: #bdf000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  color: #ffffff;
  word-wrap: break-word;
}

.ticket-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  justify-content: flex-start;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: rgba(189, 240, 0, 0.3);
  background: rgba(189, 240, 0, 0.05);
  transform: translateX(5px);
}

.new-ticket-dialog,
.response-dialog {
  min-width: 500px;
  max-width: 80vw;
  background: #121212;
  color: #ffffff;
}

.text-lime {
  color: #bdf000;
}

.text-grey-6 {
  color: #999;
}

.text-grey-5 {
  color: #aaa;
}

.text-blue {
  color: #2196f3;
}

.text-orange {
  color: #ff9800;
}

.text-green {
  color: #4caf50;
}

/* Responsive */
@media (max-width: 1024px) {
  .ticket-details {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }
  
  .ticket-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .new-ticket-dialog,
  .response-dialog {
    min-width: 320px;
  }
  
  .tickets-list {
    max-height: none;
  }
}
</style>
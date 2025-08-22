<template>
  <div class="merchant-management">
    <!-- Header with actions -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h6 text-lime">Merchant Management</div>
        <div class="text-caption text-grey-6">Manage merchant registrations and approvals</div>
      </div>
      <div class="col-auto">
        <q-btn color="lime" icon="add" label="Add Merchant" @click="showAddDialog = true" />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow">
          <q-card-section class="text-center">
            <div class="text-h4 text-lime">{{ stats.total }}</div>
            <div class="text-caption">Total Merchants</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow">
          <q-card-section class="text-center">
            <div class="text-h4 text-orange">{{ stats.pending }}</div>
            <div class="text-caption">Pending Approval</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow">
          <q-card-section class="text-center">
            <div class="text-h4 text-green">{{ stats.verified }}</div>
            <div class="text-caption">Verified</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow">
          <q-card-section class="text-center">
            <div class="text-h4 text-red">{{ stats.rejected }}</div>
            <div class="text-caption">Rejected</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters and Search -->
    <q-card class="q-mb-md lime-glow">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.search"
              placeholder="Search merchants..."
              dense
              outlined
              clearable
              @update:model-value="onSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              clearable
              @update:model-value="onFilter"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.sortBy"
              :options="sortOptions"
              label="Sort By"
              dense
              outlined
              @update:model-value="onSort"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              color="grey"
              icon="refresh"
              label="Refresh"
              @click="loadMerchants"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Merchants Table -->
    <q-card class="lime-glow">
      <q-card-section>
        <q-table
          :rows="merchants"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @request="onRequest"
          class="merchant-table"
        >
          <!-- Status Column -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value)"
                :label="props.value"
                size="sm"
                class="status-chip"
              />
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                @click="openMenu($event, props.row)"
                class="action-btn"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add Merchant Dialog -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Add New Merchant</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="addMerchant" class="q-gutter-md">
            <q-input
              v-model="newMerchant.business_name"
              label="Business Name"
              outlined
              dense
              :rules="[val => !!val || 'Business name is required']"
            />
            <q-input
              v-model="newMerchant.email"
              label="Email"
              type="email"
              outlined
              dense
              :rules="[
                val => !!val || 'Email is required',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
              ]"
            />
            <q-input
              v-model="newMerchant.phone"
              label="Phone"
              outlined
              dense
              :rules="[val => !!val || 'Phone is required']"
            />
            <q-input
              v-model="newMerchant.address"
              label="Address"
              outlined
              dense
              type="textarea"
              rows="2"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Add Merchant" @click="addMerchant" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Merchant Detail Dialog -->
    <q-dialog v-model="showDetailDialog" maximized>
      <q-card class="merchant-detail-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Merchant Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-lg">
            <!-- Basic Info -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Basic Information</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Business Name</div>
                      <div class="text-body1">{{ selectedMerchant?.business_name }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Email</div>
                      <div class="text-body1">{{ selectedMerchant?.email }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Phone</div>
                      <div class="text-body1">{{ selectedMerchant?.phone }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Status</div>
                      <q-chip
                        :color="getStatusColor(selectedMerchant?.status)"
                        :label="selectedMerchant?.status"
                        size="sm"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Documents -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Documents</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4" v-if="selectedMerchant?.business_license">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="description" size="48px" color="lime" />
                          <div class="text-subtitle2 q-mt-sm">Business License</div>
                          <q-btn flat color="lime" label="View" @click="viewDocument(selectedMerchant.business_license)" />
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-12 col-md-4" v-if="selectedMerchant?.id_proof">
                      <q-card flat bordered>
                        <q-card-section class="text-center">
                          <q-icon name="badge" size="48px" color="lime" />
                          <div class="text-subtitle2 q-mt-sm">ID Proof</div>
                          <q-btn flat color="lime" label="View" @click="viewDocument(selectedMerchant.id_proof)" />
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn
            v-if="selectedMerchant?.status === 'Pending'"
            color="green"
            label="Approve"
            @click="approveMerchant(selectedMerchant)"
          />
          <q-btn
            v-if="selectedMerchant?.status === 'Pending'"
            color="red"
            label="Reject"
            @click="rejectMerchant(selectedMerchant)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Merchant Menu -->
    <q-menu ref="merchantMenu">
      <q-list style="min-width: 150px">
        <q-item clickable v-close-popup @click="viewMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="visibility" />
          </q-item-section>
          <q-item-section>View Details</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="editMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="suspendMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="block" />
          </q-item-section>
          <q-item-section>Suspend</q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item clickable v-close-popup @click="deleteMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="delete" color="red" />
          </q-item-section>
          <q-item-section class="text-red">Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'

const $q = useQuasar()

// Reactive data
const loading = ref(false)
const merchants = ref([])
const selectedMerchant = ref(null)
const menuMerchant = ref(null)
const showDetailDialog = ref(false)
const showAddDialog = ref(false)
const merchantMenu = ref(null)

// Filters and pagination
const filters = ref({
  search: '',
  status: null,
  sortBy: 'created_at'
})

const pagination = ref({
  sortBy: 'created_at',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// New merchant form
const newMerchant = ref({
  business_name: '',
  email: '',
  phone: '',
  address: ''
})

// Computed stats
const stats = computed(() => {
  const total = merchants.value.length
  const pending = merchants.value.filter(m => m.status === 'Pending').length
  const verified = merchants.value.filter(m => m.status === 'Verified').length
  const rejected = merchants.value.filter(m => m.status === 'Rejected').length
  
  return { total, pending, verified, rejected }
})

// Options for filters
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'Pending' },
  { label: 'Verified', value: 'Verified' },
  { label: 'Rejected', value: 'Rejected' }
]

const sortOptions = [
  { label: 'Date Created', value: 'created_at' },
  { label: 'Business Name', value: 'business_name' },
  { label: 'Status', value: 'status' }
]

// Table columns
const columns = [
  {
    name: 'business_name',
    label: 'Business Name',
    field: 'business_name',
    sortable: true,
    align: 'left'
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    sortable: true,
    align: 'left'
  },
  {
    name: 'phone',
    label: 'Phone',
    field: 'phone',
    sortable: false,
    align: 'left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    align: 'center'
  },
  {
    name: 'created_at',
    label: 'Created',
    field: 'created_at',
    sortable: true,
    align: 'center'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    sortable: false,
    align: 'center'
  }
]

// Methods
const loadMerchants = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/admin/merchants')
    merchants.value = response.data.merchants || []
  } catch (error) {
    console.error('Error loading merchants:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load merchants'
    })
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  // Implement search logic
  loadMerchants()
}

const onFilter = () => {
  // Implement filter logic
  loadMerchants()
}

const onSort = () => {
  // Implement sort logic
  loadMerchants()
}

const onRequest = (props) => {
  pagination.value = props.pagination
  loadMerchants()
}

const openMenu = (event, merchant) => {
  menuMerchant.value = merchant
  merchantMenu.value.show(event)
}

const viewMerchant = (merchant) => {
  selectedMerchant.value = merchant
  showDetailDialog.value = true
}

const editMerchant = (merchant) => {
  // Implement edit logic
  console.log('Edit merchant:', merchant)
}

const suspendMerchant = (merchant) => {
  // Implement suspend logic
  console.log('Suspend merchant:', merchant)
}

const deleteMerchant = (merchant) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete ${merchant.business_name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/api/admin/merchants/${merchant.id}`)
      await loadMerchants()
      $q.notify({
        type: 'positive',
        message: 'Merchant deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting merchant:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to delete merchant'
      })
    }
  })
}

const approveMerchant = async (merchant) => {
  try {
    await api.patch(`/api/admin/merchants/${merchant.id}/approve`)
    await loadMerchants()
    showDetailDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Merchant approved successfully'
    })
  } catch (error) {
    console.error('Error approving merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to approve merchant'
    })
  }
}

const rejectMerchant = async (merchant) => {
  try {
    await api.patch(`/api/admin/merchants/${merchant.id}/reject`)
    await loadMerchants()
    showDetailDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Merchant rejected successfully'
    })
  } catch (error) {
    console.error('Error rejecting merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to reject merchant'
    })
  }
}

const addMerchant = async () => {
  try {
    await api.post('/api/admin/merchants', newMerchant.value)
    await loadMerchants()
    showAddDialog.value = false
    newMerchant.value = { business_name: '', email: '', phone: '', address: '' }
    $q.notify({
      type: 'positive',
      message: 'Merchant added successfully'
    })
  } catch (error) {
    console.error('Error adding merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to add merchant'
    })
  }
}

const viewDocument = (documentUrl) => {
  window.open(documentUrl, '_blank')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'orange'
    case 'Verified': return 'green'
    case 'Rejected': return 'red'
    default: return 'grey'
  }
}

// Lifecycle
onMounted(() => {
  loadMerchants()
})
</script>

<style scoped>
.merchant-management {
  padding: 20px;
}

.stat-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(189, 240, 0.15);
}

.lime-glow {
  background: rgba(189, 240, 0, 0.02);
  border: 1px solid rgba(189, 240, 0.1);
  box-shadow: 0 2px 10px rgba(189, 240, 0.05);
}

.merchant-table {
  background: transparent;
}

.status-chip {
  font-weight: 500;
}

.action-btn {
  color: #666;
}

.action-btn:hover {
  color: #bdf000;
}

.merchant-detail-dialog {
  max-width: 800px;
}

/* Animation classes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
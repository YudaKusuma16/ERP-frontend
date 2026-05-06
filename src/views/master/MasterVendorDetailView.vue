<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="vendor">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <router-link :to="{ name: 'MasterVendors' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
          <h1 class="text-2xl font-bold text-gray-800">{{ vendor.name }}</h1>
          <span :class="statusBadgeClass(vendor.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(vendor.status) }}</span>
        </div>
        <div class="flex gap-2">
          <button v-if="vendor.status === 'active'" @click="changeStatus('inactive')" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Deactivate</button>
          <button v-if="vendor.status === 'inactive'" @click="changeStatus('active')" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Activate</button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Vendor Details</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-sm text-gray-500">Name</p><p class="font-medium">{{ vendor.name }}</p></div>
          <div><p class="text-sm text-gray-500">Type</p><p class="font-medium">{{ formatType(vendor.type) }}</p></div>
          <div><p class="text-sm text-gray-500">Address</p><p class="font-medium">{{ vendor.address || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Phone</p><p class="font-medium">{{ vendor.phone || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Email</p><p class="font-medium">{{ vendor.email || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Tax ID</p><p class="font-medium">{{ vendor.tax_id || '-' }}</p></div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Bank Details</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-sm text-gray-500">Bank Name</p><p class="font-medium">{{ vendor.bank_name || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Account Number</p><p class="font-medium">{{ vendor.bank_account_number || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Account Holder</p><p class="font-medium">{{ vendor.bank_account_holder || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Payment Terms</p><p class="font-medium">{{ vendor.payment_terms || '-' }}</p></div>
        </div>
      </div>

      <AuditTrail :logs="auditTrail" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import AuditTrail from '../../components/AuditTrail.vue'

const route = useRoute()

const vendor = ref(null)
const auditTrail = ref([])
const loading = ref(true)

onMounted(async () => {
  await fetchVendor()
  await fetchAuditTrail()
})

async function fetchVendor() {
  loading.value = true
  try {
    const response = await api.get(`/master-vendors/${route.params.id}`)
    vendor.value = response.data.vendor
  } finally {
    loading.value = false
  }
}

async function fetchAuditTrail() {
  try {
    const response = await api.get('/approval-logs', { params: { document_type: 'master_vendor', document_id: route.params.id } })
    auditTrail.value = response.data.logs || []
  } catch { auditTrail.value = [] }
}

async function changeStatus(status) {
  try {
    await api.post(`/master-vendors/${route.params.id}/status`, { status })
    await fetchVendor()
  } catch {}
}

function formatType(type) {
  const types = { supplier: 'Supplier', contractor: 'Contractor', service_provider: 'Service Provider' }
  return types[type] || type
}

function formatStatus(status) {
  const statuses = { draft: 'Draft', active: 'Active', inactive: 'Inactive' }
  return statuses[status] || status
}

function statusBadgeClass(status) {
  const classes = { draft: 'bg-gray-100 text-gray-700', active: 'bg-green-100 text-green-700', inactive: 'bg-red-100 text-red-700' }
  return classes[status] || 'bg-gray-100 text-gray-700'
}
</script>
<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="item">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <router-link :to="{ name: 'MasterItems' }" class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg></router-link>
          <h1 class="text-2xl font-bold text-gray-800">{{ item.name }}</h1>
          <span :class="statusBadgeClass(item.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(item.status) }}</span>
        </div>
        <div class="flex gap-2">
          <button v-if="item.status === 'declined'" @click="showResubmitModal = true" class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Resubmit</button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Item Details</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-sm text-gray-500">Name</p><p class="font-medium">{{ item.name }}</p></div>
          <div><p class="text-sm text-gray-500">Type</p><p class="font-medium">{{ formatType(item.type) }}</p></div>
          <div><p class="text-sm text-gray-500">Unit</p><p class="font-medium">{{ item.unit }}</p></div>
          <div><p class="text-sm text-gray-500">Category</p><p class="font-medium">{{ item.category || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Asset Code</p><p class="font-medium">{{ item.asset_code || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">COA</p><p class="font-medium">{{ item.coa || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ item.created_by?.name || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Validated By</p><p class="font-medium">{{ item.validated_by?.name || '-' }}</p></div>
          <div><p class="text-sm text-gray-500">Barcode</p><p class="font-medium flex items-center gap-1.5">{{ item.barcode || '-' }}<button v-if="item.barcode" @click="showBarcodeModal = true" class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-300 rounded px-1.5 py-0.5 hover:bg-slate-50 transition-colors"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 19.125v-4.5ZM13.125 3.375c-.621 0-1.125.504-1.125 1.125v4.5c0 .621.504 1.125 1.125 1.125h4.5c.621 0 1.125-.504 1.125-1.125v-4.5A1.125 1.125 0 0 0 17.625 3.375h-4.5Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"/></svg>QR</button></p></div>
        </div>
        <div v-if="item.decline_reason" class="mt-4 p-3 bg-red-50 rounded">
          <p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ item.decline_reason }}</p>
        </div>
      </div>

      <div v-if="authStore.hasRole('accounting') && item.status === 'pending_accounting'" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Accounting Validation</h2>
        <div v-if="validateError" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{{ validateError }}</div>
        <form @submit.prevent="validateItem('approve')">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input v-model="validateForm.category" type="text" required class="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">COA</label>
              <input v-model="validateForm.coa" type="text" required class="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Asset Code</label>
              <input v-model="validateForm.asset_code" type="text" class="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="validateLoading" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">{{ validateLoading ? 'Processing...' : 'Approve' }}</button>
            <button type="button" @click="showDeclineModal = true" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Decline</button>
          </div>
        </form>
      </div>

      <AuditTrail :logs="auditTrail" />
    </div>

    <BarcodeModal :visible="showBarcodeModal" :value="item?.barcode || ''" :itemName="item?.name || ''" @close="showBarcodeModal = false" />

    <div v-if="showDeclineModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">Decline Item</h2>
        <form @submit.prevent="validateItem('decline')">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason</label>
            <textarea v-model="validateForm.decline_reason" required class="w-full px-3 py-2 border rounded-md" rows="3"></textarea>
          </div>
          <div class="flex gap-3 justify-end">
            <button type="button" @click="showDeclineModal = false" class="px-4 py-2 border rounded-md text-gray-600">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm Decline</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showResubmitModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">Resubmit Item</h2>
        <form @submit.prevent="resubmitItem">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input v-model="resubmitForm.name" type="text" class="w-full px-3 py-2 border rounded-md" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="resubmitForm.type" class="w-full px-3 py-2 border rounded-md">
              <option value="asset">Asset</option>
              <option value="consumable">Consumable</option>
              <option value="spare_part">Spare Part</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input v-model="resubmitForm.unit" type="text" class="w-full px-3 py-2 border rounded-md" />
          </div>
          <div class="flex gap-3 justify-end">
            <button type="button" @click="showResubmitModal = false" class="px-4 py-2 border rounded-md text-gray-600">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Resubmit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import AuditTrail from '../../components/AuditTrail.vue'
import BarcodeModal from '../../components/BarcodeModal.vue'

const props = defineProps({ id: [String, Number] })
const route = useRoute()
const authStore = useAuthStore()

const item = ref(null)
const auditTrail = ref([])
const loading = ref(true)
const validateLoading = ref(false)
const validateError = ref('')
const showDeclineModal = ref(false)
const showResubmitModal = ref(false)
const showBarcodeModal = ref(false)

const validateForm = reactive({
  category: '',
  coa: '',
  asset_code: '',
  decline_reason: ''
})

const resubmitForm = reactive({
  name: '',
  type: 'consumable',
  unit: ''
})

onMounted(async () => {
  await fetchItem()
  await fetchAuditTrail()
})

async function fetchItem() {
  loading.value = true
  try {
    const response = await api.get(`/master-items/${route.params.id}`)
    item.value = response.data.item
  } finally {
    loading.value = false
  }
}

async function fetchAuditTrail() {
  try {
    const response = await api.get('/approval-logs', { params: { document_type: 'master_item', document_id: route.params.id } })
    auditTrail.value = response.data.logs || []
  } catch { auditTrail.value = [] }
}

async function validateItem(action) {
  validateLoading.value = true
  validateError.value = ''
  try {
    await api.post(`/master-items/${route.params.id}/validate`, {
      action,
      category: validateForm.category,
      coa: validateForm.coa,
      asset_code: validateForm.asset_code,
      decline_reason: validateForm.decline_reason
    })
    showDeclineModal.value = false
    await fetchItem()
    await fetchAuditTrail()
  } catch (err) {
    validateError.value = err.response?.data?.message || 'Validation failed'
  } finally {
    validateLoading.value = false
  }
}

async function resubmitItem() {
  try {
    await api.post(`/master-items/${route.params.id}/resubmit`, resubmitForm)
    showResubmitModal.value = false
    await fetchItem()
    await fetchAuditTrail()
  } catch {}
}

function formatType(type) {
  const types = { asset: 'Asset', consumable: 'Consumable', spare_part: 'Spare Part', other: 'Other' }
  return types[type] || type
}

function formatStatus(status) {
  const statuses = { inactive: 'Inactive', pending_accounting: 'Pending Validation', active: 'Active', declined: 'Declined' }
  return statuses[status] || status
}

function statusBadgeClass(status) {
  const classes = { inactive: 'bg-gray-100 text-gray-700', pending_accounting: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700' }
  return classes[status] || 'bg-gray-100 text-gray-700'
}
</script>
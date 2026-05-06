<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="di">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'DeliveryInstructions' }" class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg></router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ di.number }}</h1>
        <span :class="statusBadge(di.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(di.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Delivery Instruction Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ di.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(di.date) }}</p></div>
              <div><p class="text-sm text-gray-500">MR Reference</p><router-link v-if="di.material_request" :to="{ name: 'MaterialRequestDetail', params: { id: di.material_request.id } }" class="text-blue-600 hover:underline">{{ di.material_request.number }}</router-link><span v-else>-</span></div>
              <div><p class="text-sm text-gray-500">Warehouse</p><p class="font-medium">{{ di.warehouse_id || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ di.creator?.name || '-' }}</p></div>
            </div>
          </div>
          <div v-if="di.delivery_note" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Delivery Note</h2>
            <router-link :to="{ name: 'DeliveryNoteDetail', params: { id: di.delivery_note.id } }" class="text-blue-600 hover:underline">{{ di.delivery_note.number }}</router-link>
            <span :class="dnStatusBadge(di.delivery_note.status)" class="ml-2 px-2 py-1 text-xs rounded-full">{{ formatDnStatus(di.delivery_note.status) }}</span>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="di.status === 'draft'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Issue DI</h2>
            <p class="text-sm text-gray-600 mb-3">Issue this delivery instruction to enable creation of a Delivery Note.</p>
            <button @click="issueDI" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">{{ actionLoading ? 'Issuing...' : 'Issue' }}</button>
          </div>
          <AuditTrail :logs="di.approval_logs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '../../utils/format'
import AuditTrail from '../../components/AuditTrail.vue'
import api from '../../services/api'

const route = useRoute()
const di = ref(null)
const loading = ref(true)
const actionLoading = ref(false)

onMounted(() => fetchDI())

async function fetchDI() {
  loading.value = true
  try { const r = await api.get(`/delivery-instructions/${route.params.id}`); di.value = r.data.delivery_instruction }
  finally { loading.value = false }
}

async function issueDI() {
  actionLoading.value = true
  try { await api.post(`/delivery-instructions/${route.params.id}/issue`); await fetchDI() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', issued: 'Issued' }[s] || s }
function statusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', issued: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-700' }
function formatDnStatus(s) { return { draft: 'Draft', dispatched: 'Dispatched' }[s] || s }
function dnStatusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', dispatched: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>
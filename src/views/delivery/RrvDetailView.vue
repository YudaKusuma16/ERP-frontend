<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="rrv">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'Rrvs' }" class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg></router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ rrv.number }}</h1>
        <span :class="statusBadge(rrv.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(rrv.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">RRV Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ rrv.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(rrv.date) }}</p></div>
              <div><p class="text-sm text-gray-500">Service Request</p><p class="font-medium">{{ rrv.service_request?.number || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Delivery Note</p><p class="font-medium">{{ rrv.delivery_note?.number || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Vendor</p><p class="font-medium">{{ rrv.vendor?.name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ rrv.creator?.name || '-' }}</p></div>
            </div>
            <div v-if="rrv.replacement_item_detail" class="mt-4 p-3 bg-gray-50 rounded"><p class="text-sm text-gray-600"><strong>Replacement Item Details:</strong> {{ rrv.replacement_item_detail }}</p></div>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="rrv.status === 'draft'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Confirm RRV</h2>
            <p class="text-sm text-gray-600 mb-3">Confirm this Return Replacement Voucher to finalize the replacement.</p>
            <button @click="confirmRRV" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">{{ actionLoading ? 'Confirming...' : 'Confirm' }}</button>
          </div>
          <AuditTrail :logs="rrv.approval_logs" />
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
const rrv = ref(null)
const loading = ref(true)
const actionLoading = ref(false)

onMounted(() => fetchRRV())

async function fetchRRV() {
  loading.value = true
  try { const r = await api.get(`/rrvs/${route.params.id}`); rrv.value = r.data.rrv }
  finally { loading.value = false }
}

async function confirmRRV() {
  actionLoading.value = true
  try { await api.post(`/rrvs/${route.params.id}/confirm`); await fetchRRV() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', confirmed: 'Confirmed' }[s] || s }
function statusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>
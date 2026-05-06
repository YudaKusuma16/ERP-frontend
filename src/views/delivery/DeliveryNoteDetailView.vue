<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="dn">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'DeliveryNotes' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ dn.number }}</h1>
        <span :class="statusBadge(dn.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(dn.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Delivery Note Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ dn.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(dn.date) }}</p></div>
              <div><p class="text-sm text-gray-500">DI Reference</p><router-link v-if="dn.delivery_instruction" :to="{ name: 'DeliveryInstructionDetail', params: { id: dn.delivery_instruction.id } }" class="text-blue-600 hover:underline">{{ dn.delivery_instruction.number }}</router-link><span v-else>-</span></div>
              <div><p class="text-sm text-gray-500">Driver</p><p class="font-medium">{{ dn.driver || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Vehicle</p><p class="font-medium">{{ dn.vehicle || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ dn.creator?.name || '-' }}</p></div>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="dn.status === 'draft'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Dispatch DN</h2>
            <p class="text-sm text-gray-600 mb-3">Mark this delivery note as dispatched.</p>
            <button @click="dispatchDN" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">{{ actionLoading ? 'Dispatching...' : 'Dispatch' }}</button>
          </div>
          <AuditTrail :logs="dn.approval_logs" />
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
const dn = ref(null)
const loading = ref(true)
const actionLoading = ref(false)

onMounted(() => fetchDN())

async function fetchDN() {
  loading.value = true
  try { const r = await api.get(`/delivery-notes/${route.params.id}`); dn.value = r.data.delivery_note }
  finally { loading.value = false }
}

async function dispatchDN() {
  actionLoading.value = true
  try { await api.post(`/delivery-notes/${route.params.id}/dispatch`); await fetchDN() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', dispatched: 'Dispatched' }[s] || s }
function statusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', dispatched: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>
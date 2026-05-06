<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="preRd">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'PreReceivingDocuments' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ preRd.number }}</h1>
        <span :class="statusBadge(preRd.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(preRd.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Pre-RD Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ preRd.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(preRd.date) }}</p></div>
              <div><p class="text-sm text-gray-500">PO Reference</p><p class="font-medium">{{ preRd.purchase_order?.number || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Vendor</p><p class="font-medium">{{ preRd.purchase_order?.vendor?.name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Pihak 1</p><p class="font-medium">{{ preRd.pihak1?.name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Status</p><p class="font-medium">{{ formatStatus(preRd.status) }}</p></div>
            </div>
            <div v-if="preRd.notes" class="mt-4 p-3 bg-gray-50 rounded"><p class="text-sm text-gray-600"><strong>Notes:</strong> {{ preRd.notes }}</p></div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Received Lines</h2>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Ordered Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Received Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Received Unit</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-if="confirming" v-for="(line, index) in confirmForm.lines" :key="'edit-' + index">
                  <td class="px-4 py-3 text-sm">{{ line.item_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ line.ordered_qty }}</td>
                  <td class="px-4 py-3"><input v-model.number="line.received_qty" type="number" step="0.01" class="w-full px-2 py-1 border rounded text-sm" /></td>
                  <td class="px-4 py-3"><input v-model="line.received_unit" type="text" class="w-full px-2 py-1 border rounded text-sm" /></td>
                  <td class="px-4 py-3 text-sm">{{ line.notes || '-' }}</td>
                </tr>
                <tr v-if="!confirming" v-for="line in preRd.lines" :key="line.id">
                  <td class="px-4 py-3 text-sm">{{ line.item_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ line.ordered_qty }}</td>
                  <td class="px-4 py-3 text-sm">{{ line.received_qty }}</td>
                  <td class="px-4 py-3 text-sm">{{ line.received_unit }}</td>
                  <td class="px-4 py-3 text-sm">{{ line.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="preRd.receiving_document" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Generated Receiving Document</h2>
            <router-link :to="{ name: 'ReceivingDocumentDetail', params: { id: preRd.receiving_document.id } }" class="text-blue-600 hover:underline">{{ preRd.receiving_document.number }}</router-link>
            <span :class="rdStatusBadge(preRd.receiving_document.status)" class="ml-2 px-2 py-1 text-xs rounded-full">{{ formatRdStatus(preRd.receiving_document.status) }}</span>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="canConfirm" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Confirm Pre-RD</h2>
            <p class="text-sm text-gray-600 mb-3">Confirming will generate a Receiving Document (RD) and update the PO status.</p>
            <p v-if="confirming" class="text-sm text-yellow-600 mb-2">You can adjust received quantities before confirming.</p>
            <div v-if="!confirming" class="flex gap-2">
              <button @click="startConfirm" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Confirm & Generate RD</button>
            </div>
            <div v-else class="flex gap-2">
              <button @click="confirmPreRd" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">{{ actionLoading ? 'Confirming...' : 'Confirm' }}</button>
              <button @click="confirming = false" class="px-4 py-2 border rounded-md text-gray-600 text-sm">Cancel</button>
            </div>
          </div>
          <AuditTrail :logs="preRd.approval_logs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '../../utils/format'
import AuditTrail from '../../components/AuditTrail.vue'
import api from '../../services/api'

const route = useRoute()
const preRd = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const confirming = ref(false)

const confirmForm = reactive({ lines: [] })

const canConfirm = computed(() => preRd.value?.status === 'draft')

onMounted(() => fetchPreRd())

async function fetchPreRd() {
  loading.value = true
  try {
    const response = await api.get(`/pre-receiving-documents/${route.params.id}`)
    preRd.value = response.data.pre_rd
  } finally { loading.value = false }
}

function startConfirm() {
  confirming.value = true
  confirmForm.lines = preRd.value.lines.map(l => ({
    id: l.id,
    item_name: l.item_name,
    ordered_qty: l.ordered_qty,
    received_qty: l.received_qty,
    received_unit: l.received_unit,
    notes: l.notes
  }))
}

async function confirmPreRd() {
  actionLoading.value = true
  try {
    const payload = {
      lines: confirmForm.lines.map(l => ({
        id: l.id,
        received_qty: l.received_qty,
        received_unit: l.received_unit
      }))
    }
    await api.post(`/pre-receiving-documents/${route.params.id}/confirm`, payload)
    confirming.value = false
    await fetchPreRd()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to confirm Pre-RD')
  } finally { actionLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', confirmed: 'Confirmed', rd_generated: 'RD Generated' }[s] || s }
function statusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', rd_generated: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-700' }
function formatRdStatus(s) { return { pending_input: 'Pending Input', validating: 'Validating', approved: 'Approved', declined: 'Declined', asset_tagged: 'Asset Tagged' }[s] || s }
function rdStatusBadge(s) { return { pending_input: 'bg-yellow-100 text-yellow-700', validating: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700', asset_tagged: 'bg-blue-100 text-blue-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>
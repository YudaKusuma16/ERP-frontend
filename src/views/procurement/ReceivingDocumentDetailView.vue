<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="rd">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'ReceivingDocuments' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ rd.number }}</h1>
        <span :class="statusBadge(rd.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(rd.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">RD Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ rd.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(rd.date) }}</p></div>
              <div><p class="text-sm text-gray-500">Pre-RD Reference</p>
                <router-link v-if="rd.pre_receiving_document" :to="{ name: 'PreReceivingDocumentDetail', params: { id: rd.pre_receiving_document.id } }" class="text-blue-600 hover:underline">{{ rd.pre_receiving_document.number }}</router-link>
                <span v-else>-</span>
              </div>
              <div><p class="text-sm text-gray-500">PO / Vendor</p><p class="font-medium">{{ rd.pre_receiving_document?.purchase_order?.number || '-' }} / {{ rd.pre_receiving_document?.purchase_order?.vendor?.name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Status</p><p class="font-medium">{{ formatStatus(rd.status) }}</p></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Line Items</h2>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Serial Number</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Condition</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Tag Number</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <template v-if="isSerialInput">
                  <tr v-for="(line, index) in serialForm.lines" :key="'edit-' + index">
                    <td class="px-4 py-3 text-sm">{{ line.item_name }}</td>
                    <td class="px-4 py-3"><input v-model="line.serial_number" type="text" class="w-full px-2 py-1 border rounded text-sm" placeholder="Serial #" /></td>
                    <td class="px-4 py-3"><input v-model="line.location" type="text" class="w-full px-2 py-1 border rounded text-sm" placeholder="Location" /></td>
                    <td class="px-4 py-3"><input v-model="line.condition_notes" type="text" class="w-full px-2 py-1 border rounded text-sm" placeholder="Condition" /></td>
                    <td class="px-4 py-3 text-sm text-gray-400">{{ line.tag_number || '-' }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="line in rd.line_items" :key="line.id">
                    <td class="px-4 py-3 text-sm">{{ line.item_name }}</td>
                    <td class="px-4 py-3 text-sm">{{ line.serial_number || '-' }}</td>
                    <td class="px-4 py-3 text-sm">{{ line.location || '-' }}</td>
                    <td class="px-4 py-3 text-sm">{{ line.condition_notes || '-' }}</td>
                    <td class="px-4 py-3 text-sm font-medium">{{ line.tag_number || '-' }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="canInputSerials" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Serial Number Input</h2>
            <p class="text-sm text-gray-600 mb-3">Enter serial numbers, locations, and condition notes for received items.</p>
            <div v-if="!isSerialInput" class="flex gap-2">
              <button @click="startSerialInput" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Start Input</button>
            </div>
            <div v-else class="flex gap-2">
              <button @click="saveSerialNumbers" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">{{ actionLoading ? 'Saving...' : 'Save Serial Numbers' }}</button>
              <button @click="isSerialInput = false" class="px-4 py-2 border rounded-md text-gray-600 text-sm">Cancel</button>
            </div>
          </div>
          <div v-if="canApprove" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Approve / Decline RD</h2>
            <p class="text-sm text-gray-600 mb-3">RD is in validating status and ready for approval.</p>
            <div class="mb-3"><label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label><textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea></div>
            <div class="flex gap-2">
              <button @click="approveRd" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve</button>
              <button @click="declineRd" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>
          <AuditTrail :logs="rd.approval_logs" />
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
const rd = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const isSerialInput = ref(false)

const serialForm = reactive({ lines: [] })
const actionForm = reactive({ reason: '' })

const canInputSerials = computed(() => ['pending_input', 'validating'].includes(rd.value?.status))
const canApprove = computed(() => rd.value?.status === 'validating')

onMounted(() => fetchRd())

async function fetchRd() {
  loading.value = true
  try {
    const response = await api.get(`/receiving-documents/${route.params.id}`)
    rd.value = response.data.rd
  } finally { loading.value = false }
}

function startSerialInput() {
  isSerialInput.value = true
  serialForm.lines = rd.value.line_items.map(l => ({
    id: l.id,
    item_name: l.item_name,
    serial_number: l.serial_number || '',
    location: l.location || '',
    condition_notes: l.condition_notes || '',
    tag_number: l.tag_number || ''
  }))
}

async function saveSerialNumbers() {
  actionLoading.value = true
  try {
    const payload = {
      lines: serialForm.lines.map(l => ({
        id: l.id,
        serial_number: l.serial_number || null,
        location: l.location || null,
        condition_notes: l.condition_notes || null
      }))
    }
    await api.post(`/receiving-documents/${route.params.id}/input-serial-numbers`, payload)
    isSerialInput.value = false
    await fetchRd()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save serial numbers')
  } finally { actionLoading.value = false }
}

async function approveRd() {
  actionLoading.value = true
  try {
    await api.post(`/receiving-documents/${route.params.id}/approve`, { action: 'approve' })
    await fetchRd()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to approve')
  } finally { actionLoading.value = false }
}

async function declineRd() {
  actionLoading.value = true
  try {
    await api.post(`/receiving-documents/${route.params.id}/approve`, { action: 'decline', reason: actionForm.reason })
    actionForm.reason = ''
    await fetchRd()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to decline')
  } finally { actionLoading.value = false }
}

function formatStatus(s) { return { pending_input: 'Pending Input', validating: 'Validating', approved: 'Approved', declined: 'Declined', asset_tagged: 'Asset Tagged' }[s] || s }
function statusBadge(s) { return { pending_input: 'bg-yellow-100 text-yellow-700', validating: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700', asset_tagged: 'bg-blue-100 text-blue-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>
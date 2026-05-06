<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="wo">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'WorkOrders' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ wo.number }}</h1>
        <span :class="statusBadge(wo.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(wo.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Work Order Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ wo.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(wo.date) }}</p></div>
              <div><p class="text-sm text-gray-500">ORF Reference</p><p class="font-medium">{{ wo.orf_ref || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Service Type</p><p class="font-medium">{{ wo.service_type || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">PIC</p><p class="font-medium">{{ wo.pic?.name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ wo.creator?.name || '-' }}</p></div>
            </div>
            <div v-if="wo.job_details" class="mt-4 p-3 bg-gray-50 rounded"><p class="text-sm text-gray-600"><strong>Job Details:</strong> {{ wo.job_details }}</p></div>
            <div v-if="wo.decline_reason" class="mt-4 p-3 bg-red-50 rounded"><p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ wo.decline_reason }}</p></div>
          </div>
          <div v-if="wo.acceptance_letter" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Acceptance Letter</h2>
            <router-link :to="{ name: 'AcceptanceLetterDetail', params: { id: wo.acceptance_letter.id } }" class="text-blue-600 hover:underline">{{ wo.acceptance_letter.number }}</router-link>
            <span :class="alStatusBadge(wo.acceptance_letter.status)" class="ml-2 px-2 py-1 text-xs rounded-full">{{ formatAlStatus(wo.acceptance_letter.status) }}</span>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="wo.status === 'draft'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Submit for Approval</h2>
            <p class="text-sm text-gray-600 mb-3">Submit this WO for department head approval.</p>
            <button @click="submitForApproval" :disabled="actionLoading" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{{ actionLoading ? 'Submitting...' : 'Submit' }}</button>
          </div>
          <div v-if="wo.status === 'pending_approval'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Approve / Decline</h2>
            <div class="mb-3"><label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason</label><textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea></div>
            <div class="flex gap-2">
              <button @click="approveWO('approve')" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve</button>
              <button @click="approveWO('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>
          <AuditTrail :logs="wo.approval_logs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '../../utils/format'
import AuditTrail from '../../components/AuditTrail.vue'
import api from '../../services/api'

const route = useRoute()
const wo = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const actionForm = reactive({ reason: '' })

onMounted(() => fetchWO())

async function fetchWO() {
  loading.value = true
  try { const r = await api.get(`/work-orders/${route.params.id}`); wo.value = r.data.work_order }
  finally { loading.value = false }
}

async function submitForApproval() {
  actionLoading.value = true
  try { await api.post(`/work-orders/${route.params.id}/submit`); await fetchWO() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

async function approveWO(action) {
  actionLoading.value = true
  try { await api.post(`/work-orders/${route.params.id}/approve`, { action, reason: actionForm.reason }); actionForm.reason = ''; await fetchWO() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', pending_approval: 'Pending Approval', approved: 'Approved', al_generated: 'AL Generated', declined: 'Declined' }[s] || s }
function statusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', pending_approval: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700', al_generated: 'bg-blue-100 text-blue-700', declined: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }
function formatAlStatus(s) { return { auto_created: 'Auto Created', pending_approval: 'Pending Approval', approved: 'Approved', declined: 'Declined', in_progress: 'In Progress', completed: 'Completed' }[s] || s }
function alStatusBadge(s) { return { auto_created: 'bg-gray-100 text-gray-700', pending_approval: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-indigo-100 text-indigo-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>
<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="sr">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <router-link :to="{ name: 'ServiceRequests' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
          <h1 class="text-2xl font-bold text-gray-800">{{ sr.number }}</h1>
          <span :class="srStatusBadge(sr.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(sr.status) }}</span>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">SR Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ sr.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(sr.date) }}</p></div>
              <div><p class="text-sm text-gray-500">Source Type</p><p class="font-medium"><span class="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">{{ formatSource(sr.source_type) }}</span></p></div>
              <div><p class="text-sm text-gray-500">Requestor</p><p class="font-medium">{{ sr.requestor?.name }}</p></div>
              <div><p class="text-sm text-gray-500">Department</p><p class="font-medium">{{ sr.department?.name }}</p></div>
              <div v-if="sr.source_doc_ref"><p class="text-sm text-gray-500">Source Doc Ref</p><p class="font-medium">{{ sr.source_doc_ref }}</p></div>
              <div><p class="text-sm text-gray-500">Notes</p><p class="font-medium">{{ sr.notes || '-' }}</p></div>
            </div>
            <div v-if="sr.decline_reason" class="mt-4 p-3 bg-red-50 rounded">
              <p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ sr.decline_reason }}</p>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Service Items</h2>
              <span v-if="sr.status === 'pending_pihak_ii'" class="text-sm text-gray-500">Select items to flag</span>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th v-if="sr.status === 'pending_pihak_ii'" class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-10">
                    <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded" />
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Service</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Est. Cost</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Flagged</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in sr.line_items" :key="item.id" class="hover:bg-gray-50">
                  <td v-if="sr.status === 'pending_pihak_ii'" class="px-4 py-3"><input type="checkbox" v-model="flaggedItems" :value="item.id" class="rounded" /></td>
                  <td class="px-4 py-3 text-sm">{{ item.service_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.qty }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.unit }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.est_cost ? 'Rp ' + Number(item.est_cost).toLocaleString('id-ID') : '-' }}</td>
                  <td class="px-4 py-3"><span v-if="item.flagged" class="text-green-600 text-sm">Yes</span><span v-else class="text-gray-400 text-sm">No</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="canApproveDeptHead" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Department Head Action</h2>
            <div class="mb-3"><label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label><textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea></div>
            <div class="flex gap-2">
              <button @click="deptHeadAction('approve')" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve</button>
              <button @click="deptHeadAction('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>
          <div v-if="canFlagAndApprovePihak2" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Pihak II Action</h2>
            <p class="text-sm text-gray-500 mb-3">Flag services, then approve.</p>
            <div v-if="flaggedItems.length === 0" class="mb-3 p-2 bg-yellow-50 text-yellow-700 text-sm rounded">Select at least one service to flag before approving.</div>
            <div class="mb-3"><label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label><textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea></div>
            <div class="flex gap-2">
              <button @click="pihak2Action('approve')" :disabled="actionLoading || flaggedItems.length === 0" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Flag &amp; Approve</button>
              <button @click="pihak2Action('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>
          <AuditTrail :logs="sr.approval_logs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { formatDate } from '../../utils/format'
import AuditTrail from '../../components/AuditTrail.vue'
import api from '../../services/api'

const route = useRoute()
const authStore = useAuthStore()
const sr = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const flaggedItems = ref([])
const selectAll = ref(false)
const actionForm = reactive({ reason: '' })

const canApproveDeptHead = computed(() => sr.value?.status === 'pending_dept_head' && authStore.hasRole('dept_head'))
const canFlagAndApprovePihak2 = computed(() => sr.value?.status === 'pending_pihak_ii' && (authStore.hasRole('ga') || authStore.hasRole('log')))

onMounted(() => { fetchSR(); fetchAuditTrail() })

async function fetchSR() {
  loading.value = true
  try {
    const response = await api.get(`/service-requests/${route.params.id}`)
    sr.value = response.data.sr
    flaggedItems.value = sr.value.line_items?.filter(i => i.flagged).map(i => i.id) || []
  } finally { loading.value = false }
}

async function fetchAuditTrail() {
  if (!sr.value) return
  try {
    const response = await api.get('/approval-logs', { params: { document_type: 'sr', document_id: route.params.id } })
    if (sr.value) sr.value.approval_logs = response.data.logs || []
  } catch {}
}

async function deptHeadAction(action) {
  actionLoading.value = true
  try {
    await api.post(`/service-requests/${route.params.id}/approve-dept-head`, { action, reason: actionForm.reason || undefined })
    await fetchSR()
    actionForm.reason = ''
  } catch (err) { alert(err.response?.data?.message || 'Action failed') }
  finally { actionLoading.value = false }
}

async function pihak2Action(action) {
  actionLoading.value = true
  try {
    if (action === 'approve' && flaggedItems.value.length > 0) {
      await api.post(`/service-requests/${route.params.id}/flag-items`, { flagged_items: flaggedItems.value })
    }
    await api.post(`/service-requests/${route.params.id}/approve-pihak2`, { action, reason: actionForm.reason || undefined })
    await fetchSR()
    actionForm.reason = ''
  } catch (err) { alert(err.response?.data?.message || 'Action failed') }
  finally { actionLoading.value = false }
}

function toggleSelectAll() { flaggedItems.value = selectAll.value ? (sr.value.line_items?.map(i => i.id) || []) : [] }
function formatSource(t) { return { internal:'Internal',customer:'Customer','3rd_party':'3rd Party',project:'Project' }[t] || t }
function formatStatus(s) { return { draft:'Draft',pending_dept_head:'Pending Dept Head',pending_pihak_ii:'Pending Pihak II',approved:'Approved',pr_created:'PR Created',declined:'Declined' }[s] || s }
function srStatusBadge(s) { return { draft:'bg-gray-100 text-gray-700',pending_dept_head:'bg-yellow-100 text-yellow-700',pending_pihak_ii:'bg-orange-100 text-orange-700',approved:'bg-green-100 text-green-700',pr_created:'bg-blue-100 text-blue-700',declined:'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }

</script>
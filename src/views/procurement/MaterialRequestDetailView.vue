<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="mr">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <router-link :to="{ name: 'MaterialRequests' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
          <h1 class="text-2xl font-bold text-gray-800">{{ mr.number }}</h1>
          <span :class="mrStatusBadge(mr.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(mr.status) }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">MR Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ mr.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(mr.date) }}</p></div>
              <div><p class="text-sm text-gray-500">Source Type</p><p class="font-medium">
                <span class="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">{{ formatSource(mr.source_type) }}</span>
              </p></div>
              <div><p class="text-sm text-gray-500">Requestor</p><p class="font-medium">{{ mr.requestor?.name }}</p></div>
              <div><p class="text-sm text-gray-500">Department</p><p class="font-medium">{{ mr.department?.name }}</p></div>
              <div><p class="text-sm text-gray-500">Notes</p><p class="font-medium">{{ mr.notes || '-' }}</p></div>
            </div>
            <div v-if="mr.decline_reason" class="mt-4 p-3 bg-red-50 rounded">
              <p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ mr.decline_reason }}</p>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Line Items</h2>
              <span v-if="mr.status === 'pending_pihak_ii'" class="text-sm text-gray-500">Select items to flag for purchase</span>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th v-if="mr.status === 'pending_pihak_ii'" class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-10">
                    <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded" />
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Flagged</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in mr.line_items" :key="item.id" class="hover:bg-gray-50">
                  <td v-if="mr.status === 'pending_pihak_2' || mr.status === 'pending_pihak_ii'" class="px-4 py-3">
                    <input type="checkbox" v-model="flaggedItems" :value="item.id" class="rounded" />
                  </td>
                  <td class="px-4 py-3 text-sm">{{ item.item?.name || item.item_name || '-' }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.qty }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.unit }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.description || '-' }}</td>
                  <td class="px-4 py-3">
                    <span v-if="item.flagged" class="text-green-600 text-sm">Yes</span>
                    <span v-else class="text-gray-400 text-sm">No</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-6">
          <div v-if="canApproveDeptHead" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Department Head Action</h2>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label>
              <textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea>
            </div>
            <div class="flex gap-2">
              <button @click="deptHeadAction('approve')" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve</button>
              <button @click="deptHeadAction('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>

          <div v-if="canFlagAndApprovePihak2" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Pihak II Action</h2>
            <p class="text-sm text-gray-500 mb-3">Flag items for purchase, then approve.</p>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label>
              <textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea>
            </div>
            <div v-if="flaggedItems.length === 0" class="mb-3 p-2 bg-yellow-50 text-yellow-700 text-sm rounded">Please select at least one item to flag before approving.</div>
            <div class="flex gap-2">
              <button @click="pihak2Action('approve')" :disabled="actionLoading || flaggedItems.length === 0" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Flag &amp; Approve</button>
              <button @click="pihak2Action('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>

          <AuditTrail :logs="mr.approval_logs" />
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
const mr = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const flaggedItems = ref([])
const selectAll = ref(false)

const actionForm = reactive({ reason: '' })

const canApproveDeptHead = computed(() => {
  return mr.value?.status === 'pending_dept_head' && authStore.hasRole('dept_head')
})

const canFlagAndApprovePihak2 = computed(() => {
  return mr.value?.status === 'pending_pihak_ii' && (authStore.hasRole('ga') || authStore.hasRole('log'))
})

onMounted(() => { fetchMR(); fetchAuditTrail() })

async function fetchMR() {
  loading.value = true
  try {
    const response = await api.get(`/material-requests/${route.params.id}`)
    mr.value = response.data.mr
    flaggedItems.value = mr.value.line_items?.filter(i => i.flagged).map(i => i.id) || []
  } finally { loading.value = false }
}

async function fetchAuditTrail() {
  if (!mr.value) return
  try {
    const response = await api.get('/approval-logs', { params: { document_type: 'mr', document_id: route.params.id } })
    if (mr.value) mr.value.approval_logs = response.data.logs || []
  } catch {}
}

async function deptHeadAction(action) {
  actionLoading.value = true
  try {
    await api.post(`/material-requests/${route.params.id}/approve-dept-head`, {
      action,
      reason: actionForm.reason || undefined
    })
    await fetchMR()
    actionForm.reason = ''
  } catch (err) {
    alert(err.response?.data?.message || 'Action failed')
  } finally { actionLoading.value = false }
}

async function pihak2Action(action) {
  actionLoading.value = true
  try {
    if (action === 'approve' && flaggedItems.value.length > 0) {
      await api.post(`/material-requests/${route.params.id}/flag-items`, { flagged_items: flaggedItems.value })
    }
    await api.post(`/material-requests/${route.params.id}/approve-pihak2`, {
      action,
      reason: actionForm.reason || undefined
    })
    await fetchMR()
    actionForm.reason = ''
  } catch (err) {
    alert(err.response?.data?.message || 'Action failed')
  } finally { actionLoading.value = false }
}

function toggleSelectAll() {
  if (selectAll.value) {
    flaggedItems.value = mr.value.line_items?.map(i => i.id) || []
  } else {
    flaggedItems.value = []
  }
}

function formatSource(t) { return { internal: 'Internal', asset: 'Asset', customer: 'Customer', project_internal: 'Project Internal' }[t] || t }
function formatStatus(s) { return { draft:'Draft',pending_dept_head:'Pending Dept Head',pending_pihak_ii:'Pending Pihak II',approved:'Approved',pr_created:'PR Created',declined:'Declined' }[s] || s }
function mrStatusBadge(s) { return { draft:'bg-gray-100 text-gray-700',pending_dept_head:'bg-yellow-100 text-yellow-700',pending_pihak_ii:'bg-orange-100 text-orange-700',approved:'bg-green-100 text-green-700',pr_created:'bg-blue-100 text-blue-700',declined:'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }

</script>
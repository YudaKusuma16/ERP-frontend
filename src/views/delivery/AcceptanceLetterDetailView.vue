<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="al">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'AcceptanceLetters' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ al.number }}</h1>
        <span :class="statusBadge(al.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(al.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Acceptance Letter Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ al.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(al.date) }}</p></div>
              <div><p class="text-sm text-gray-500">WO Reference</p><router-link v-if="al.work_order" :to="{ name: 'WorkOrderDetail', params: { id: al.work_order.id } }" class="text-blue-600 hover:underline">{{ al.work_order.number }}</router-link><span v-else>-</span></div>
              <div><p class="text-sm text-gray-500">Status</p><p class="font-medium">{{ formatStatus(al.status) }}</p></div>
            </div>
            <div v-if="al.decline_reason" class="mt-4 p-3 bg-red-50 rounded"><p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ al.decline_reason }}</p></div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Line Items</h2>
            <div v-if="canAddItems" class="mb-4">
              <h3 class="text-sm font-semibold mb-2">Add Items</h3>
              <div v-for="(item, index) in newItemForm" :key="index" class="flex gap-2 mb-2 items-end">
                <input v-model="item.item_name" type="text" class="flex-1 px-2 py-1 border rounded text-sm" placeholder="Item name" />
                <select v-model="item.item_status" class="px-2 py-1 border rounded text-sm">
                  <option value="terpasang">Terpasang</option>
                  <option value="ex_remote">Ex Remote</option>
                  <option value="tidak_jadi">Tidak Jadi</option>
                </select>
                <input v-model="item.location" type="text" class="w-32 px-2 py-1 border rounded text-sm" placeholder="Location" />
                <button @click="newItemForm.splice(index, 1)" class="px-2 text-red-600 text-sm">&times;</button>
              </div>
              <button @click="newItemForm.push({ item_name: '', item_status: 'terpasang', location: '' })" class="text-sm text-blue-600 hover:underline">+ Add Item</button>
              <button @click="addLineItems" :disabled="addLoading || !newItemForm.some(i => i.item_name)" class="ml-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">{{ addLoading ? 'Adding...' : 'Save Items' }}</button>
            </div>
            <table v-if="al.line_items?.length" class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="line in al.line_items" :key="line.id">
                  <td class="px-4 py-3 text-sm">{{ line.item_name }}</td>
                  <td class="px-4 py-3"><span :class="itemStatusBadge(line.item_status)" class="px-2 py-1 text-xs rounded-full">{{ formatItemStatus(line.item_status) }}</span></td>
                  <td class="px-4 py-3 text-sm">{{ line.location || '-' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-sm text-gray-500">No line items yet.</div>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="canApprove" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Approval Actions</h2>
            <div class="mb-3"><label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label><textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea></div>
            <div class="flex gap-2">
              <button @click="approveAL('approve')" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">{{ nextActionLabel }}</button>
              <button v-if="al.status === 'pending_approval'" @click="approveAL('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>
          <div v-if="canUpdateItems" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Update Item Status</h2>
            <div v-for="(line, idx) in updateForm" :key="idx" class="flex gap-2 mb-2 items-center">
              <span class="text-sm flex-1">{{ line.item_name }}</span>
              <select v-model="line.item_status" class="px-2 py-1 border rounded text-sm">
                <option value="terpasang">Terpasang</option>
                <option value="ex_remote">Ex Remote</option>
                <option value="tidak_jadi">Tidak Jadi</option>
              </select>
              <input v-model="line.location" type="text" class="w-28 px-2 py-1 border rounded text-sm" placeholder="Location" />
            </div>
            <button @click="updateLineItems" :disabled="actionLoading" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{{ actionLoading ? 'Saving...' : 'Save Updates' }}</button>
          </div>
          <AuditTrail :logs="al.approval_logs" />
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
const al = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const addLoading = ref(false)
const actionForm = reactive({ reason: '' })
const newItemForm = reactive([])
const updateForm = reactive([])

const canAddItems = computed(() => ['auto_created', 'pending_approval'].includes(al.value?.status))
const canApprove = computed(() => ['pending_approval', 'approved', 'in_progress'].includes(al.value?.status))
const canUpdateItems = computed(() => al.value?.status === 'in_progress')
const nextActionLabel = computed(() => {
  if (al.value?.status === 'pending_approval') return 'Approve'
  if (al.value?.status === 'approved') return 'Start Progress'
  if (al.value?.status === 'in_progress') return 'Complete'
  return 'Approve'
})

onMounted(() => fetchAL())

async function fetchAL() {
  loading.value = true
  try { const r = await api.get(`/acceptance-letters/${route.params.id}`); al.value = r.data.acceptance_letter }
  finally { loading.value = false }
}

async function addLineItems() {
  const items = newItemForm.filter(i => i.item_name)
  if (!items.length) return
  addLoading.value = true
  try {
    await api.post(`/acceptance-letters/${route.params.id}/add-line-items`, { items })
    newItemForm.splice(0)
    await fetchAL()
  } catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { addLoading.value = false }
}

async function approveAL(action) {
  actionLoading.value = true
  try { await api.post(`/acceptance-letters/${route.params.id}/approve`, { action, reason: actionForm.reason }); actionForm.reason = ''; await fetchAL() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function startUpdateForm() {
  updateForm.splice(0)
  al.value.line_items.forEach(l => updateForm.push({ id: l.id, item_name: l.item_name, item_status: l.item_status, location: l.location || '' }))
}

async function updateLineItems() {
  actionLoading.value = true
  try {
    await api.post(`/acceptance-letters/${route.params.id}/update-line-items`, { items: updateForm })
    await fetchAL()
  } catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatStatus(s) { return { auto_created: 'Auto Created', pending_approval: 'Pending Approval', approved: 'Approved', in_progress: 'In Progress', completed: 'Completed', declined: 'Declined' }[s] || s }
function statusBadge(s) { return { auto_created: 'bg-gray-100 text-gray-700', pending_approval: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-indigo-100 text-indigo-700', declined: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }
function formatItemStatus(s) { return { terpasang: 'Terpasang', ex_remote: 'Ex Remote', tidak_jadi: 'Tidak Jadi' }[s] || s }
function itemStatusBadge(s) { return { terpasang: 'bg-green-100 text-green-700', ex_remote: 'bg-yellow-100 text-yellow-700', tidak_jadi: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>
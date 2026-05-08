<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="so">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'SalesOrders' }" class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg></router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ so.number }}</h1>
        <span :class="statusBadge(so.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(so.status) }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Sales Order Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ so.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(so.date) }}</p></div>
              <div><p class="text-sm text-gray-500">Customer</p><p class="font-medium">{{ so.customer_name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ so.creator?.name || '-' }}</p></div>
            </div>
            <div v-if="so.notes" class="mt-4 p-3 bg-gray-50 rounded">
              <p class="text-sm text-gray-600"><strong>Notes:</strong> {{ so.notes }}</p>
            </div>
            <div v-if="so.decline_reason" class="mt-4 p-3 bg-red-50 rounded">
              <p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ so.decline_reason }}</p>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Material Requests</h2>
              <div v-if="so.status === 'approved'">
                <button @click="openMrModal" class="px-3 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">Create MR</button>
              </div>
            </div>

            <div v-if="!so.material_requests?.length" class="text-sm text-slate-500">
              No Material Request yet.
            </div>

            <div v-else class="space-y-3">
              <div v-for="mr in so.material_requests" :key="mr.id" class="border border-slate-200 rounded-lg p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="text-sm">
                    <div class="font-semibold text-slate-800">
                      MR:
                      <router-link :to="{ name: 'MaterialRequestDetail', params: { id: mr.id } }" class="text-primary-700 hover:underline">
                        {{ mr.number }}
                      </router-link>
                    </div>
                    <div class="text-slate-500">
                      Status: <span class="font-medium text-slate-700">{{ mr.status }}</span>
                      <span v-if="mr.date"> · Date: {{ formatDate(mr.date) }}</span>
                    </div>
                  </div>

                  <div class="text-sm text-slate-600">
                    <div v-if="mr.delivery_instruction">
                      DI:
                      <router-link :to="{ name: 'DeliveryInstructionDetail', params: { id: mr.delivery_instruction.id } }" class="text-primary-700 hover:underline">
                        {{ mr.delivery_instruction.number }}
                      </router-link>
                      <span class="text-slate-500">({{ mr.delivery_instruction.status }})</span>
                    </div>
                    <div v-else class="text-slate-400">DI: -</div>

                    <div v-if="mr.delivery_instruction?.delivery_note" class="mt-0.5">
                      DN:
                      <router-link :to="{ name: 'DeliveryNoteDetail', params: { id: mr.delivery_instruction.delivery_note.id } }" class="text-primary-700 hover:underline">
                        {{ mr.delivery_instruction.delivery_note.number }}
                      </router-link>
                      <span class="text-slate-500">({{ mr.delivery_instruction.delivery_note.status }})</span>
                    </div>
                    <div v-else class="text-slate-400 mt-0.5">DN: -</div>
                  </div>
                </div>

                <div class="mt-3">
                  <div class="text-xs font-semibold text-slate-600 mb-2">Items</div>
                  <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                      <thead>
                        <tr class="text-left text-xs text-slate-500 border-b border-slate-200">
                          <th class="py-2 pr-3">Item</th>
                          <th class="py-2 pr-3">Qty</th>
                          <th class="py-2 pr-3">Unit</th>
                          <th class="py-2 pr-3">Description</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr v-for="li in (mr.line_items || [])" :key="li.id">
                          <td class="py-2 pr-3">{{ li.item?.name || li.item_name || 'N/A' }}</td>
                          <td class="py-2 pr-3">{{ li.qty }}</td>
                          <td class="py-2 pr-3">{{ li.unit }}</td>
                          <td class="py-2 pr-3">{{ li.description || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div v-if="so.status === 'draft'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Submit</h2>
            <p class="text-sm text-gray-600 mb-3">Submit SO for review.</p>
            <button @click="submitSO" :disabled="actionLoading" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{{ actionLoading ? 'Submitting...' : 'Submit' }}</button>
          </div>

          <div v-if="so.status === 'submitted'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Approve / Decline</h2>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason</label>
              <textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea>
            </div>
            <div class="flex gap-2">
              <button @click="approveSO('approve')" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve</button>
              <button @click="approveSO('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>

          <div v-if="so.status === 'approved'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Next Step</h2>
            <p class="text-sm text-gray-600">
              Create MR first. After that, DI and DN will follow during the process.
            </p>
          </div>
        </div>
      </div>

      <div v-if="showMrModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showMrModal = false">
        <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-semibold text-slate-800">Create MR from {{ so.number }}</h2>
            <button @click="showMrModal = false" class="text-slate-400 hover:text-slate-600 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>
          </div>
          <div v-if="mrError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ mrError }}</div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">MR Notes</label>
              <textarea v-model="mrForm.notes" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="2" placeholder="Optional"></textarea>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-slate-800">Items</p>
              <button type="button" @click="addItem" class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Add Item
              </button>
            </div>

            <div v-for="(it, idx) in mrForm.items" :key="idx" class="border border-slate-200 rounded-lg p-3 bg-slate-50/40">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div class="md:col-span-5">
                  <label class="block text-xs font-medium text-slate-600 mb-1">Item</label>
                  <select v-model="it.item_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="() => { if (it.item_id) it.item_name = '' }">
                    <option value="">Manual input</option>
                    <option v-for="mi in masterItems" :key="mi.id" :value="mi.id">{{ mi.name }}</option>
                  </select>
                  <div v-if="!it.item_id" class="mt-2">
                    <input v-model="it.item_name" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" placeholder="Type item name..." />
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-600 mb-1">Qty</label>
                  <input v-model="it.qty" type="number" min="0.01" step="0.01" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                  <input v-model="it.unit" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" />
                </div>
                <div class="md:col-span-2">
                  <button type="button" @click="removeItem(idx)" class="w-full px-3 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
                </div>
                <div class="md:col-span-12">
                  <label class="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input v-model="it.description" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" placeholder="Optional" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="showMrModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" @click="createMR" :disabled="mrLoading || !mrForm.items.length" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{{ mrLoading ? 'Creating...' : 'Create MR' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from '../../utils/format'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const so = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const actionForm = reactive({ reason: '' })

const showMrModal = ref(false)
const mrLoading = ref(false)
const mrError = ref('')
const masterItems = ref([])
const mrForm = reactive({ notes: '', items: [] })

onMounted(() => { fetchSO(); fetchMasterItems() })

async function fetchSO() {
  loading.value = true
  try { const r = await api.get(`/sales-orders/${route.params.id}`); so.value = r.data.so }
  finally { loading.value = false }
}

async function fetchMasterItems() {
  const r = await api.get('/master-items', { params: { per_page: 200 } })
  masterItems.value = (r.data.data || []).filter(i => i.status === 'active')
}

async function submitSO() {
  actionLoading.value = true
  try { await api.post(`/sales-orders/${route.params.id}/submit`); await fetchSO() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

async function approveSO(action) {
  actionLoading.value = true
  try { await api.post(`/sales-orders/${route.params.id}/approve`, { action, reason: actionForm.reason }); actionForm.reason = ''; await fetchSO() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function openMrModal() {
  mrError.value = ''
  if (!mrForm.items.length) addItem()
  showMrModal.value = true
}

function addItem() {
  mrForm.items.push({ item_id: '', item_name: '', qty: 1, unit: 'pcs', description: '' })
}

function removeItem(idx) {
  mrForm.items.splice(idx, 1)
}

async function createMR() {
  mrLoading.value = true
  mrError.value = ''
  try {
    const payload = {
      notes: mrForm.notes || null,
      items: mrForm.items.map(i => ({
        item_id: i.item_id || null,
        item_name: i.item_id ? null : (i.item_name || null),
        qty: Number(i.qty),
        unit: i.unit,
        description: i.description || null,
      })),
    }
    const r = await api.post(`/sales-orders/${route.params.id}/material-requests`, payload)
    showMrModal.value = false
    Object.assign(mrForm, { notes: '', items: [] })
    await fetchSO()
  } catch (err) {
    mrError.value = err.response?.data?.message || 'Failed to create MR'
  } finally {
    mrLoading.value = false
  }
}

function formatStatus(s) { return { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', declined: 'Declined' }[s] || s }
function statusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', submitted: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>


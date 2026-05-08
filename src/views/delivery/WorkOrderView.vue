<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Work Orders</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage work orders from ORF references</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create WO
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search WO number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchWOs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchWOs">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="al_generated">AL Generated</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">WO Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ORF Ref</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PIC</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service Type</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="wo in wos.data" :key="wo.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'WorkOrderDetail', params: { id: wo.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ wo.number }}</router-link></td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(wo.date) }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ wo.order_request_form?.number || wo.orf_ref || '-' }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ wo.pic?.name || '-' }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ wo.service_type || '-' }}</td>
            <td class="px-5 py-3"><span :class="[woStatusBadge(wo.status), 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full']">{{ formatStatus(wo.status) }}</span></td>
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'WorkOrderDetail', params: { id: wo.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link></td>
          </tr>
          <tr v-if="!wos.data?.length"><td colspan="7" class="px-5 py-16 text-center text-sm text-slate-400">No work orders found</td></tr>
        </tbody>
      </table>

      <div v-if="wos.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="wos.current_page === 1" @click="page--; fetchWOs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ wos.current_page }} of {{ wos.last_page }}</span>
        <button :disabled="wos.current_page === wos.last_page" @click="page++; fetchWOs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Work Order</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createWO">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ORF</label>
              <select v-model="form.orf_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white">
                <option value="">Select ORF (optional)</option>
                <option v-for="o in orfs" :key="o.id" :value="o.id">{{ o.number }}{{ o.customer_name ? ` - ${o.customer_name}` : '' }}</option>
              </select>
              <p class="text-xs text-slate-500 mt-1">If ORF is selected, ORF Reference will be auto-filled.</p>
            </div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">ORF Reference</label><input v-model="form.orf_ref" :disabled="!!form.orf_id" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-500" placeholder="ORF number (optional)" /></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Service Type</label><input v-model="form.service_type" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="e.g. Rental, Installation" /></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Job Details</label><textarea v-model="form.job_details" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="3" placeholder="Describe the job..."></textarea></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">PIC (Person in Charge)</label><select v-model="form.pic_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"><option value="">Select PIC</option><option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option></select></div>

            <div class="pt-2">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-slate-800">Material Request (optional)</p>
                  <p class="text-xs text-slate-500 mt-0.5">If you add items here, the system will auto-create MR from this WO.</p>
                </div>
                <button type="button" @click="addMrItem" class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  Add Item
                </button>
              </div>

              <div class="mt-3 space-y-3" v-if="form.mr_items.length">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">MR Notes</label>
                  <textarea v-model="form.mr_notes" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="2" placeholder="Optional"></textarea>
                </div>

                <div v-for="(it, idx) in form.mr_items" :key="idx" class="border border-slate-200 rounded-lg p-3 bg-slate-50/40">
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
                      <button type="button" @click="removeMrItem(idx)" class="w-full px-3 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Remove
                      </button>
                    </div>
                    <div class="md:col-span-12">
                      <label class="block text-xs font-medium text-slate-600 mb-1">Description</label>
                      <input v-model="it.description" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" placeholder="Optional" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="createLoading" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{{ createLoading ? 'Creating...' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { formatDate } from '../../utils/format'
import api from '../../services/api'

const wos = ref({ data: [], current_page: 1, last_page: 1 })
const users = ref([])
const orfs = ref([])
const masterItems = ref([])
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')
const form = reactive({
  orf_id: '',
  orf_ref: '',
  service_type: '',
  job_details: '',
  pic_id: '',
  mr_notes: '',
  mr_items: [],
})

onMounted(() => { fetchWOs(); fetchUsers(); fetchORFs(); fetchMasterItems() })

async function fetchWOs() {
  const response = await api.get('/work-orders', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  wos.value = response.data
}

async function fetchUsers() {
  const response = await api.get('/users', { params: { per_page: 100 } })
  users.value = response.data.data || []
}

async function fetchORFs() {
  const response = await api.get('/order-request-forms', { params: { per_page: 100, status: 'approved' } })
  orfs.value = response.data.data || []
}

async function fetchMasterItems() {
  const response = await api.get('/master-items', { params: { per_page: 200 } })
  masterItems.value = (response.data.data || []).filter(i => i.status === 'active')
}

function addMrItem() {
  form.mr_items.push({ item_id: '', item_name: '', qty: 1, unit: 'pcs', description: '' })
}

function removeMrItem(idx) {
  form.mr_items.splice(idx, 1)
}

async function createWO() {
  createLoading.value = true; createError.value = ''
  try {
    const woPayload = {
      orf_id: form.orf_id || null,
      orf_ref: form.orf_ref || null,
      service_type: form.service_type || null,
      job_details: form.job_details || null,
      pic_id: form.pic_id || null,
    }

    const woRes = await api.post('/work-orders', woPayload)
    const woId = woRes.data?.work_order?.id

    if (woId && form.mr_items.length) {
      const mrPayload = {
        notes: form.mr_notes || null,
        items: form.mr_items.map(i => ({
          item_id: i.item_id || null,
          item_name: i.item_id ? null : (i.item_name || null),
          qty: Number(i.qty),
          unit: i.unit,
          description: i.description || null,
        })),
      }
      await api.post(`/work-orders/${woId}/material-requests`, mrPayload)
    }

    showCreateModal.value = false
    Object.assign(form, { orf_id: '', orf_ref: '', service_type: '', job_details: '', pic_id: '', mr_notes: '', mr_items: [] })
    await fetchWOs()
  } catch (err) { createError.value = err.response?.data?.message || 'Failed to create WO' }
  finally { createLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', pending_approval: 'Pending Approval', approved: 'Approved', al_generated: 'AL Generated', declined: 'Declined' }[s] || s }
function woStatusBadge(s) { return { draft: 'bg-amber-50 text-amber-700', pending_approval: 'bg-emerald-50 text-emerald-700', approved: 'bg-emerald-50 text-emerald-700', al_generated: 'bg-blue-50 text-blue-700', declined: 'bg-red-50 text-red-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>
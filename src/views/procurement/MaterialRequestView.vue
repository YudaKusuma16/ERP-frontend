<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Material Requests</h1>
        <p class="text-sm text-slate-500 mt-0.5">Request materials and supplies</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create MR
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search MR number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchMRs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchMRs">
          <option value="">All Status</option>
          <option value="pending_dept_head">Pending Dept Head</option>
          <option value="pending_pihak_ii">Pending Pihak II</option>
          <option value="approved">Approved</option>
          <option value="pr_created">PR Created</option>
          <option value="declined">Declined</option>
        </select>
        <select v-model="sourceFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchMRs">
          <option value="">All Sources</option>
          <option value="internal">Internal</option>
          <option value="asset">Asset</option>
          <option value="customer">Customer</option>
          <option value="project_internal">Project Internal</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MR Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requestor</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="mr in mrs.data" :key="mr.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'MaterialRequestDetail', params: { id: mr.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ mr.number }}</router-link>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(mr.date) }}</td>
            <td class="px-5 py-3 text-sm">
              <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">{{ formatSource(mr.source_type) }}</span>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ mr.requestor?.name }}</td>
            <td class="px-5 py-3">
              <span :class="mrStatusBadge(mr.status)" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ formatStatus(mr.status) }}</span>
            </td>
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'MaterialRequestDetail', params: { id: mr.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link>
            </td>
          </tr>
          <tr v-if="!mrs.data?.length">
            <td colspan="6" class="px-5 py-16 text-center text-sm text-slate-400">No material requests found</td>
          </tr>
        </tbody>
      </table>

      <div v-if="mrs.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="mrs.current_page === 1" @click="page--; fetchMRs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ mrs.current_page }} of {{ mrs.last_page }}</span>
        <button :disabled="mrs.current_page === mrs.last_page" @click="page++; fetchMRs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Material Request</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createMR">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
              <select v-model="form.source_type" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="internal">Internal</option>
                <option value="asset">Asset</option>
                <option value="customer">Customer</option>
                <option value="project_internal">Project Internal</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea v-model="form.notes" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="2"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Items</label>
              <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 mb-2 items-end">
                <div class="flex-1 space-y-1">
                  <select v-model="item.item_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" @change="onChangeItem(index)">
                    <option value="">Select Item (optional)</option>
                    <option v-for="mi in masterItems" :key="mi.id" :value="mi.id">{{ mi.name }} ({{ mi.unit }})</option>
                  </select>
                  <input v-model="item.item_name" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Or input item name manually" @input="onInputItemName(index)" />
                </div>
                <div class="w-24">
                  <input v-model.number="item.qty" type="number" step="0.01" min="0.01" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Qty" />
                </div>
                <div class="w-20">
                  <input v-model="item.unit" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Unit" />
                </div>
                <button type="button" @click="form.items.splice(index, 1)" class="px-2 py-2 text-red-500 hover:text-red-700 transition-colors">&times;</button>
              </div>
              <button type="button" @click="form.items.push({ item_id: '', item_name: '', qty: 1, unit: '', description: '' })" class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">+ Add Item</button>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="createLoading" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{{ createLoading ? 'Creating...' : 'Create MR' }}</button>
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

const mrs = ref({ data: [], current_page: 1, last_page: 1 })
const masterItems = ref([])
const search = ref('')
const statusFilter = ref('')
const sourceFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const form = reactive({
  source_type: 'internal',
  notes: '',
  items: [{ item_id: '', item_name: '', qty: 1, unit: '', description: '' }]
})

onMounted(() => {
  fetchMRs()
  fetchMasterItems()
})

async function fetchMRs() {
  const response = await api.get('/material-requests', {
    params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined, source_type: sourceFilter.value || undefined }
  })
  mrs.value = response.data
}

async function fetchMasterItems() {
  const response = await api.get('/master-items', { params: { status: 'active', per_page: 100 } })
  masterItems.value = response.data.data || []
}

async function createMR() {
  createLoading.value = true
  createError.value = ''
  try {
    const invalidItem = form.items.find(i => !i.item_id && !i.item_name?.trim())
    if (invalidItem) {
      createError.value = 'Setiap baris item harus pilih item atau isi nama item manual.'
      return
    }
    await api.post('/material-requests', form)
    showCreateModal.value = false
    Object.assign(form, { source_type: 'internal', notes: '', items: [{ item_id: '', item_name: '', qty: 1, unit: '', description: '' }] })
    await fetchMRs()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to create MR'
    if (err.response?.data?.errors) {
      const msgs = Object.values(err.response.data.errors).flat().join(' ')
      createError.value = msgs
    }
  } finally {
    createLoading.value = false
  }
}

function onChangeItem(index) {
  const selected = masterItems.value.find(mi => mi.id === form.items[index].item_id)
  if (selected) {
    form.items[index].unit = selected.unit || form.items[index].unit
    form.items[index].item_name = ''
  }
}

function onInputItemName(index) {
  if (form.items[index].item_name?.trim()) {
    form.items[index].item_id = ''
  }
}

function formatSource(type) {
  const sources = { internal: 'Internal', asset: 'Asset', customer: 'Customer', project_internal: 'Project Internal' }
  return sources[type] || type
}

function formatStatus(status) {
  const statuses = {
    draft: 'Draft', pending_dept_head: 'Pending Dept Head', pending_pihak_ii: 'Pending Pihak II',
    approved: 'Approved', pr_created: 'PR Created', declined: 'Declined'
  }
  return statuses[status] || status
}

function mrStatusBadge(status) {
  const classes = {
    draft: 'bg-slate-100 text-slate-600',
    pending_dept_head: 'bg-amber-50 text-amber-700',
    pending_pihak_ii: 'bg-orange-50 text-orange-700',
    approved: 'bg-emerald-50 text-emerald-700',
    pr_created: 'bg-blue-50 text-blue-700',
    declined: 'bg-red-50 text-red-700'
  }
  return classes[status] || 'bg-slate-100 text-slate-600'
}
</script>
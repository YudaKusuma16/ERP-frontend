<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Service Requests</h1>
        <p class="text-sm text-slate-500 mt-0.5">Request services and repairs</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create SR
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search SR number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchSRs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchSRs">
          <option value="">All Status</option>
          <option value="pending_dept_head">Pending Dept Head</option>
          <option value="pending_pihak_ii">Pending Pihak II</option>
          <option value="approved">Approved</option>
          <option value="pr_created">PR Created</option>
          <option value="declined">Declined</option>
        </select>
        <select v-model="sourceFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchSRs">
          <option value="">All Sources</option>
          <option value="internal">Internal</option>
          <option value="customer">Customer</option>
          <option value="3rd_party">3rd Party</option>
          <option value="project">Project</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SR Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requestor</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="sr in srs.data" :key="sr.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'ServiceRequestDetail', params: { id: sr.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ sr.number }}</router-link>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(sr.date) }}</td>
            <td class="px-5 py-3 text-sm">
              <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700">{{ formatSource(sr.source_type) }}</span>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ sr.requestor?.name }}</td>
            <td class="px-5 py-3">
              <span :class="srStatusBadge(sr.status)" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ formatStatus(sr.status) }}</span>
            </td>
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'ServiceRequestDetail', params: { id: sr.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link>
            </td>
          </tr>
          <tr v-if="!srs.data?.length">
            <td colspan="6" class="px-5 py-16 text-center text-sm text-slate-400">No service requests found</td>
          </tr>
        </tbody>
      </table>

      <div v-if="srs.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="srs.current_page === 1" @click="page--; fetchSRs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ srs.current_page }} of {{ srs.last_page }}</span>
        <button :disabled="srs.current_page === srs.last_page" @click="page++; fetchSRs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Service Request</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createSR">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
              <select v-model="form.source_type" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="internal">Internal</option>
                <option value="customer">Customer</option>
                <option value="3rd_party">3rd Party (from ORF)</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div v-if="form.source_type === '3rd_party'">
              <label class="block text-sm font-medium text-slate-700 mb-1">Source Document Reference (ORF Number)</label>
              <input v-model="form.source_doc_ref" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea v-model="form.notes" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="2"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Service Items</label>
              <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 mb-2 items-end">
                <div class="flex-1"><input v-model="item.service_name" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Service name" /></div>
                <div class="w-20"><input v-model.number="item.qty" type="number" step="0.01" min="0.01" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Qty" /></div>
                <div class="w-20"><input v-model="item.unit" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Unit" /></div>
                <div class="w-28"><input v-model.number="item.est_cost" type="number" step="0.01" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Est. Cost" /></div>
                <button type="button" @click="form.items.splice(index, 1)" class="px-2 py-2 text-red-500 hover:text-red-700 transition-colors">&times;</button>
              </div>
              <button type="button" @click="form.items.push({ service_name: '', qty: 1, unit: '', est_cost: null, description: '' })" class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">+ Add Service</button>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="createLoading" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{{ createLoading ? 'Creating...' : 'Create SR' }}</button>
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

const srs = ref({ data: [], current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const sourceFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const form = reactive({ source_type: 'internal', source_doc_ref: '', notes: '', items: [{ service_name: '', qty: 1, unit: '', est_cost: null, description: '' }] })

onMounted(() => fetchSRs())

async function fetchSRs() {
  const response = await api.get('/service-requests', {
    params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined, source_type: sourceFilter.value || undefined }
  })
  srs.value = response.data
}

async function createSR() {
  createLoading.value = true
  createError.value = ''
  try {
    await api.post('/service-requests', form)
    showCreateModal.value = false
    Object.assign(form, { source_type: 'internal', source_doc_ref: '', notes: '', items: [{ service_name: '', qty: 1, unit: '', est_cost: null, description: '' }] })
    await fetchSRs()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to create SR'
  } finally { createLoading.value = false }
}

function formatSource(t) { return { internal:'Internal',customer:'Customer','3rd_party':'3rd Party',project:'Project' }[t] || t }
function formatStatus(s) { return { draft:'Draft',pending_dept_head:'Pending Dept Head',pending_pihak_ii:'Pending Pihak II',approved:'Approved',pr_created:'PR Created',declined:'Declined' }[s] || s }
function srStatusBadge(s) { return { draft:'bg-slate-100 text-slate-600',pending_dept_head:'bg-amber-50 text-amber-700',pending_pihak_ii:'bg-orange-50 text-orange-700',approved:'bg-emerald-50 text-emerald-700',pr_created:'bg-blue-50 text-blue-700',declined:'bg-red-50 text-red-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>
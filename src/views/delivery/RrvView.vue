<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Return Replacement Vouchers</h1>
        <p class="text-sm text-slate-500 mt-0.5">Track item returns and replacements</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create RRV
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search RRV number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchRRVs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchRRVs">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RRV Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SR Reference</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="rrv in rrvs.data" :key="rrv.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'RrvDetail', params: { id: rrv.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ rrv.number }}</router-link></td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(rrv.date) }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ rrv.service_request?.number || '-' }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ rrv.vendor?.name || '-' }}</td>
            <td class="px-5 py-3"><span :class="[statusBadge(rrv.status), 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full']">{{ formatStatus(rrv.status) }}</span></td>
          </tr>
          <tr v-if="!rrvs.data?.length"><td colspan="5" class="px-5 py-16 text-center text-sm text-slate-400">No RRVs found</td></tr>
        </tbody>
      </table>

      <div v-if="rrvs.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="rrvs.current_page === 1" @click="page--; fetchRRVs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ rrvs.current_page }} of {{ rrvs.last_page }}</span>
        <button :disabled="rrvs.current_page === rrvs.last_page" @click="page++; fetchRRVs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create RRV</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createRRV">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Service Request (optional)</label><select v-model="form.sr_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"><option value="">None</option><option v-for="sr in serviceRequests" :key="sr.id" :value="sr.id">{{ sr.number }}</option></select></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Delivery Note (optional)</label><select v-model="form.dn_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"><option value="">None</option><option v-for="dn in deliveryNotes" :key="dn.id" :value="dn.id">{{ dn.number }}</option></select></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Vendor (optional)</label><select v-model="form.vendor_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"><option value="">None</option><option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.name }}</option></select></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Replacement Item Details</label><textarea v-model="form.replacement_item_detail" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="3" placeholder="Describe the replacement item..."></textarea></div>
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

const rrvs = ref({ data: [], current_page: 1, last_page: 1 })
const serviceRequests = ref([])
const deliveryNotes = ref([])
const vendors = ref([])
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')
const form = reactive({ sr_id: '', dn_id: '', vendor_id: '', replacement_item_detail: '' })

onMounted(() => { fetchRRVs(); fetchDropdownData() })

async function fetchRRVs() {
  const r = await api.get('/rrvs', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  rrvs.value = r.data
}

async function fetchDropdownData() {
  const [srRes, dnRes, vRes] = await Promise.all([
    api.get('/service-requests', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
    api.get('/delivery-notes', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
    api.get('/master-vendors', { params: { per_page: 100, status: 'active' } }).catch(() => ({ data: { data: [] } }))
  ])
  serviceRequests.value = srRes.data.data || []
  deliveryNotes.value = dnRes.data.data || []
  vendors.value = vRes.data.data || []
}

async function createRRV() {
  createLoading.value = true; createError.value = ''
  try {
    await api.post('/rrvs', form)
    showCreateModal.value = false
    Object.assign(form, { sr_id: '', dn_id: '', vendor_id: '', replacement_item_detail: '' })
    await fetchRRVs()
  } catch (err) { createError.value = err.response?.data?.message || 'Failed' }
  finally { createLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', confirmed: 'Confirmed' }[s] || s }
function statusBadge(s) { return { draft: 'bg-amber-50 text-amber-700', confirmed: 'bg-emerald-50 text-emerald-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>
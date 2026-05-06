<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Pre-Receiving Documents</h1>
        <p class="text-sm text-slate-500 mt-0.5">Create receiving documents from approved POs</p>
      </div>
      <button @click="showCreateModal = true" :disabled="!openPOs.length" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create Pre-RD
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search Pre-RD number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchPreRds" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchPreRds">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="rd_generated">RD Generated</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pre-RD Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO Reference</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pihak 1</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="preRd in preRds.data" :key="preRd.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'PreReceivingDocumentDetail', params: { id: preRd.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ preRd.number }}</router-link></td>
            <td class="px-5 py-3 text-sm">{{ formatDate(preRd.date) }}</td>
            <td class="px-5 py-3 text-sm">{{ preRd.purchase_order?.number || '-' }}</td>
            <td class="px-5 py-3 text-sm">{{ preRd.pihak1?.name || '-' }}</td>
            <td class="px-5 py-3"><span :class="statusBadge(preRd.status)" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ formatStatus(preRd.status) }}</span></td>
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'PreReceivingDocumentDetail', params: { id: preRd.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link></td>
          </tr>
          <tr v-if="!preRds.data?.length"><td colspan="6" class="px-5 py-16 text-center text-sm text-slate-400">No items found</td></tr>
        </tbody>
      </table>

      <div v-if="preRds.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <span class="text-xs text-slate-500">Page {{ preRds.current_page }} of {{ preRds.last_page }}</span>
        <div class="flex gap-2">
          <button :disabled="preRds.current_page === 1" @click="page--; fetchPreRds()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
          <button :disabled="preRds.current_page === preRds.last_page" @click="page++; fetchPreRds()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Pre-Receiving Document</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createPreRd">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Purchase Order</label>
              <select v-model="form.po_id" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" @change="loadPOLines">
                <option value="">Select PO</option>
                <option v-for="po in openPOs" :key="po.id" :value="po.id">{{ po.number }} — {{ po.vendor?.name || '-' }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input v-model="form.notes" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Optional notes" />
            </div>
          </div>
          <div v-if="form.po_id && form.lines.length" class="mb-4">
            <h3 class="text-sm font-semibold mb-2 text-slate-700">Received Items</h3>
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ordered Qty</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Received Qty</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Received Unit</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(line, index) in form.lines" :key="index">
                    <td class="px-3 py-2 text-sm">{{ line.item_name }}</td>
                    <td class="px-3 py-2 text-sm">{{ line.ordered_qty }}</td>
                    <td class="px-3 py-2 text-sm">{{ line.unit }}</td>
                    <td class="px-3 py-2"><input v-model.number="line.received_qty" type="number" step="0.01" min="0.01" required class="w-full px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" /></td>
                    <td class="px-3 py-2"><input v-model="line.received_unit" type="text" required class="w-full px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" /></td>
                    <td class="px-3 py-2"><input v-model="line.notes" type="text" class="w-full px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="createLoading" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{{ createLoading ? 'Creating...' : 'Create Pre-RD' }}</button>
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

const preRds = ref({ data: [], current_page: 1, last_page: 1 })
const openPOs = ref([])
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const form = reactive({
  po_id: '',
  notes: '',
  lines: []
})

onMounted(() => { fetchPreRds(); fetchOpenPOs() })

async function fetchPreRds() {
  const response = await api.get('/pre-receiving-documents', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  preRds.value = response.data
}

async function fetchOpenPOs() {
  const response = await api.get('/purchase-orders', { params: { per_page: 100 } })
  openPOs.value = (response.data.data || []).filter(po => ['approved', 'open'].includes(po.status))
}

async function loadPOLines() {
  if (!form.po_id) { form.lines = []; return }
  const response = await api.get(`/purchase-orders/${form.po_id}`)
  const po = response.data.po
  form.lines = po.line_items.map(i => ({
    po_line_id: i.id,
    item_name: i.item_name,
    ordered_qty: i.qty,
    unit: i.unit,
    received_qty: i.qty,
    received_unit: i.unit,
    notes: ''
  }))
}

async function createPreRd() {
  createLoading.value = true
  createError.value = ''
  try {
    const payload = {
      po_id: form.po_id,
      notes: form.notes || undefined,
      lines: form.lines.map(l => ({
        po_line_id: l.po_line_id,
        received_qty: l.received_qty,
        received_unit: l.received_unit,
        notes: l.notes || undefined
      }))
    }
    await api.post('/pre-receiving-documents', payload)
    showCreateModal.value = false
    Object.assign(form, { po_id: '', notes: '', lines: [] })
    await fetchPreRds()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to create Pre-RD'
  } finally { createLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', confirmed: 'Confirmed', rd_generated: 'RD Generated' }[s] || s }
function statusBadge(s) { return { draft: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700', rd_generated: 'bg-emerald-50 text-emerald-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>
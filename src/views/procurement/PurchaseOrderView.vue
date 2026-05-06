<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Purchase Orders</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage purchase orders from approved requisitions</p>
      </div>
      <button @click="showCreateModal = true" :disabled="!approvedPRs.length" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create PO
      </button>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search PO number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchPOs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchPOs">
          <option value="">All Status</option>
          <option value="pending_pihak_ii">Pending Pihak II</option>
          <option value="approved">Approved</option>
          <option value="open">Open</option>
          <option value="declined">Declined</option>
        </select>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="po in pos.data" :key="po.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'PurchaseOrderDetail', params: { id: po.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ po.number }}</router-link></td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(po.date) }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ po.vendor?.name || '-' }}</td>
            <td class="px-5 py-3 text-sm text-slate-800">{{ formatCurrency(po.total_value) }}</td>
            <td class="px-5 py-3"><span :class="poStatusBadge(po.status)" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ formatStatus(po.status) }}</span></td>
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'PurchaseOrderDetail', params: { id: po.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link></td>
          </tr>
          <tr v-if="!pos.data?.length"><td colspan="6" class="px-5 py-16 text-center text-sm text-slate-400">No purchase orders found</td></tr>
        </tbody>
      </table>
      <div v-if="pos.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="pos.current_page === 1" @click="page--; fetchPOs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ pos.current_page }} of {{ pos.last_page }}</span>
        <button :disabled="pos.current_page === pos.last_page" @click="page++; fetchPOs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Purchase Order</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createPO">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Purchase Requisition</label>
                <select v-model="form.pr_id" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" @change="loadPRItems">
                  <option value="">Select PR</option>
                  <option v-for="pr in approvedPRs" :key="pr.id" :value="pr.id">{{ pr.number }} ({{ formatType(pr.pr_type) }})</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                <select v-model="form.vendor_id" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="">Select Vendor</option>
                  <option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Term of Payment</label>
              <input v-model="form.term_of_payment" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Net 30, COD, etc." />
            </div>
          </div>
          <div v-if="form.pr_id" class="mt-4">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">PO Line Items</h3>
            <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 mb-2 items-end">
              <div class="flex-2"><input :value="item.item_name" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50" readonly /></div>
              <div class="w-20"><input v-model.number="item.qty" type="number" step="0.01" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" /></div>
              <div class="w-20"><input :value="item.unit" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50" readonly /></div>
              <div class="w-32"><input v-model.number="item.final_price" type="number" step="0.01" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Final Price" /></div>
              <div class="w-20"><input v-model.number="item.discount" type="number" step="0.01" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Disc" /></div>
              <div class="w-24"><select v-model="item.discount_type" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"><option value="fixed">Fixed</option><option value="percentage">%</option></select></div>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">Price Comparison (min. 2 vendors)</h3>
            <div v-for="(comp, index) in form.price_comparisons" :key="index" class="flex gap-2 mb-2">
              <div class="flex-1"><input v-model="comp.vendor_name" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Vendor name" /></div>
              <div class="w-32"><input v-model.number="comp.quoted_price" type="number" step="0.01" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Quoted Price" /></div>
              <div class="flex-1"><input v-model="comp.notes" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Notes" /></div>
              <button v-if="form.price_comparisons.length > 2" type="button" @click="form.price_comparisons.splice(index, 1)" class="px-2 text-red-500 hover:text-red-700 transition-colors">&times;</button>
            </div>
            <button type="button" @click="form.price_comparisons.push({ vendor_name: '', quoted_price: 0, notes: '' })" class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">+ Add Comparison</button>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="createLoading" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{{ createLoading ? 'Creating...' : 'Create PO' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { formatDate, formatCurrency } from '../../utils/format'
import api from '../../services/api'

const pos = ref({ data: [], current_page: 1, last_page: 1 })
const approvedPRs = ref([])
const vendors = ref([])
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const form = reactive({
  pr_id: '', vendor_id: '', term_of_payment: '',
  items: [], price_comparisons: [{ vendor_name: '', quoted_price: 0, notes: '' }, { vendor_name: '', quoted_price: 0, notes: '' }]
})

onMounted(() => { fetchPOs(); fetchPRs(); fetchVendors() })

async function fetchPOs() {
  const response = await api.get('/purchase-orders', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  pos.value = response.data
}

async function fetchPRs() {
  const response = await api.get('/purchase-requisitions', { params: { status: 'forwarded_to_p3', per_page: 100 } })
  approvedPRs.value = response.data.data || []
}

async function fetchVendors() {
  const response = await api.get('/master-vendors', { params: { status: 'active', per_page: 100 } })
  vendors.value = response.data.data || []
}

async function loadPRItems() {
  if (!form.pr_id) { form.items = []; return }
  const response = await api.get(`/purchase-requisitions/${form.pr_id}`)
  const pr = response.data.pr
  form.items = pr.line_items.map(i => ({ item_name: i.item_name, qty: i.qty, unit: i.unit, final_price: i.initial_price || 0, discount: 0, discount_type: 'fixed', description: i.description || '' }))
}

async function createPO() {
  createLoading.value = true
  createError.value = ''
  try {
    await api.post('/purchase-orders', form)
    showCreateModal.value = false
    Object.assign(form, { pr_id: '', vendor_id: '', term_of_payment: '', items: [], price_comparisons: [{ vendor_name: '', quoted_price: 0, notes: '' }, { vendor_name: '', quoted_price: 0, notes: '' }] })
    await fetchPOs()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to create PO'
  } finally { createLoading.value = false }
}

function formatStatus(s) { return { pending_pihak_ii:'Pending Pihak II', approved:'Approved', open:'Open', partially_closed:'Partially Closed', closed:'Closed', declined:'Declined' }[s] || s }
function poStatusBadge(s) { return { pending_pihak_ii:'bg-orange-50 text-orange-700', approved:'bg-emerald-50 text-emerald-700', open:'bg-blue-50 text-blue-700', partially_closed:'bg-amber-50 text-amber-700', closed:'bg-slate-100 text-slate-600', declined:'bg-red-50 text-red-700' }[s] || 'bg-slate-100 text-slate-600' }
function formatType(t) { return t === 'project' ? 'Project' : 'Non-Project' }
</script>
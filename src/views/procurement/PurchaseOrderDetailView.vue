<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="po">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'PurchaseOrders' }" class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg></router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ po.number }}</h1>
        <span :class="poStatusBadge(po.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(po.status) }}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">PO Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ po.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(po.date) }}</p></div>
              <div><p class="text-sm text-gray-500">PR Reference</p><p class="font-medium">{{ po.purchase_requisition?.number }}</p></div>
              <div><p class="text-sm text-gray-500">Vendor</p><p class="font-medium">{{ po.vendor?.name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Total Value</p><p class="font-medium text-lg">{{ formatCurrency(po.total_value) }}</p></div>
              <div><p class="text-sm text-gray-500">Term of Payment</p><p class="font-medium">{{ po.term_of_payment || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Approval Tiers</p><p class="font-medium">{{ po.tier_count }} tier(s) — Current: {{ po.current_tier }}</p></div>
              <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ po.created_by?.name || '-' }}</p></div>
            </div>
            <div v-if="po.decline_reason" class="mt-4 p-3 bg-red-50 rounded"><p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ po.decline_reason }}</p></div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">Line Items</h2>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Final Price</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Discount</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in po.line_items" :key="item.id">
                  <td class="px-4 py-3 text-sm">{{ item.item_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.qty }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.unit }}</td>
                  <td class="px-4 py-3 text-sm">{{ formatCurrency(item.final_price) }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.discount }}{{ item.discount_type === 'percentage' ? '%' : '' }}</td>
                  <td class="px-4 py-3 text-sm font-medium">{{ formatCurrency(item.qty * item.final_price - (item.discount_type === 'percentage' ? item.qty * item.final_price * item.discount / 100 : item.discount)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Price Comparison</h2>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Vendor</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Quoted Price</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="comp in po.price_comparisons" :key="comp.id">
                  <td class="px-4 py-3 text-sm">{{ comp.vendor_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ formatCurrency(comp.quoted_price) }}</td>
                  <td class="px-4 py-3 text-sm">{{ comp.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="space-y-6">
          <div v-if="canApprovePihak2" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Pihak II Approval</h2>
            <p class="text-sm text-gray-500 mb-2">Tier {{ po.current_tier + 1 }} of {{ po.tier_count }}</p>
            <div class="mb-3"><label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label><textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea></div>
            <div class="flex gap-2">
              <button @click="approvePO" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve (Tier {{ po.current_tier + 1 }})</button>
              <button @click="declinePO" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>
          <AuditTrail :logs="po.approval_logs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { formatDate, formatCurrency } from '../../utils/format'
import AuditTrail from '../../components/AuditTrail.vue'
import api from '../../services/api'

const route = useRoute()
const authStore = useAuthStore()
const po = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const actionForm = reactive({ reason: '' })

const canApprovePihak2 = computed(() => po.value?.status === 'pending_pihak_ii' && authStore.hasRole('pihak_2'))

onMounted(() => fetchPO())

async function fetchPO() {
  loading.value = true
  try { const response = await api.get(`/purchase-orders/${route.params.id}`); po.value = response.data.po }
  finally { loading.value = false }
}

async function approvePO() {
  actionLoading.value = true
  try { await api.post(`/purchase-orders/${route.params.id}/approve-pihak2`, { action: 'approve' }); await fetchPO() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

async function declinePO() {
  actionLoading.value = true
  try { await api.post(`/purchase-orders/${route.params.id}/approve-pihak2`, { action: 'decline', reason: actionForm.reason }); await fetchPO(); actionForm.reason = '' }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatStatus(s) { return { pending_pihak_ii:'Pending Pihak II', approved:'Approved', open:'Open', partially_closed:'Partially Closed', closed:'Closed', declined:'Declined' }[s] || s }
function poStatusBadge(s) { return { pending_pihak_ii:'bg-orange-100 text-orange-700', approved:'bg-green-100 text-green-700', open:'bg-blue-100 text-blue-700', partially_closed:'bg-yellow-100 text-yellow-700', closed:'bg-gray-100 text-gray-700', declined:'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }

</script>
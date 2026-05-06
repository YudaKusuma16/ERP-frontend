<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Document Status Summary</h2>
        <div v-if="loading" class="text-center py-4 text-gray-500">Loading...</div>
        <div v-else>
          <div v-for="(label, key) in docLabels" :key="key" class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">{{ label }}</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="(count, status) in stats[key]" :key="status" class="px-3 py-1 text-xs rounded-full" :class="statusColor(status)">
                {{ formatStatus(status) }}: {{ count }}
              </span>
              <span v-if="!Object.keys(stats[key] || {}).length" class="text-sm text-gray-400">No data</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Department Spend (PO Value)</h2>
        <div v-if="loading" class="text-center py-4 text-gray-500">Loading...</div>
        <div v-else-if="!stats.department_spend?.length" class="text-sm text-gray-400">No data</div>
        <div v-else>
          <div v-for="dept in stats.department_spend" :key="dept.name" class="flex items-center justify-between py-2 border-b last:border-0">
            <span class="text-sm">{{ dept.name || 'Unknown' }}</span>
            <span class="text-sm font-medium">{{ formatCurrency(dept.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Top Vendors by PO Value</h2>
        <div v-if="loading" class="text-center py-4 text-gray-500">Loading...</div>
        <div v-else-if="!stats.vendor_spend?.length" class="text-sm text-gray-400">No data</div>
        <div v-else>
          <div v-for="vendor in stats.vendor_spend" :key="vendor.name" class="flex items-center justify-between py-2 border-b last:border-0">
            <span class="text-sm">{{ vendor.name }}</span>
            <span class="text-sm font-medium">{{ formatCurrency(vendor.total) }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Monthly PO Volume</h2>
        <div v-if="loading" class="text-center py-4 text-gray-500">Loading...</div>
        <div v-else-if="!stats.monthly_volume?.length" class="text-sm text-gray-400">No data</div>
        <div v-else>
          <div v-for="month in stats.monthly_volume" :key="month.month" class="flex items-center justify-between py-2 border-b last:border-0">
            <span class="text-sm">{{ month.month }}</span>
            <span class="text-sm">{{ month.count }} POs — {{ formatCurrency(month.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-lg font-semibold mb-4">Approval Turnaround (Avg Hours)</h2>
      <div v-if="turnaroundLoading" class="text-center py-4 text-gray-500">Loading...</div>
      <div v-else-if="!turnaround.length" class="text-sm text-gray-400">No data yet</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="item in turnaround" :key="item.doc_type" class="p-4 bg-gray-50 rounded text-center">
          <p class="text-2xl font-bold text-blue-600">{{ Math.round(item.avg_hours) }}</p>
          <p class="text-sm text-gray-600">{{ item.doc_type }} ({{ item.total_docs }} docs)</p>
          <p class="text-xs text-gray-400">avg hours</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Export Data</h2>
      <p class="text-sm text-gray-600 mb-4">Download document data as CSV files.</p>
      <div class="flex flex-wrap gap-3">
        <button @click="exportData('material-requests')" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Export MRs</button>
        <button @click="exportData('service-requests')" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Export SRs</button>
        <button @click="exportData('purchase-orders')" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Export POs</button>
        <button @click="exportData('work-orders')" class="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">Export WOs</button>
        <button @click="exportData('receiving-documents')" class="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700">Export RDs</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { formatCurrency } from '../../utils/format'

const stats = ref({})
const turnaround = ref([])
const loading = ref(true)
const turnaroundLoading = ref(true)

const docLabels = {
  mr_by_status: 'Material Requests',
  sr_by_status: 'Service Requests',
  pr_by_status: 'Purchase Requisitions',
  po_by_status: 'Purchase Orders',
  wo_by_status: 'Work Orders'
}

onMounted(async () => {
  try {
    const [dashboardRes, turnaroundRes] = await Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/approval-turnaround')
    ])
    stats.value = dashboardRes.data
    turnaround.value = turnaroundRes.data.turnaround || []
  } catch (err) {
    console.error('Failed to load reports', err)
  } finally {
    loading.value = false
    turnaroundLoading.value = false
  }
})

function formatStatus(s) {
  const map = {
    draft: 'Draft', pending_dept_head: 'Pending Dept Head', pending_pihak_ii: 'Pending Pihak II',
    pending_pihak_i_pricing: 'Pending Pihak I', pending_approval: 'Pending Approval',
    approved: 'Approved', declined: 'Declined', forwarded_to_p3: 'Forwarded to P3',
    pr_created: 'PR Created', open: 'Open', partially_closed: 'Partially Closed', closed: 'Closed',
    auto_created: 'Auto Created', confirmed: 'Confirmed', rd_generated: 'RD Generated',
    pending_input: 'Pending Input', validating: 'Validating', asset_tagged: 'Asset Tagged',
    al_generated: 'AL Generated', in_progress: 'In Progress', completed: 'Completed',
    issued: 'Issued', dispatched: 'Dispatched'
  }
  return map[s] || s
}

function statusColor(s) {
  const greens = ['approved', 'active', 'closed', 'completed', 'confirmed', 'rd_generated', 'asset_tagged', 'al_generated', 'issued', 'dispatched', 'forwarded_to_p3']
  const oranges = ['pending_dept_head', 'pending_pihak_ii', 'pending_pihak_i_pricing', 'pending_approval', 'pending_input', 'validating']
  const yellows = ['draft', 'auto_created']
  const reds = ['declined']
  if (greens.includes(s)) return 'bg-green-100 text-green-700'
  if (oranges.includes(s)) return 'bg-orange-100 text-orange-700'
  if (yells.includes(s)) return 'bg-yellow-100 text-yellow-700'
  if (reds.includes(s)) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function exportData(type) {
  api.get(`/export/${type}`, { responseType: 'blob' }).then(response => {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${type}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }).catch(err => {
    alert('Export failed: ' + (err.response?.data?.message || err.message))
  })
}
</script>
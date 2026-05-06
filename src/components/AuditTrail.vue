<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5">
    <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Audit Trail</h2>
    <div v-if="!logs?.length" class="text-sm text-slate-400 py-2">No records yet</div>
    <div v-else class="flow-root">
      <ul role="list" class="-mb-8">
        <li v-for="(log, index) in logs" :key="log.id || index">
          <div class="relative pb-8">
            <span v-if="index !== logs.length - 1" class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
            <div class="relative flex items-start gap-3">
              <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                <div class="h-2 w-2 rounded-full bg-slate-500"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <p class="text-sm font-medium text-slate-800">{{ log.actor?.name || 'System' }}</p>
                  <span class="text-xs text-slate-400">&rarr;</span>
                  <span class="text-xs font-medium text-slate-600">{{ formatStatus(log.to_status) }}</span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">{{ formatDateTime(log.created_at) }}</p>
                <div v-if="log.comment" class="mt-1 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{{ log.comment }}</div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { formatDate, formatDateTime } from '../utils/format'

defineProps({
  logs: { type: Array, default: () => [] }
})

const statusLabels = {
  draft: 'Draft', inactive: 'Inactive', pending_accounting: 'Pending Accounting',
  pending_dept_head: 'Pending Dept Head', pending_pihak_ii: 'Pending Pihak II',
  pending_pihak_i_pricing: 'Pending Pihak I', pending_approval: 'Pending Approval',
  pending_input: 'Pending Input', validating: 'Validating', approved: 'Approved',
  active: 'Active', declined: 'Declined', pr_created: 'PR Created',
  forwarded_to_p3: 'Forwarded to P3', confirmed: 'Confirmed', rd_generated: 'RD Generated',
  al_generated: 'AL Generated', asset_tagged: 'Asset Tagged', in_progress: 'In Progress',
  completed: 'Completed', issued: 'Issued', dispatched: 'Dispatched', open: 'Open',
  partially_closed: 'Partially Closed', closed: 'Closed', auto_created: 'Auto Created',
  created: 'Created',
}

function formatStatus(s) { return statusLabels[s] || s }
</script>
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Notifications</h1>
      <button @click="markAllRead" class="text-sm text-blue-600 hover:text-blue-800">Mark all as read</button>
    </div>
    <div class="space-y-3">
      <div v-if="!notifications.data?.length" class="text-center text-gray-500 py-8">No notifications</div>
      <div
        v-for="notif in notifications.data"
        :key="notif.id"
        @click="handleNotificationClick(notif)"
        :class="[
          'bg-white rounded-lg shadow p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors',
          notif.is_read ? 'border-gray-300' : 'border-blue-500'
        ]"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-gray-800">{{ notif.title }}</p>
            <p v-if="notif.body" class="text-sm text-gray-600 mt-1">{{ notif.body }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatDateTime(notif.created_at) }}</p>
          </div>
          <button
            v-if="!notif.is_read"
            @click.stop="markRead(notif.id)"
            class="text-xs text-blue-600 hover:underline px-2 py-1 rounded hover:bg-blue-50"
          >
            Mark read
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notification'
import { formatDateTime } from '../../utils/format'

const router = useRouter()
const notificationStore = useNotificationStore()
const notifications = ref({ data: [] })

const documentTypeToRoute = {
  mr: { name: 'MaterialRequestDetail', paramKey: 'id' },
  sr: { name: 'ServiceRequestDetail', paramKey: 'id' },
  pr: { name: 'PurchaseRequisitionDetail', paramKey: 'id' },
  po: { name: 'PurchaseOrderDetail', paramKey: 'id' },
  pre_rd: { name: 'PreReceivingDocumentDetail', paramKey: 'id' },
  rd: { name: 'ReceivingDocumentDetail', paramKey: 'id' },
  di: { name: 'DeliveryInstructionDetail', paramKey: 'id' },
  dn: { name: 'DeliveryNoteDetail', paramKey: 'id' },
  wo: { name: 'WorkOrderDetail', paramKey: 'id' },
  al: { name: 'AcceptanceLetterDetail', paramKey: 'id' },
  rrv: { name: 'RrvDetail', paramKey: 'id' },
  orf: { name: 'OrderRequestFormDetail', paramKey: 'id' },
  so: { name: 'SalesOrderDetail', paramKey: 'id' },
  master_item: { name: 'MasterItemDetail', paramKey: 'id' },
  master_vendor: { name: 'MasterVendorDetail', paramKey: 'id' },
}

onMounted(async () => {
  const data = await notificationStore.fetchNotifications()
  notifications.value = data
})

async function markRead(id) {
  await notificationStore.markAsRead(id)
  const data = await notificationStore.fetchNotifications()
  notifications.value = data
}

async function markAllRead() {
  await notificationStore.markAllAsRead()
  const data = await notificationStore.fetchNotifications()
  notifications.value = data
}

function handleNotificationClick(notif) {
  if (!notif.is_read) {
    notificationStore.markAsRead(notif.id)
    notif.is_read = true
  }

  if (notif.document_type && notif.document_id) {
    const routeInfo = documentTypeToRoute[notif.document_type]
    if (routeInfo) {
      router.push({
        name: routeInfo.name,
        params: { [routeInfo.paramKey]: notif.document_id },
      })
    }
  }
}
</script>
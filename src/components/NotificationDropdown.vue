<template>
  <div class="relative" ref="dropdownRef">
    <!-- Bell trigger -->
    <button
      @click="toggleDropdown"
      class="relative text-slate-400 hover:text-slate-600 transition-colors p-1"
    >
      <BellIcon class="w-5 h-5" />
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full h-4 min-w-4 flex items-center justify-center px-1"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 class="font-semibold text-slate-700">Notifications</h3>
          <button
            v-if="notifications.length > 0"
            @click="markAllRead"
            class="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Mark All As Read
          </button>
        </div>

        <!-- Notifications list -->
        <div class="max-h-[400px] overflow-y-auto">
          <div v-if="loading" class="px-4 py-8 text-center text-sm text-slate-400">
            Loading...
          </div>

          <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">
            No notifications
          </div>

          <div
            v-for="notif in notifications"
            :key="notif.id"
            @click="handleNotificationClick(notif)"
            :class="[
              'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0',
              !notif.is_read ? 'bg-blue-50/50' : ''
            ]"
          >
            <div class="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
              <BellIcon class="w-4 h-4 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p :class="['text-sm font-medium truncate', !notif.is_read ? 'text-slate-800' : 'text-slate-600']">
                {{ notif.title }}
              </p>
              <p v-if="notif.body" class="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {{ notif.body }}
              </p>
              <p class="text-xs text-slate-400 mt-1">
                {{ formatDateTime(notif.created_at) }}
              </p>
            </div>
            <div v-if="!notif.is_read" class="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 border-t border-slate-100 text-center">
          <router-link
            :to="{ name: 'Notifications' }"
            @click="isOpen = false"
            class="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            View All
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { formatDateTime } from '../utils/format'
import { BellIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const notificationStore = useNotificationStore()

const isOpen = ref(false)
const loading = ref(false)
const notifications = ref([])
const currentPage = ref(1)
const hasMorePages = ref(false)
const dropdownRef = ref(null)

// Route mapping dari document_type ke route name Vue
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

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    currentPage.value = 1
    fetchNotifications()
  }
}

async function fetchNotifications() {
  loading.value = true
  try {
    const data = await notificationStore.fetchNotifications(currentPage.value)
    if (currentPage.value === 1) {
      notifications.value = data.data
    } else {
      notifications.value.push(...data.data)
    }
    hasMorePages.value = data.next_page_url !== null
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  currentPage.value++
  await fetchNotifications()
}

async function markAllRead() {
  await notificationStore.markAllAsRead()
  await fetchNotifications()
}

function handleNotificationClick(notif) {
  // Mark as read jika belum
  if (!notif.is_read) {
    notificationStore.markAsRead(notif.id)
    notif.is_read = true
  }

  // Navigasi ke halaman terkait jika ada document_type dan document_id
  if (notif.document_type && notif.document_id) {
    const routeInfo = documentTypeToRoute[notif.document_type]
    if (routeInfo) {
      router.push({
        name: routeInfo.name,
        params: { [routeInfo.paramKey]: notif.document_id },
      })
      isOpen.value = false
      return
    }
  }

  // Fallback: tutup dropdown jika tidak ada link
  isOpen.value = false
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  notificationStore.fetchUnreadCount()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

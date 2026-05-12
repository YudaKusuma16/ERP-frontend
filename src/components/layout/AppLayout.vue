<template>
  <div class="min-h-screen bg-slate-50">
    <Sidebar />
    <div class="ml-60">
      <TopBar />
      <main class="p-6">
        <router-view />
      </main>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
    >
      <div
        v-if="showNotifPopup"
        class="fixed bottom-6 right-6 z-50 w-[300px]"
      >
        <div
          class="relative bg-primary-600 rounded-xl shadow-lg px-5 py-4 cursor-pointer hover:bg-primary-700 transition-colors"
          @click="goToNotifications"
        >
          <button @click.stop="dismissPopup" class="absolute top-3 right-3 text-white/50 hover:text-white transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <BellIcon class="w-4 h-4 text-white" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">New Notifications</p>
              <p class="text-xs text-primary-100">You have {{ notifStore.unreadCount }} unread notification{{ notifStore.unreadCount > 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BellIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useNotificationStore } from '../../stores/notification'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'

const router = useRouter()
const notifStore = useNotificationStore()

const showNotifPopup = ref(false)

function dismissPopup() {
  showNotifPopup.value = false
}

function goToNotifications() {
  dismissPopup()
  router.push({ name: 'Notifications' })
}

onMounted(async () => {
  if (sessionStorage.getItem('notif_popup_shown')) return

  try {
    await notifStore.fetchUnreadCount()
    if (notifStore.unreadCount > 0) {
      showNotifPopup.value = true
      sessionStorage.setItem('notif_popup_shown', '1')
    }
  } catch {}
})
</script>

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
        v-if="showNotifPopup && notifStore.unreadCount > 0"
        class="fixed bottom-6 right-6 z-50 w-[300px]"
      >
        <div
          class="relative rounded-xl px-5 py-4 cursor-pointer transition-colors"
          style="background: rgba(0,0,0,0.1); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.15);"
          @click="goToNotifications"
        >
          <button @click.stop="dismissPopup" class="absolute top-3 right-3 text-black/50 hover:text-black transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
              <BellIcon class="w-4 h-4 text-black" />
            </div>
            <div>
              <p class="text-sm font-semibold text-black">New Notifications</p>
              <p class="text-xs text-black/70">You have {{ notifStore.unreadCount }} unread notification{{ notifStore.unreadCount > 1 ? 's' : '' }}</p>
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

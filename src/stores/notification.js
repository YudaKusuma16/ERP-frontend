import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const notifications = ref([])

  async function fetchUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count')
      unreadCount.value = response.data.unread_count
    } catch {}
  }

  async function fetchNotifications(page = 1) {
    const response = await api.get('/notifications', { params: { page } })
    notifications.value = response.data
    return response.data
  }

  async function markAsRead(id) {
    await api.post(`/notifications/${id}/read`)
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function markAllAsRead() {
    await api.post('/notifications/mark-all-read')
    unreadCount.value = 0
  }

  return { unreadCount, notifications, fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead }
})
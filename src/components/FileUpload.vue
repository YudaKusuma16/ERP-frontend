<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-semibold mb-4">Attachments</h2>
    <div class="mb-4">
      <input type="file" ref="fileInput" @change="onFileChange" class="hidden" />
      <button @click="$refs.fileInput.click()" :disabled="uploading" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
        {{ uploading ? 'Uploading...' : 'Upload File' }}
      </button>
    </div>
    <div v-if="attachments.length" class="space-y-2">
      <div v-for="att in attachments" :key="att.id" class="flex items-center justify-between p-3 bg-gray-50 rounded">
        <div>
          <a :href="downloadUrl(att)" class="text-blue-600 hover:underline text-sm">{{ att.original_name }}</a>
          <span class="text-xs text-gray-400 ml-2">{{ formatSize(att.size) }}</span>
          <span class="text-xs text-gray-400 ml-2">{{ att.uploader?.name }} &middot; {{ formatDate(att.created_at) }}</span>
        </div>
        <button @click="deleteAttachment(att)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
      </div>
    </div>
    <div v-else class="text-sm text-gray-400">No attachments</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { formatDate } from '../utils/format'

const props = defineProps({
  type: { type: String, required: true },
  id: { type: [Number, String], required: true }
})

const attachments = ref([])
const uploading = ref(false)

onMounted(() => fetchAttachments())

async function fetchAttachments() {
  try {
    const r = await api.get('/attachments', { params: { detachable_type: props.type, detachable_id: props.id } })
    attachments.value = r.data.attachments || []
  } catch {}
}

async function onFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('detachable_type', props.type)
  formData.append('detachable_id', props.id)
  try {
    await api.post('/attachments', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    await fetchAttachments()
    event.target.value = ''
  } catch (err) { alert(err.response?.data?.message || 'Upload failed') }
  finally { uploading.value = false }
}

async function deleteAttachment(att) {
  if (!confirm('Delete this attachment?')) return
  try { await api.delete(`/attachments/${att.id}`); await fetchAttachments() }
  catch (err) { alert('Failed to delete') }
}

function downloadUrl(att) {
  return `${api.defaults.baseURL}/attachments/${att.id}/download`
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>
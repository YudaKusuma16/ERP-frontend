<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="close">
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-800">QR Code</h2>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <p v-if="itemName" class="text-sm text-gray-500 mb-4">{{ itemName }}</p>
      <div class="flex justify-center mb-4">
        <canvas ref="qrCanvas"></canvas>
      </div>
      <p class="text-sm font-mono text-gray-600 mt-2">{{ value }}</p>
      <div class="mt-4 flex gap-3 justify-center">
        <button @click="close" class="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50">Close</button>
        <button @click="downloadQR" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Download</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  value: { type: String, default: '' },
  itemName: { type: String, default: '' }
})

const emit = defineEmits(['close'])
const qrCanvas = ref(null)

watch(() => props.visible, async (val) => {
  if (val && props.value) {
    await nextTick()
    try {
      const QRCode = (await import('qrcode')).default
      await QRCode.toCanvas(qrCanvas.value, props.value, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
    } catch (e) {
      console.error('QR Code render error:', e)
    }
  }
})

function close() {
  emit('close')
}

function downloadQR() {
  if (!qrCanvas.value) return
  const a = document.createElement('a')
  a.download = `qrcode-${props.value}.png`
  a.href = qrCanvas.value.toDataURL('image/png')
  a.click()
}
</script>
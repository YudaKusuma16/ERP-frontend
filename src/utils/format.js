export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatCurrency(value) {
  return 'Rp ' + Number(value || 0).toLocaleString('id-ID')
}
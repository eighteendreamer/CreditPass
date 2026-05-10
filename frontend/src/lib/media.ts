export function toPreviewUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  return `/api/files/preview?url=${encodeURIComponent(url)}`
}

import request from '@/lib/request'

export const uploadFile = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return request.post<any, { code: number; message: string; data: { url: string } }>(
    '/api/files/upload',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}

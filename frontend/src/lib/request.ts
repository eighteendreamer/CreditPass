import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { decryptApiPayload, isEncryptedEnvelope } from '@/lib/apiCrypto'

const request = axios.create({
  baseURL: '/',
  timeout: 20000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('creditpass_token')
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

request.interceptors.response.use(
  async (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 200) {
        if (isEncryptedEnvelope(body.data)) {
          body.data = await decryptApiPayload(body.data.payload)
        }
        return body
      }
      if (body.code === 401) {
        localStorage.removeItem('creditpass_token')
        window.dispatchEvent(new CustomEvent('auth:require-login'))
        toast.error(body.message || '请先登录')
        return Promise.reject(new Error(body.message || '未登录'))
      }
      toast.error(body.message || '请求失败')
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return response
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status
    const msg = error.response?.data?.message || error.message || '网络错误'
    if (status === 401) {
      localStorage.removeItem('creditpass_token')
      window.dispatchEvent(new CustomEvent('auth:require-login'))
    }
    toast.error(msg)
    return Promise.reject(error)
  },
)

export default request

export interface R<T> {
  code: number
  message: string
  data: T
}

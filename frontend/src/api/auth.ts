import request from '@/lib/request'
import type { User } from '@/types'

export const sendEmailCode = (email: string) =>
  request.post('/api/auth/email-code', { email })

export const emailLogin = (email: string, code: string) =>
  request.post<any, { code: number; message: string; data: { token: string; user: User } }>(
    '/api/auth/email-login',
    { email, code },
  )

export const logout = () => request.post('/api/auth/logout')

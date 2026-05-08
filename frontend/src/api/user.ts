import request from '@/lib/request'
import type { User } from '@/types'

export const getMe = () =>
  request.get<any, { code: number; message: string; data: User }>('/api/user/me')

export const updateMe = (payload: Partial<User>) =>
  request.put<any, { code: number; message: string; data: User }>('/api/user/me', payload)

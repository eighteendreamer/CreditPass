import request from '@/lib/request'
import type { Activity, ActivityListResp } from '@/types'

export interface ListQuery {
  keyword?: string
  creditType?: string
  category?: string
  availableOnly?: boolean
  page?: number
  size?: number
}

export const listActivities = (params: ListQuery) =>
  request.get<any, { code: number; message: string; data: ActivityListResp }>('/api/activities', { params })

export const getActivity = (id: number | string, incView = true) =>
  request.get<any, { code: number; message: string; data: Activity }>(`/api/activities/${id}`, {
    params: { incView },
  })

export const listCreditTypeSuggestions = () =>
  request.get<any, { code: number; message: string; data: string[] }>('/api/activities/credit-types')

export const publishActivity = (payload: Partial<Activity>) =>
  request.post<any, { code: number; message: string; data: Activity }>('/api/activities', payload)

export const updateActivity = (id: number, payload: Partial<Activity>) =>
  request.put<any, { code: number; message: string; data: Activity }>(`/api/activities/${id}`, payload)

export const deleteActivity = (id: number) =>
  request.delete(`/api/activities/${id}`)

export const myActivities = () =>
  request.get<any, { code: number; message: string; data: Activity[] }>('/api/activities/my')

export const triggerPush = (id: number) =>
  request.post(`/api/activities/${id}/push`)

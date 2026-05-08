import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(s?: string | null): string {
  if (!s) return ''
  // 后端返回 yyyy-MM-dd HH:mm:ss
  return s.length >= 16 ? s.substring(0, 16) : s
}

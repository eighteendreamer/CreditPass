import { create } from 'zustand'
import type { User } from '@/types'
import { getMe, updateMe } from '@/api/user'
import { emailLogin, logout as apiLogout } from '@/api/auth'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  loginDialogOpen: boolean
  setLoginDialogOpen: (open: boolean) => void
  loginWithCode: (email: string, code: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  updateProfile: (payload: Partial<User>) => Promise<User>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('creditpass_token'),
  loading: false,
  loginDialogOpen: false,
  setLoginDialogOpen: (open) => set({ loginDialogOpen: open }),

  async loginWithCode(email, code) {
    set({ loading: true })
    try {
      const resp = await emailLogin(email, code)
      const token = resp.data.token
      const user = resp.data.user
      localStorage.setItem('creditpass_token', token)
      set({ token, user, loginDialogOpen: false })
    } finally {
      set({ loading: false })
    }
  },

  async logout() {
    try {
      await apiLogout()
    } catch {
      /* ignore */
    }
    localStorage.removeItem('creditpass_token')
    set({ token: null, user: null })
  },

  async fetchMe() {
    if (!get().token) return
    try {
      const resp = await getMe()
      set({ user: resp.data })
    } catch {
      localStorage.removeItem('creditpass_token')
      set({ token: null, user: null })
    }
  },

  async updateProfile(payload) {
    const resp = await updateMe(payload)
    set({ user: resp.data })
    return resp.data
  },
}))

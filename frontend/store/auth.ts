import { create } from 'zustand'
import api from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  role: 'buyer' | 'admin'
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  default_address?: {
    name?: string
    phone?: string
    address?: string
    province?: string
    province_code?: string
    regency?: string
    regency_code?: string
    district?: string
    district_code?: string
    village?: string
    village_code?: string
    postal_code?: string
  } | null
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setUser: (user: User) => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
  },

  register: async (name, email, password, passwordConfirmation) => {
    const { data } = await api.post('/auth/register', { name, email, password, password_confirmation: passwordConfirmation })
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null })
    }
  },

  setUser: (user) => set({ user }),

  isAdmin: () => get().user?.role === 'admin',
}))

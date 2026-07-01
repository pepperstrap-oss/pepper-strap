// =============================================
// src/store/authStore.ts
// Global state untuk autentikasi (Zustand)
// =============================================

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

type AuthStore = {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, isAdmin: profile?.role === 'admin' }),

  fetchProfile: async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) set({ profile: data, isAdmin: data.role === 'admin' })
  },

  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (data.user) {
      set({ user: data.user })
      await get().fetchProfile(data.user.id)
    }
    return { error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, isAdmin: false })
  },
}))

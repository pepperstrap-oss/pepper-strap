// =============================================
// src/components/layout/AuthProvider.tsx
// Inisialisasi sesi auth saat app pertama load
// =============================================
'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, fetchProfile } = useAuthStore()

  useEffect(() => {
    // Cek sesi yang sudah ada — tunggu sampai profil & status admin
    // beneran selesai dicek, baru tandai "loading" selesai
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
      useAuthStore.setState({ loading: false })
    })

    // Listen perubahan auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        useAuthStore.setState({ profile: null, isAdmin: false })
      }
      useAuthStore.setState({ loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
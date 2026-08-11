// =============================================
// src/components/analytics/PageViewTracker.tsx
// Mencatat setiap kunjungan halaman secara diam-diam (buat statistik admin)
// =============================================
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Jangan catat kunjungan ke halaman admin — biar nggak ikut ngegembungin statistik toko
    if (!pathname || pathname.startsWith('/admin')) return

    supabase.from('page_views').insert({ path: pathname }).then(() => {
      // Diamkan hasilnya — ini cuma pencatatan latar belakang, nggak perlu ganggu pengalaman pengunjung
    })
  }, [pathname])

  return null
}

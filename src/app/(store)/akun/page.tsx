// =============================================
// src/app/(store)/akun/page.tsx
// Halaman Profil & Akun
// =============================================
'use client'
import { useAuthStore } from '@/store/authStore'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const router = useRouter()
  const { user, profile, signOut, isAdmin } = useAuthStore()

  async function handleSignOut() {
    await signOut()
    toast.success('Berhasil keluar')
    router.push('/')
  }

  if (!user) return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-5xl mb-4">👤</div>
        <div className="text-base font-semibold text-gray-700 mb-2">Belum Masuk</div>
        <div className="text-sm text-gray-400 mb-6">Masuk untuk melihat pesanan dan profil Anda</div>
        <Link href="/auth/masuk" className="w-full bg-[#4a6650] text-white py-3 rounded-xl font-semibold text-sm text-center block mb-2">
          Masuk
        </Link>
        <Link href="/auth/daftar" className="w-full border-2 border-[#4a6650] text-[#4a6650] py-3 rounded-xl font-semibold text-sm text-center block">
          Daftar Akun
        </Link>
      </div>
    </MobileLayout>
  )

  return (
    <MobileLayout>
      {/* Header Profil */}
      <div className="bg-[#4a6650] px-4 py-6 text-white text-center">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-[#4a6650] text-2xl font-bold">
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <div className="font-bold text-[15px]">{profile?.full_name || 'Pelanggan'}</div>
        <div className="text-[12px] text-white/70 mt-0.5">{user.email}</div>
        {isAdmin && (
          <span className="mt-2 inline-block bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ADMIN
          </span>
        )}
      </div>

      {/* Menu */}
      <div className="m-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        {[
          { href: '/akun/pesanan', icon: '📦', label: 'Pesanan Saya' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 text-[13px] text-gray-700">
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className="text-gray-300">›</span>
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 text-[13px] text-amber-600 font-semibold">
            <span className="text-lg">⚙️</span>
            <span className="flex-1">Panel Admin</span>
            <span className="text-amber-300">›</span>
          </Link>
        )}
        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3.5 text-[13px] text-red-500 w-full">
          <span className="text-lg">🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </MobileLayout>
  )
}

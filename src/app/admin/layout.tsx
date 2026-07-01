// =============================================
// src/app/admin/layout.tsx
// Layout khusus admin — cek role admin
// =============================================
'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

const adminNav = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/pesanan', icon: '📦', label: 'Pesanan' },
  { href: '/admin/produk', icon: '🛍️', label: 'Produk' },
  { href: '/admin/promo', icon: '🏷️', label: 'Promo' },
  { href: '/admin/pengaturan', icon: '⚙️', label: 'Pengaturan' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, loading } = useAuthStore()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace('/auth/masuk')
  }, [user, isAdmin, loading])

  if (loading || !isAdmin) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Memeriksa akses...</div>
  )

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f5f0]">
      {/* Admin topbar */}
      <div className="bg-[#3d2b1f] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <span className="text-white font-bold text-sm">⚙️ Admin Panel</span>
        <Link href="/" className="text-white/70 text-[11px] border border-white/30 px-2 py-0.5 rounded">← Toko</Link>
      </div>

      <main className="pb-20">{children}</main>

      {/* Admin bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white border-t border-gray-100 flex justify-around py-1.5 z-50">
        {adminNav.map(item => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[9px] font-medium ${isActive ? 'text-[#3d2b1f]' : 'text-gray-400'}`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// =============================================
// src/app/admin/layout.tsx
// Layout khusus admin — cek role admin
// Responsive: HP tetap pakai menu bawah, PC pakai sidebar kiri
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
  { href: '/admin/kategori', icon: '📂', label: 'Kategori' },
  { href: '/admin/promo', icon: '🏷️', label: 'Promo' },
  { href: '/admin/ulasan', icon: '⭐', label: 'Ulasan' },
  { href: '/admin/analitik', icon: '📈', label: 'Analitik' },
  { href: '/admin/pengaturan', icon: '⚙️', label: 'Setting' },
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

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] md:flex">
      {/* Sidebar — cuma tampil di PC/tablet lebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 md:flex-shrink-0 bg-[#3d2b1f] min-h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-white font-bold text-sm mb-1">⚙️ Admin Panel</div>
          <Link href="/" className="text-white/60 text-[11px] hover:text-white transition-colors">← Kembali ke Toko</Link>
        </div>
        <nav className="flex-1 py-3">
          {adminNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-[13px] border-l-2 transition-colors ${
                isActive(item.href)
                  ? 'bg-white/10 text-white font-semibold border-white'
                  : 'text-white/60 border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 min-w-0 max-w-[420px] md:max-w-none mx-auto md:mx-0">
        {/* Topbar — cuma tampil di HP (di PC udah ada sidebar) */}
        <div className="md:hidden bg-[#3d2b1f] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <span className="text-white font-bold text-sm">⚙️ Admin Panel</span>
          <Link href="/" className="text-white/70 text-[11px] border border-white/30 px-2 py-0.5 rounded">← Toko</Link>
        </div>

        <main className="pb-20 md:pb-8 md:px-6 lg:px-10 md:py-6">{children}</main>

        {/* Bottom nav — cuma tampil di HP */}
        <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white border-t border-gray-100 flex justify-around py-1.5 z-50 overflow-x-auto">
          {adminNav.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[9px] font-medium flex-shrink-0 ${isActive(item.href) ? 'text-[#3d2b1f]' : 'text-gray-400'}`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

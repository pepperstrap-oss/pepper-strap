// =============================================
// src/components/layout/MobileLayout.tsx
// Layout utama dengan Navbar + BottomNav
// Responsive: tampilan HP tetap sama persis, di layar lebar (PC/tablet) jadi navbar horizontal
// dan konten melebar penuh (edge-to-edge) dengan padding menyesuaikan
// =============================================
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
const navItems = [
  { href: '/', icon: '🏠', label: 'Beranda' },
  { href: '/produk', icon: '⊞', label: 'Produk' },
  { href: '/lacak', icon: '🔍', label: 'Lacak' },
  { href: '/keranjang', icon: '🛒', label: 'Keranjang' },
  { href: '/akun', icon: '👤', label: 'Akun' },
]
export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const itemCount = useCartStore(s => s.itemCount())
  const { profile } = useAuthStore()

  function isActivePath(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] relative">
      {/* Top Navbar */}
      <header className="bg-[#4a6650] sticky top-0 z-50">
        <div className="max-w-[420px] md:max-w-none w-full mx-auto px-4 md:px-8 lg:px-12 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img src="/logo-pepper.jpg" alt="Pepper Strap" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">PEPPER STRAP</span>
          </Link>

          {/* Menu navigasi horizontal — cuma tampil di layar lebar (PC/tablet), di HP tetap pakai menu bawah */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.filter(item => item.href !== '/keranjang').map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] font-medium transition-colors ${
                  isActivePath(item.href) ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/produk" className="text-white text-lg md:hidden">🔍</Link>
            <Link href="/keranjang" className="relative text-white text-lg">
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content — lebar penuh di layar besar, dengan padding kiri-kanan menyesuaikan */}
      <main className="max-w-[420px] md:max-w-none w-full mx-auto px-0 md:px-8 lg:px-12">{children}</main>

      {/* Bottom Navigation — cuma tampil di HP, disembunyikan di layar lebar */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white border-t border-gray-100 flex justify-around py-2 z-50">
        {navItems.map(item => {
          const isActive = isActivePath(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#4a6650]' : 'text-gray-400'
              }`}
            >
              <span className={`text-xl ${isActive ? 'opacity-100' : 'opacity-50'}`}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

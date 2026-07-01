// =============================================
// src/components/layout/MobileLayout.tsx
// Layout utama dengan Navbar + BottomNav
// =============================================

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { href: '/', icon: '🏠', label: 'Beranda' },
  { href: '/produk', icon: '⊞', label: 'Produk' },
  { href: '/promo', icon: '🏷️', label: 'Promo' },
  { href: '/keranjang', icon: '🛒', label: 'Keranjang' },
  { href: '/akun', icon: '👤', label: 'Akun' },
]

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const itemCount = useCartStore(s => s.itemCount())
  const { profile } = useAuthStore()

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f5f0] relative">
      {/* Top Navbar */}
      <header className="bg-[#4a6650] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#4a6650] font-bold text-sm">P</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">PEPPER STRAP</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/produk" className="text-white text-lg">🔍</Link>
          <Link href="/keranjang" className="relative text-white text-lg">
            🛒
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main>{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white border-t border-gray-100 flex justify-around py-2 z-50">
        {navItems.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
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

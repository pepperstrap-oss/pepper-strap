// =============================================
// src/app/(store)/page.tsx
// Halaman Beranda
// =============================================

import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { ProductCard } from '@/components/product/ProductCard'
import { HeroBanner } from '@/components/home/HeroBanner'
import { PromoBanner } from '@/components/home/PromoBanner'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import Link from 'next/link'

async function getData() {
  const [{ data: products }, { data: categories }, { data: settings }] =
    await Promise.all([
      supabase.from('products').select('*, categories(name,slug)').eq('is_active', true).order('created_at', { ascending: false }).limit(4),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('site_settings').select('*'),
    ])

  const settingsMap = Object.fromEntries((settings || []).map(s => [s.key, s.value]))
  return { products: products || [], categories: categories || [], settings: settingsMap }
}

export const revalidate = 0

export default async function HomePage() {
  const { products, categories, settings } = await getData()
  const hero = settings.hero || {}
  const banner = settings.promo_banner || {}

  return (
    <MobileLayout>
      {/* Hero */}
      <HeroBanner title={hero.title} subtitle={hero.subtitle} themeColor={hero.theme_color} imageUrl={hero.image_url} />

      {/* Banner Promo — hanya tampil kalau diaktifkan di Setting */}
      {banner.is_active && (
        <section className="px-3.5 pt-3.5">
          <PromoBanner
            title={banner.title}
            subtitle={banner.subtitle}
            discountLabel={banner.discount_label}
            imageUrl={banner.image_url}
            endDate={banner.end_date}
          />
        </section>
      )}

      {/* Kategori */}
      <section className="p-3.5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-bold text-gray-800">Kategori Produk</h2>
          <Link href="/produk" className="text-[12px] text-[#4a6650]">Lihat Semua</Link>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* Produk Terbaru */}
      <section className="px-3.5 pb-3.5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-bold text-gray-800">Produk Terbaru</h2>
          <Link href="/produk" className="text-[12px] text-[#4a6650]">Lihat Semua</Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4a6650] px-4 py-5 pb-24 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img src="/logo-pepper.jpg" alt="Pepper Strap" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sm">PEPPER STRAP</span>
        </div>
        <p className="text-[11px] text-white/70 mb-4 leading-relaxed">
          Proudly made in Indonesia by hand
        </p>
        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mb-4 text-[11px]">
          <div>
            <div className="font-bold mb-2">Menu</div>
            {[
              { label: 'Beranda', href: '/' },
              { label: 'Produk', href: '/produk' },
              { label: 'Promo', href: '/promo' },
              { label: 'Tentang Kami', href: '/tentang' },
              { label: 'Kontak', href: '/kontak' },
            ].map(m => (
              <Link key={m.label} href={m.href} className="block text-white/70 mb-1 active:text-white">{m.label}</Link>
            ))}
          </div>
          <div>
            <div className="font-bold mb-2">Informasi</div>
            {[
              { label: 'Cara Belanja', href: '/cara-belanja' },
              { label: 'Pengiriman', href: '/pengiriman' },
              { label: 'Pembayaran', href: '/pembayaran' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
            ].map(m => (
              <Link key={m.label} href={m.href} className="block text-white/70 mb-1 active:text-white">{m.label}</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/20 pt-3 flex flex-col items-center gap-2">
          <div className="text-[10px] text-white/50">© 2026 PEPPER STRAP. All Rights Reserved.</div>
        </div>
      </footer>
    </MobileLayout>
  )
}

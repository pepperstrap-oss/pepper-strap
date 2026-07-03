// =============================================
// src/app/(store)/page.tsx
// Halaman Beranda
// =============================================

import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { ProductCard } from '@/components/product/ProductCard'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { PromoBanner } from '@/components/home/PromoBanner'
import Link from 'next/link'

async function getData() {
  const [{ data: products }, { data: categories }, { data: settings }, { data: promos }] =
    await Promise.all([
      supabase.from('products').select('*, categories(name,slug)').eq('is_active', true).order('created_at', { ascending: false }).limit(4),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('site_settings').select('*'),
      supabase.from('promos').select('*').eq('is_active', true).limit(1),
    ])

  const settingsMap = Object.fromEntries((settings || []).map(s => [s.key, s.value]))
  return { products: products || [], categories: categories || [], settings: settingsMap, promo: promos?.[0] }
}

export const revalidate = 0

export default async function HomePage() {
  const { products, categories, settings } = await getData()
  const hero = settings.hero || {}
  const promoBanner = settings.promo_banner || {}

  return (
    <MobileLayout>
      {/* Hero */}
      <HeroBanner title={hero.title} subtitle={hero.subtitle} themeColor={hero.theme_color} imageUrl={hero.image_url} />

      {/* Feature Bar */}
      <div className="bg-white grid grid-cols-2 gap-3 p-3 border-b border-gray-100">
        {[
          { icon: '🏆', title: 'Kulit Asli Premium', sub: 'Kualitas terbaik' },
          { icon: '✋', title: 'Handmade', sub: '100% buatan tangan' },
          { icon: '🚚', title: 'Pengiriman Cepat', sub: 'JNE & JNT' },
          { icon: '🔒', title: 'Pembayaran Aman', sub: 'QRIS' },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xl">{f.icon}</span>
            <div>
              <div className="text-[11px] font-semibold text-gray-800">{f.title}</div>
              <div className="text-[10px] text-gray-500">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

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

      {/* Promo Banner */}
      {promoBanner.is_active && (
        <div className="mx-3.5 mb-3.5">
          <PromoBanner
            title={promoBanner.title}
            subtitle={promoBanner.subtitle}
            discountLabel={promoBanner.discount_label}
            imageUrl={promoBanner.image_url}
          />
        </div>
      )}

      {/* Feature Bar 2 */}
      <div className="bg-white grid grid-cols-2 gap-3 p-3 border-t border-gray-100 mb-3">
        {[
          { icon: '📋', title: 'Cek Ongkir Otomatis', sub: 'JNE & JNT' },
          { icon: '📱', title: 'Pembayaran Mudah', sub: 'QRIS All Payment' },
          { icon: '📦', title: 'Packing Aman', sub: 'Produk terjaga' },
          { icon: '🎧', title: 'Bantuan 24/7', sub: 'Kami siap membantu' },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xl">{f.icon}</span>
            <div>
              <div className="text-[11px] font-semibold text-gray-800">{f.title}</div>
              <div className="text-[10px] text-gray-500">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-[#4a6650] px-4 py-5 pb-24 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#4a6650] font-bold text-[10px]">P</span>
          </div>
          <span className="font-bold text-sm">PEPPER STRAP</span>
        </div>
        <p className="text-[11px] text-white/70 mb-4 leading-relaxed">
          Handmade leather watch strap dengan kualitas premium untuk melengkapi gaya Anda.
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
          <div className="flex gap-2">
            {['QRIS', 'JNE', 'J&T'].map(l => (
              <span key={l} className="bg-white text-[#4a6650] text-[9px] font-bold px-2 py-0.5 rounded">{l}</span>
            ))}
          </div>
          <div className="text-[10px] text-white/50">© 2026 PEPPER STRAP. All Rights Reserved.</div>
        </div>
      </footer>
    </MobileLayout>
  )
}

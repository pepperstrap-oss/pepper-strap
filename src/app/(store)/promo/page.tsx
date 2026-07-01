// =============================================
// src/app/(store)/promo/page.tsx — Halaman Promo
// =============================================
import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'

export const revalidate = 0

export default async function PromoPage() {
  const { data: promos } = await supabase.from('promos').select('*').eq('is_active', true).order('created_at', { ascending: false })
  const { data: products } = await supabase.from('products')
    .select('*, categories(name)')
    .eq('is_active', true)
    .gt('original_price', 0)
    .order('created_at', { ascending: false })

  return (
    <MobileLayout>
      <div className="p-3.5 pb-24">
        <h1 className="text-[16px] font-bold text-gray-800 mb-3">Promo & Penawaran</h1>

        {/* Banner promo */}
        <div className="space-y-2.5 mb-5">
          {(promos || []).map(p => (
            <div key={p.id} className="bg-[#4a6650] rounded-xl p-4 text-white">
              <div className="text-[9px] text-white/70 uppercase tracking-wide font-semibold mb-1">{p.label}</div>
              <div className="text-[15px] font-bold mb-1">{p.title}</div>
              <div className="text-[12px] text-white/80">{p.description}</div>
              {p.promo_code && (
                <div className="mt-2 inline-block bg-white text-[#4a6650] text-[11px] font-bold px-3 py-1 rounded-lg">
                  Kode: {p.promo_code}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Produk diskon */}
        {products && products.length > 0 && (
          <>
            <h2 className="text-[14px] font-bold text-gray-800 mb-3">Produk Diskon</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {products.map(p => {
                const disc = Math.round((1 - p.price / p.original_price) * 100)
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="relative h-[90px] bg-[#e8f0e9] flex items-center justify-center">
                      {p.image_url
                        ? <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} />
                        : <span className="text-3xl">📦</span>
                      }
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        -{disc}%
                      </span>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[12px] font-semibold mb-1">{p.name}</div>
                      <div className="text-[13px] font-bold text-[#4a6650]">{'Rp ' + p.price.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-gray-400 line-through">{'Rp ' + p.original_price.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  )
}

// =============================================
// src/components/product/ProductCard.tsx
// Kartu produk reusable
// =============================================
'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export function ProductCard({ product: p }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(p, 1, p.sizes?.[0] || '20mm')
    toast.success(`${p.name} ditambahkan!`)
  }

  return (
    <Link href={`/produk/${p.slug}`} className="bg-white rounded-xl border border-gray-100 overflow-hidden block relative">
      <div className="relative h-[90px] bg-[#e8f0e9] flex items-center justify-center overflow-hidden">
        {p.image_url
          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
          : <span className="text-4xl">📦</span>
        }
        {p.is_new && (
          <span className="absolute top-1.5 left-1.5 bg-[#4a6650] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">BARU</span>
        )}
        {p.original_price > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">SALE</span>
        )}
      </div>
      <div className="p-2.5 pb-8">
        <div className="text-[12px] font-semibold text-gray-800 leading-tight mb-1">{p.name}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold text-gray-900">{fmt(p.price)}</span>
          {p.original_price > 0 && (
            <span className="text-[10px] text-gray-400 line-through">{fmt(p.original_price)}</span>
          )}
        </div>
      </div>
      <button
        onClick={quickAdd}
        className="absolute bottom-2 right-2 w-7 h-7 bg-[#4a6650] rounded-full flex items-center justify-center text-white text-xs"
        aria-label="Tambah ke keranjang"
      >
        🛒
      </button>
    </Link>
  )
}

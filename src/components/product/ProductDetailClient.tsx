// =============================================
// src/components/product/ProductDetailClient.tsx
// Interaksi detail produk (client)
// =============================================
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export function ProductDetailClient({ product: p }: { product: Product }) {
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const [selectedSize, setSelectedSize] = useState(p.sizes?.[0] || '20mm')
  const [qty, setQty] = useState(1)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  function handleAddCart() {
    addItem(p, qty, selectedSize)
    toast.success('Ditambahkan ke keranjang!')
  }

  function handleBuyNow() {
    addItem(p, qty, selectedSize)
    router.push('/keranjang')
  }

  return (
    <>
      {/* Back button */}
      <div className="bg-[#4a6650] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <span className="text-white font-semibold text-sm">Detail Produk</span>
      </div>

      {/* Foto produk */}
      <div className="h-56 bg-[#e8f0e9] flex items-center justify-center overflow-hidden">
        {p.image_url
          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
          : <span className="text-7xl">📦</span>
        }
      </div>

      <div className="p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h1>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">{fmt(p.price)}</span>
          {p.original_price > 0 && (
            <span className="text-sm text-gray-400 line-through">{fmt(p.original_price)}</span>
          )}
        </div>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-4">{p.description}</p>

        {/* Pilih ukuran */}
        <div className="mb-4">
          <div className="text-[12px] font-semibold text-gray-700 mb-2">Pilih Ukuran</div>
          <div className="flex flex-wrap gap-2">
            {(p.sizes || []).map(s => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] border transition-colors ${
                  selectedSize === s
                    ? 'border-[#4a6650] bg-[#e8f0e9] text-[#4a6650] font-semibold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Jumlah */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[12px] text-gray-500">Jumlah:</span>
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-full border border-[#4a6650] text-[#4a6650] font-bold text-lg flex items-center justify-center">-</button>
          <span className="text-[15px] font-bold w-5 text-center">{qty}</span>
          <button onClick={() => setQty(q => Math.min(p.stock, q + 1))}
            className="w-8 h-8 rounded-full border border-[#4a6650] text-[#4a6650] font-bold text-lg flex items-center justify-center">+</button>
          <span className="text-[11px] text-gray-400 ml-auto">Stok: {p.stock}</span>
        </div>

        {/* Tombol aksi */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleBuyNow} className="bg-[#4a6650] text-white py-3 rounded-xl font-bold text-[13px]">
            Beli Sekarang
          </button>
          <button onClick={handleAddCart} className="border-2 border-[#4a6650] text-[#4a6650] py-3 rounded-xl font-semibold text-[13px]">
            + Keranjang
          </button>
        </div>
      </div>
    </>
  )
}

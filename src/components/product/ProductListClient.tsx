// =============================================
// src/components/product/ProductListClient.tsx
// Filter + search produk (client component)
// =============================================
'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from './ProductCard'

export function ProductListClient({ products, categories }: { products: any[]; categories: any[] }) {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('kategori') || 'semua'
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'semua' || p.categories?.slug === activeCategory
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="pb-20">
      {/* Search */}
      <div className="bg-white px-3.5 py-3 border-b border-gray-100 sticky top-[52px] z-40">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2 mb-3">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Cari strap..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] outline-none text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-sm">✕</button>
          )}
        </div>
        {/* Filter kategori */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setActiveCategory('semua')}
            className={`flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === 'semua'
                ? 'bg-[#4a6650] text-white border-[#4a6650]'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Semua
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === c.slug
                  ? 'bg-[#4a6650] text-white border-[#4a6650]'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid produk */}
      <div className="p-3.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm">Produk tidak ditemukan</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

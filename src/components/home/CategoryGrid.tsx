// =============================================
// src/components/home/CategoryGrid.tsx
// =============================================
import Link from 'next/link'

export function CategoryGrid({ categories }: { categories: any[] }) {
  const icons: Record<string, string> = { classic: '🟫', vintage: '🟤', slim: '💚', crocodile: '🐊' }
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map(c => (
        <Link key={c.id} href={`/produk?kategori=${c.slug}`} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="h-20 bg-[#e8f0e9] flex items-center justify-center text-3xl">
            {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover" alt={c.name} /> : icons[c.slug] || '📦'}
          </div>
          <div className="px-2.5 py-2 text-[12px] font-semibold text-gray-800">{c.name}</div>
        </Link>
      ))}
    </div>
  )
}

// =============================================
// src/components/home/CategoryGrid.tsx
// =============================================
import Link from 'next/link'
export function CategoryGrid({ categories }: { categories: any[] }) {
  const icons: Record<string, string> = { 
    classic: '🟫', vintage: '🟤', slim: '💚', 
    crocodile: '🐊', stingray: '🌊', lizard: '🦎' 
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      {categories.map(c => (
        <Link key={c.id} href={`/produk?kategori=${c.slug}`} 
          className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="h-24 sm:h-28 md:h-40 lg:h-48 bg-[#e8f0e9] flex items-center justify-center overflow-hidden relative">
            {c.image_url ? (
              <>
                <img src={c.image_url} className="w-full h-full object-cover" alt={c.name} />
                {/* Overlay gelap tipis supaya teks terbaca */}
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute bottom-1.5 left-2 md:bottom-3 md:left-3 text-white text-[11px] md:text-[14px] font-bold drop-shadow">
                  {c.name}
                </span>
              </>
            ) : (
              <span className="text-3xl md:text-5xl">{icons[c.slug] || '📦'}</span>
            )}
          </div>
          {/* Nama kategori di bawah — hanya tampil kalau tidak ada foto */}
          {!c.image_url && (
            <div className="px-2.5 py-2 text-[12px] font-semibold text-gray-800">{c.name}</div>
          )}
        </Link>
      ))}
    </div>
  )
}

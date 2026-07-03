// =============================================
// src/components/home/HeroBanner.tsx
// =============================================
'use client'

export function HeroBanner({ title, subtitle, themeColor, imageUrl }: { 
  title?: string; subtitle?: string; themeColor?: string; imageUrl?: string 
}) {
  return (
    <div className="relative overflow-hidden pb-0" style={{ background: themeColor || '#4a6650' }}>
      {/* Foto background kalau ada */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img src={imageUrl} alt="Hero banner" className="w-full h-full object-cover opacity-30" />
        </div>
      )}
      <div className="px-4 pt-5 pb-4 relative z-10">
        <h1 className="text-white text-xl font-bold leading-tight mb-2 whitespace-pre-line">
          {title || 'Handmade Leather\nWatch Strap'}
        </h1>
        <p className="text-white/85 text-[12px] leading-relaxed mb-4">
          {subtitle || 'Strap kulit premium buatan tangan untuk gaya yang tak lekang oleh waktu.'}
        </p>
        <button
          onClick={() => window.location.href = '/produk'}
          className="bg-white text-[#4a6650] font-bold text-[13px] px-5 py-2 rounded-md"
        >
          Belanja Sekarang
        </button>
      </div>
      <div className="flex gap-1.5 h-28 px-4 relative z-10">
        {['🟫', '💚', '🖤'].map((e, i) => (
          <div key={i} className="flex-1 bg-white/10 rounded-t-lg flex items-center justify-center text-3xl">
            {e}
          </div>
        ))}
      </div>
    </div>
  )
}

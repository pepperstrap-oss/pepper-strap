// =============================================
// src/components/home/PromoBanner.tsx
// =============================================
export function PromoBanner({ title, subtitle, discountLabel }: { title?: string; subtitle?: string; discountLabel?: string }) {
  return (
    <div className="bg-[#4a6650] rounded-xl p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="text-[10px] text-white/70 uppercase tracking-wide font-semibold mb-1">Promo Spesial</div>
        <h3 className="text-white font-bold text-[15px] leading-tight mb-1">{title || 'Diskon untuk semua produk'}</h3>
        <p className="text-white/75 text-[11px] mb-3">{subtitle || 'Periode terbatas!'}</p>
        <button className="bg-white text-[#4a6650] font-bold text-[12px] px-4 py-1.5 rounded-md">
          Belanja Sekarang
        </button>
      </div>
      <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-white/10 flex flex-col items-center justify-center ml-3 flex-shrink-0">
        <span className="text-white font-bold text-lg leading-none">{(discountLabel || '15% OFF').split('%')[0]}%</span>
        <span className="text-white/80 text-[9px] font-semibold">OFF</span>
      </div>
    </div>
  )
}

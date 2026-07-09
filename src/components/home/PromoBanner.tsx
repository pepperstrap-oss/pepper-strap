// =============================================
// src/components/home/PromoBanner.tsx
// Banner promo beranda + countdown timer
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

function getTimeLeft(endDate: string): TimeLeft | null {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function PromoBanner({ title, subtitle, discountLabel, imageUrl, endDate }: {
  title?: string; subtitle?: string; discountLabel?: string; imageUrl?: string; endDate?: string
}) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!endDate) return
    const tick = () => {
      const t = getTimeLeft(endDate)
      if (!t) { setExpired(true); return }
      setTimeLeft(t)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  // Kalau sudah diatur tanggal berakhir dan waktunya sudah lewat, banner otomatis disembunyikan
  if (endDate && expired) return null

  return (
    <div className="relative bg-[#4a6650] rounded-xl p-4 flex items-center justify-between overflow-hidden">
      {/* Foto background kalau ada */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img src={imageUrl} alt="Banner promo" className="w-full h-full object-cover opacity-20" />
        </div>
      )}
      <div className="flex-1 relative z-10">
        <div className="text-[10px] text-white/70 uppercase tracking-wide font-semibold mb-1">Promo Spesial</div>
        <h3 className="text-white font-bold text-[15px] leading-tight mb-1">{title || 'Diskon untuk semua produk'}</h3>
        <p className="text-white/75 text-[11px] mb-2">{subtitle || 'Periode terbatas!'}</p>

        {timeLeft && (
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            <span className="text-white/70 text-[10px] mr-0.5">Berakhir dalam</span>
            {timeLeft.days > 0 && (
              <span className="bg-white/15 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">{timeLeft.days}h</span>
            )}
            <span className="bg-white/15 text-white text-[11px] font-bold px-1.5 py-0.5 rounded font-mono">{pad(timeLeft.hours)}</span>
            <span className="text-white/50 text-[11px]">:</span>
            <span className="bg-white/15 text-white text-[11px] font-bold px-1.5 py-0.5 rounded font-mono">{pad(timeLeft.minutes)}</span>
            <span className="text-white/50 text-[11px]">:</span>
            <span className="bg-white/15 text-white text-[11px] font-bold px-1.5 py-0.5 rounded font-mono">{pad(timeLeft.seconds)}</span>
          </div>
        )}

        <button onClick={() => router.push('/produk')} className="bg-white text-[#4a6650] font-bold text-[12px] px-4 py-1.5 rounded-md">
          Belanja Sekarang
        </button>
      </div>
      <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-white/10 flex flex-col items-center justify-center ml-3 flex-shrink-0 relative z-10">
        <span className="text-white font-bold text-lg leading-none">{(discountLabel || '15% OFF').split('%')[0]}%</span>
        <span className="text-white/80 text-[9px] font-semibold">OFF</span>
      </div>
    </div>
  )
}

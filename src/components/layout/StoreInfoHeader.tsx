// =============================================
// src/components/layout/StoreInfoHeader.tsx
// Header sederhana (judul + tombol kembali) untuk halaman info statis
// =============================================
'use client'
import { useRouter } from 'next/navigation'

export function StoreInfoHeader({ title }: { title: string }) {
  const router = useRouter()
  return (
    <div className="bg-[#4a6650] px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
      <button onClick={() => router.back()} className="text-white text-xl">←</button>
      <span className="text-white font-semibold text-sm">{title}</span>
    </div>
  )
}

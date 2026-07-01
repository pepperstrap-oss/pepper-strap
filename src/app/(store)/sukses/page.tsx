// =============================================
// src/app/(store)/sukses/page.tsx
// Halaman sukses setelah bayar
// =============================================
'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [order, setOrder] = useState<any>(null)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  useEffect(() => {
    if (!orderNumber) return
    supabase.from('orders').select('*, order_items(*)')
      .eq('order_number', orderNumber).single()
      .then(({ data }) => setOrder(data))
  }, [orderNumber])

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center min-h-[80vh]">
        <div className="text-6xl mb-4 animate-bounce">✅</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Pesanan Dikonfirmasi!</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Terima kasih telah berbelanja di <strong>Pepper Strap</strong>.<br />
          Pesanan Anda sedang diproses dan akan segera kami kirim.
        </p>

        {order && (
          <div className="bg-[#e8f0e9] rounded-xl p-4 w-full text-left mb-6">
            <div className="mb-3">
              <div className="text-[10px] text-gray-500 mb-0.5">No. Pesanan</div>
              <div className="text-[15px] font-bold text-[#4a6650]">{order.order_number}</div>
            </div>
            <div className="mb-3">
              <div className="text-[10px] text-gray-500 mb-0.5">Pengiriman via</div>
              <div className="text-[13px] font-semibold">{order.courier} {order.courier_service}</div>
            </div>
            <div className="mb-3">
              <div className="text-[10px] text-gray-500 mb-0.5">Estimasi tiba</div>
              <div className="text-[13px] font-semibold">{order.estimated_days} hari kerja</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">Total Bayar</div>
              <div className="text-[15px] font-bold text-[#4a6650]">{fmt(order.total)}</div>
            </div>
          </div>
        )}

        <Link href="/akun/pesanan" className="w-full border-2 border-[#4a6650] text-[#4a6650] py-3 rounded-xl font-semibold text-sm block mb-2.5">
          Lacak Pesanan
        </Link>
        <Link href="/" className="w-full bg-[#4a6650] text-white py-3 rounded-xl font-bold text-sm block">
          Belanja Lagi
        </Link>
      </div>
    </MobileLayout>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}

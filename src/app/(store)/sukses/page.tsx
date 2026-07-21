// =============================================
// src/app/(store)/sukses/page.tsx
// Halaman sukses setelah bayar — tampil nomor pesanan dengan jelas
// =============================================
'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { useCartStore } from '@/store/cartStore'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [order, setOrder] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const { clearCart } = useCartStore()
  const cartCleared = useRef(false)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  useEffect(() => {
    if (!orderNumber) return

    if (!cartCleared.current) {
      clearCart()
      sessionStorage.removeItem('checkout_shipping')
      sessionStorage.removeItem('checkout_promo')
      cartCleared.current = true
    }

    supabase.from('orders').select('*, order_items(*)')
      .eq('order_number', orderNumber).single()
      .then(({ data }) => setOrder(data))

    // Cek status pembayaran langsung ke DOKU (nggak bergantung notifikasi otomatis)
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/doku/check-status?order_number=${orderNumber}`)
        const { data } = await supabase.from('orders').select('*, order_items(*)')
          .eq('order_number', orderNumber).single()
        if (data) setOrder(data)
      } catch {
        // Silent fail
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [orderNumber])

  function copyOrderNumber() {
    if (!orderNumber) return
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center py-8 px-5 text-center min-h-[80vh]">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Pesanan Berhasil!</h1>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Terima kasih telah berbelanja di <strong>Pepper Strap</strong>.<br />
          Pesanan Anda sedang kami proses.
        </p>

        {orderNumber && (
          <div className="bg-[#e8f0e9] rounded-2xl p-4 w-full mb-4">
            <div className="text-[11px] text-gray-500 mb-1">Simpan nomor pesanan ini untuk melacak status</div>
            <div className="text-[22px] font-bold text-[#4a6650] tracking-wide mb-2">{orderNumber}</div>
            <button
              onClick={copyOrderNumber}
              className="flex items-center gap-1.5 mx-auto text-[12px] bg-white border border-[#4a6650] text-[#4a6650] px-4 py-1.5 rounded-full font-semibold"
            >
              {copied ? '✅ Tersalin!' : '📋 Salin Nomor Pesanan'}
            </button>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-xl border border-gray-100 p-3.5 w-full text-left mb-4 space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">Pengiriman via</span>
              <span className="font-semibold">{order.courier} {order.courier_service}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">Estimasi tiba</span>
              <span className="font-semibold">{order.estimated_days} hari kerja</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">Dikirim ke</span>
              <span className="font-semibold text-right max-w-[60%]">{order.shipping_address?.city}, {order.shipping_address?.province}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-[#4a6650] border-t border-gray-100 pt-2">
              <span>Total Bayar</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 w-full mb-4 text-left">
          <div className="text-[12px] text-amber-700 font-semibold mb-0.5">💡 Cara melacak pesanan</div>
          <div className="text-[11px] text-amber-600 leading-relaxed">
            Gunakan nomor pesanan di atas dan email yang kamu pakai saat checkout di halaman <strong>Lacak Pesanan</strong>.
          </div>
        </div>

        <Link href={`/lacak?nomor=${orderNumber || ''}`}
          className="w-full bg-[#4a6650] text-white py-3 rounded-xl font-bold text-sm block mb-2.5 text-center">
          🔍 Lacak Pesanan Saya
        </Link>
        <Link href="/"
          className="w-full border-2 border-[#4a6650] text-[#4a6650] py-3 rounded-xl font-semibold text-sm block text-center">
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

// =============================================
// src/app/(store)/akun/pesanan/page.tsx
// Daftar pesanan pelanggan
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MobileLayout } from '@/components/layout/MobileLayout'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu Bayar', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Dibayar', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Diproses', color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'Dikirim', color: 'bg-cyan-100 text-cyan-700' },
  delivered: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
}

export default function MyOrdersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [user])

  return (
    <MobileLayout>
      <div className="bg-[#4a6650] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <span className="text-white font-semibold text-sm">Pesanan Saya</span>
      </div>
      <div className="p-3.5 pb-24">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Memuat pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📦</div>
            <div className="text-sm text-gray-500">Belum ada pesanan</div>
          </div>
        ) : orders.map(order => {
          const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' }
          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[12px] font-bold text-gray-800">{order.order_number}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
              </div>
              <div className="text-[11px] text-gray-500 mb-2">
                {order.order_items?.length} produk · {order.courier} {order.courier_service}
              </div>
              <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                <span className="text-[13px] font-bold text-[#4a6650]">{fmt(order.total)}</span>
                {order.tracking_number && (
                  <span className="text-[11px] text-gray-500">Resi: {order.tracking_number}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </MobileLayout>
  )
}

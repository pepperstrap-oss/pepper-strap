// =============================================
// src/app/admin/pesanan/page.tsx — Kelola Pesanan
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  async function loadOrders() {
    const { data } = await supabase.from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  async function updateStatus(orderId: string, status: string) {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
    if (error) { toast.error('Gagal update status'); return }
    toast.success('Status diperbarui')
    loadOrders()
  }

  async function updateTracking(orderId: string, trackingNumber: string) {
    await supabase.from('orders').update({ tracking_number: trackingNumber, status: 'shipped' }).eq('id', orderId)
    toast.success('Nomor resi disimpan')
    loadOrders()
  }

  return (
    <div className="p-3.5 pb-24">
      <div className="text-[15px] font-bold text-gray-800 mb-3">Semua Pesanan</div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat...</div>
      ) : orders.map(order => (
        <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[13px] font-bold">{order.order_number}</div>
              <div className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</div>
            </div>
            <select
              value={order.status}
              onChange={e => updateStatus(order.id, e.target.value)}
              className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 bg-white"
            >
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="text-[11px] text-gray-600 mb-1">
            👤 {order.shipping_address?.recipient_name} — {order.shipping_address?.phone}
          </div>
          <div className="text-[11px] text-gray-500 mb-1">
            📍 {order.shipping_address?.city}, {order.shipping_address?.province}
          </div>
          <div className="text-[11px] text-gray-500 mb-2">
            🚚 {order.courier} {order.courier_service} · Est. {order.estimated_days} hari
          </div>
          <div className="text-[11px] text-gray-500 mb-2">
            {order.order_items?.map((i: any) => `${i.product_name} (${i.size}) x${i.quantity}`).join(', ')}
          </div>
          {/* Input nomor resi */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              defaultValue={order.tracking_number || ''}
              placeholder="Nomor resi pengiriman"
              id={`resi-${order.id}`}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-800 bg-white"
            />
            <button
              onClick={() => {
                const val = (document.getElementById(`resi-${order.id}`) as HTMLInputElement)?.value
                if (val) updateTracking(order.id, val)
              }}
              className="bg-[#4a6650] text-white text-[11px] px-3 rounded-lg font-semibold"
            >
              Simpan
            </button>
          </div>
          <div className="flex justify-between items-center border-t border-gray-50 mt-2.5 pt-2">
            <span className="text-[11px] text-gray-400">{order.payment_status}</span>
            <span className="text-[13px] font-bold text-[#4a6650]">{fmt(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

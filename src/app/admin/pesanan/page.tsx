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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')
  const fmtDateTime = (d: string) =>
    new Date(d).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) + ' WIB'

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

  function copyAddress(order: any) {
    const a = order.shipping_address
    const text = [
      a?.recipient_name, a?.phone, a?.street,
      `${a?.city || ''}, ${a?.province || ''} ${a?.postal_code || ''}`,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Alamat disalin')
  }

  return (
    <div className="p-3.5 pb-24">
      <div className="text-[15px] font-bold text-gray-800 mb-3">Semua Pesanan</div>
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Belum ada pesanan</div>
      ) : orders.map(order => {
        const a = order.shipping_address
        const isOpen = expandedId === order.id
        return (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 mb-3 overflow-hidden">
            {/* Header — klik untuk buka/tutup detail */}
            <div
              onClick={() => setExpandedId(isOpen ? null : order.id)}
              className="p-3.5 cursor-pointer active:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[13px] font-bold">{order.order_number}</div>
                  <div className="text-[10px] text-gray-400">{fmtDateTime(order.created_at)}</div>
                </div>
                <select
                  value={order.status}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateStatus(order.id, e.target.value)}
                  className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 bg-white"
                >
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="text-[11px] text-gray-600 mb-1">
                👤 {a?.recipient_name || order.guest_name || '-'} — {a?.phone || order.guest_phone || '-'}
              </div>
              <div className="text-[11px] text-gray-500 mb-1">
                📍 {a?.city || '-'}, {a?.province || ''}
              </div>
              <div className="text-[11px] text-gray-500">
                🚚 {order.courier} {order.courier_service} · Est. {order.estimated_days} hari
              </div>
              <div className="text-[10px] text-[#4a6650] mt-2 font-semibold">
                {isOpen ? '▲ Sembunyikan detail' : '▼ Lihat detail lengkap & alamat'}
              </div>
            </div>

            {/* Detail lengkap — muncul saat card diklik */}
            {isOpen && (
              <div className="px-3.5 pb-3.5 border-t border-gray-50 pt-3 space-y-3" onClick={e => e.stopPropagation()}>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1.5">Alamat Pengiriman</div>
                  <div className="bg-[#f7f5f0] rounded-lg p-3 text-[12px] text-gray-700 leading-relaxed">
                    <div className="font-semibold text-gray-800">{a?.recipient_name || order.guest_name || '-'}</div>
                    <div>{a?.phone || order.guest_phone || '-'}</div>
                    {order.guest_email && <div className="text-gray-500">{order.guest_email}</div>}
                    <div className="mt-1.5">{a?.street || '-'}</div>
                    <div>{a?.city}, {a?.province} {a?.postal_code}</div>
                  </div>
                  <button
                    onClick={() => copyAddress(order)}
                    className="mt-1.5 text-[10px] text-[#4a6650] border border-[#4a6650] px-2.5 py-1 rounded-lg"
                  >
                    📋 Salin Alamat
                  </button>
                </div>

                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1.5">Item Pesanan</div>
                  <div className="space-y-1">
                    {order.order_items?.map((i: any) => (
                      <div key={i.id} className="flex justify-between text-[11px] text-gray-600">
                        <span>{i.product_name} ({i.size}) x{i.quantity}</span>
                        <span className="text-gray-800 font-medium">{fmt(i.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Catatan Pembeli</div>
                    <div className="text-[11px] text-gray-600 bg-[#f7f5f0] rounded-lg p-2.5">{order.notes}</div>
                  </div>
                )}

                <div className="text-[11px] text-gray-500 space-y-0.5">
                  <div className="flex justify-between"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Ongkir</span><span>{fmt(order.shipping_cost)}</span></div>
                  <div className="flex justify-between font-bold text-gray-800 text-[12px] pt-1 border-t border-gray-100">
                    <span>Total</span><span>{fmt(order.total)}</span>
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="text-[11px] text-gray-500">
                    📦 No. Resi saat ini: <span className="font-semibold text-gray-800">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            )}

            {/* Input nomor resi — selalu tampil */}
            <div className="px-3.5 pb-3 flex gap-2" onClick={e => e.stopPropagation()}>
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

            <div className="flex justify-between items-center border-t border-gray-50 px-3.5 py-2.5">
              <span className="text-[11px] text-gray-400">{order.payment_status}</span>
              <span className="text-[13px] font-bold text-[#4a6650]">{fmt(order.total)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

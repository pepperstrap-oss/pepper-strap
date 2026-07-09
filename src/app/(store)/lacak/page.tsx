// =============================================
// src/app/(store)/lacak/page.tsx
// Halaman Lacak Pesanan (untuk guest maupun member)
// =============================================
'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { OrderTimeline } from '@/components/order/OrderTimeline'

const STATUS_INFO: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  pending:    { label: 'Menunggu Pembayaran', icon: '⏳', color: 'text-yellow-600', desc: 'Pesanan menunggu konfirmasi pembayaran.' },
  paid:       { label: 'Pembayaran Diterima', icon: '✅', color: 'text-blue-600',   desc: 'Pembayaran berhasil, pesanan sedang disiapkan.' },
  processing: { label: 'Sedang Diproses',     icon: '📦', color: 'text-purple-600', desc: 'Pesanan sedang dikemas oleh tim kami.' },
  shipped:    { label: 'Dalam Pengiriman',    icon: '🚚', color: 'text-cyan-600',   desc: 'Pesanan sudah dikirim, dalam perjalanan ke Anda.' },
  delivered:  { label: 'Pesanan Selesai',     icon: '🎉', color: 'text-green-600',  desc: 'Pesanan telah sampai. Terima kasih telah berbelanja!' },
  cancelled:  { label: 'Dibatalkan',          icon: '❌', color: 'text-red-500',    desc: 'Pesanan ini telah dibatalkan.' },
}

function LacakContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('nomor') || '')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (!orderNumber.trim() || !email.trim()) { setError('Nomor pesanan dan email wajib diisi'); return }
    setLoading(true)
    setError('')
    setOrder(null)
    setSearched(true)

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .single()

      if (err || !data) {
        setError('Pesanan tidak ditemukan. Pastikan nomor pesanan dan email sudah benar.')
        setLoading(false)
        return
      }

      // Verifikasi email (cocokkan dengan guest_email atau email user)
      const emailMatch =
        data.guest_email?.toLowerCase() === email.trim().toLowerCase() ||
        data.shipping_address?.email?.toLowerCase() === email.trim().toLowerCase()

      if (!emailMatch) {
        // Cek email dari auth.users kalau user punya akun
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user || userData.user.email?.toLowerCase() !== email.trim().toLowerCase()) {
          setError('Email tidak cocok dengan data pesanan ini.')
          setLoading(false)
          return
        }
      }

      setOrder(data)
    } catch {
      setError('Terjadi kesalahan, coba lagi.')
    }
    setLoading(false)
  }

  const statusInfo = order ? (STATUS_INFO[order.status] || { label: order.status, icon: '📋', color: 'text-gray-600', desc: '' }) : null

  return (
    <MobileLayout>
      <div className="p-3.5 pb-24">
        <h1 className="text-[16px] font-bold text-gray-800 mb-1">Lacak Pesanan</h1>
        <p className="text-[12px] text-gray-400 mb-4">Masukkan nomor pesanan dan email yang digunakan saat checkout.</p>

        {/* Form Lacak */}
        <form onSubmit={handleTrack} className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3 space-y-2.5">
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Nomor Pesanan</label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="PS-20260702-001"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] text-gray-800 bg-white uppercase"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Email yang dipakai saat checkout</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] text-gray-800 bg-white"
            />
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#4a6650] text-white py-2.5 rounded-lg font-semibold text-[13px] disabled:opacity-60">
            {loading ? 'Mencari...' : '🔍 Lacak Pesanan'}
          </button>
        </form>

        {/* Hasil Lacak */}
        {order && statusInfo && (
          <div className="space-y-3">
            {/* Status utama */}
            <div className="bg-white rounded-xl border border-gray-100 p-3.5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{statusInfo.icon}</span>
                <div>
                  <div className={`text-[14px] font-bold ${statusInfo.color}`}>{statusInfo.label}</div>
                  <div className="text-[11px] text-gray-400">{statusInfo.desc}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 mt-2">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>No. Pesanan</span>
                  <span className="font-bold text-gray-800">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Tanggal Pesan</span>
                  <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Total Bayar</span>
                  <span className="font-bold text-[#4a6650]">{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Timeline visual — hanya tampil kalau status bukan 'cancelled' */}
            <OrderTimeline
              status={order.status}
              orderDate={order.created_at}
              trackingNumber={order.tracking_number}
              courier={order.courier ? `${order.courier} ${order.courier_service || ''}`.trim() : undefined}
            />

            {/* Resi pengiriman */}
            {order.tracking_number && (
              <div className="bg-[#e8f0e9] rounded-xl p-3.5">
                <div className="text-[12px] font-semibold text-[#4a6650] mb-1">🚚 Nomor Resi Pengiriman</div>
                <div className="text-[15px] font-bold text-gray-800">{order.tracking_number}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{order.courier} {order.courier_service} · Est. {order.estimated_days} hari kerja</div>
              </div>
            )}

            {/* Alamat pengiriman */}
            <div className="bg-white rounded-xl border border-gray-100 p-3.5">
              <div className="text-[12px] font-semibold text-[#4a6650] mb-2">📍 Alamat Pengiriman</div>
              <div className="text-[12px] text-gray-700">{order.shipping_address?.recipient_name}</div>
              <div className="text-[11px] text-gray-500">{order.shipping_address?.phone}</div>
              <div className="text-[11px] text-gray-500 mt-1">{order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.province}</div>
            </div>

            {/* Item pesanan */}
            <div className="bg-white rounded-xl border border-gray-100 p-3.5">
              <div className="text-[12px] font-semibold text-[#4a6650] mb-2">📦 Item Pesanan</div>
              {(order.order_items || []).map((item: any) => (
                <div key={item.id} className="flex gap-2.5 mb-2.5 last:mb-0">
                  <div className="w-10 h-10 bg-[#e8f0e9] rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.product_image
                      ? <img src={item.product_image} className="w-full h-full object-cover" alt={item.product_name} />
                      : <span className="text-lg">📦</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-gray-800">{item.product_name}</div>
                    <div className="text-[10px] text-gray-400">Ukuran: {item.size} · x{item.quantity}</div>
                    <div className="text-[12px] font-bold text-[#4a6650]">{fmt(item.subtotal)}</div>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-[12px]">
                <span className="text-gray-500">Ongkir ({order.courier} {order.courier_service})</span>
                <span>{fmt(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-[#4a6650] mt-1">
                <span>Total</span>
                <span>{fmt(order.total)}</span>
              </div>
            </div>

            {/* Tombol WhatsApp */}
            <a
              href={`https://wa.me/?text=Halo, saya ingin menanyakan pesanan saya dengan nomor ${order.order_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-[13px]"
            >
              💬 Hubungi Kami via WhatsApp
            </a>
          </div>
        )}

        {/* Belum cari */}
        {!searched && !order && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-[12px]">Masukkan nomor pesanan dan email di atas untuk melacak status pesanan Anda.</div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}

export default function LacakPage() {
  return (
    <Suspense fallback={null}>
      <LacakContent />
    </Suspense>
  )
}

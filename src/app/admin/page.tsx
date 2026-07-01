// =============================================
// src/app/admin/page.tsx — Dashboard Admin
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0, pending: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  useEffect(() => {
    async function load() {
      const [{ data: orders }, { count: productCount }] = await Promise.all([
        supabase.from('orders').select('total, status, order_number, created_at, shipping_address').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ])
      const allOrders = orders || []
      setRecentOrders(allOrders)
      setStats({
        orders: allOrders.length,
        products: productCount || 0,
        revenue: allOrders.filter(o => o.status !== 'cancelled').reduce((s: number, o: any) => s + o.total, 0),
        pending: allOrders.filter(o => o.status === 'pending').length,
      })
    }
    load()
  }, [])

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700', shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-3.5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {[
          { label: 'Total Pesanan', value: stats.orders, icon: '📋' },
          { label: 'Produk Aktif', value: stats.products, icon: '🛍️' },
          { label: 'Total Pendapatan', value: fmt(stats.revenue), icon: '💰' },
          { label: 'Menunggu Bayar', value: stats.pending, icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-lg font-bold text-[#4a6650]">{s.value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pesanan terbaru */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5">
        <div className="text-[13px] font-bold text-gray-800 mb-3">Pesanan Terbaru</div>
        {recentOrders.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-4">Belum ada pesanan</p>
        ) : recentOrders.map(o => (
          <div key={o.order_number} className="flex items-center gap-2 py-2.5 border-b border-gray-50 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold">{o.order_number}</div>
              <div className="text-[10px] text-gray-400 truncate">{o.shipping_address?.recipient_name}</div>
            </div>
            <div className="text-[12px] font-bold text-[#4a6650]">{fmt(o.total)}</div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLOR[o.status] || 'bg-gray-100'}`}>
              {o.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

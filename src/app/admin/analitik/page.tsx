// =============================================
// src/app/admin/analitik/page.tsx — Analitik Performa Toko Bulanan
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export default function AdminAnalyticsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locking, setLocking] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  async function loadReports() {
    setLoading(true)
    const { data } = await supabase
      .from('monthly_reports')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  useEffect(() => { loadReports() }, [])

  // Kunci/perbarui laporan bulan tertentu — dihitung langsung di browser admin (bukan lewat cron)
  async function lockMonthManual() {
    setLocking(true)
    try {
      const year = selectedYear
      const month = selectedMonth
      const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString()
      const endDate = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1)).toISOString()

      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total, order_items(quantity)')
        .eq('payment_status', 'paid')
        .gte('created_at', startDate)
        .lt('created_at', endDate)

      if (error) throw error

      const totalSales = (orders || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      const totalProductsSold = (orders || []).reduce(
        (sum: number, o: any) => sum + (o.order_items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0),
        0
      )
      const orderCount = (orders || []).length

      const { error: upsertError } = await supabase
        .from('monthly_reports')
        .upsert(
          {
            year,
            month,
            total_sales: totalSales,
            total_products_sold: totalProductsSold,
            order_count: orderCount,
            locked_at: new Date().toISOString(),
          },
          { onConflict: 'year,month' }
        )

      if (upsertError) throw upsertError

      toast.success(`Laporan ${NAMA_BULAN[month - 1]} ${year} berhasil dikunci!`)
      loadReports()
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengunci laporan')
    } finally {
      setLocking(false)
    }
  }

  const maxSales = Math.max(1, ...reports.map(r => r.total_sales))
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="p-3.5 pb-24">
      <div className="text-[15px] font-bold text-gray-800 mb-3">📈 Analitik Performa Toko</div>

      {/* Kunci/perbarui bulan tertentu */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5 mb-4">
        <div className="text-[12px] font-semibold text-gray-700 mb-2">Kunci / Perbarui Laporan Bulan</div>
        <div className="flex gap-2 mb-2.5">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-[12px] text-gray-800 bg-white"
          >
            {NAMA_BULAN.map((nama, i) => (
              <option key={i} value={i + 1}>{nama}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-[12px] text-gray-800 bg-white"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button
          onClick={lockMonthManual}
          disabled={locking}
          className="w-full bg-[#4a6650] text-white py-2 rounded-lg font-semibold text-[12px] disabled:opacity-60"
        >
          {locking ? 'Menghitung...' : '🔒 Kunci / Perbarui Bulan Ini'}
        </button>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Bulan berjalan otomatis terkunci tiap tanggal 1. Tombol ini buat isi data bulan lama, atau perbarui manual kapan saja.
        </p>
      </div>

      {/* Daftar laporan yang sudah dikunci */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Belum ada laporan bulanan yang dikunci</div>
      ) : (
        <div className="space-y-2.5">
          {reports.map(r => (
            <div key={`${r.year}-${r.month}`} className="bg-white rounded-xl border border-gray-100 p-3.5">
              <div className="flex justify-between items-start mb-2">
                <div className="text-[13px] font-bold text-gray-800">{NAMA_BULAN[r.month - 1]} {r.year}</div>
                <div className="text-[10px] text-gray-400">
                  Dikunci {new Date(r.locked_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Bar visual sederhana buat perbandingan antar bulan */}
              <div className="w-full h-2 bg-gray-100 rounded-full mb-2.5 overflow-hidden">
                <div
                  className="h-full bg-[#4a6650] rounded-full"
                  style={{ width: `${Math.max(4, (r.total_sales / maxSales) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[13px] font-bold text-[#4a6650]">{fmt(r.total_sales)}</div>
                  <div className="text-[10px] text-gray-400">Total Penjualan</div>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-gray-800">{r.total_products_sold}</div>
                  <div className="text-[10px] text-gray-400">Produk Terjual</div>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-gray-800">{r.order_count}</div>
                  <div className="text-[10px] text-gray-400">Jumlah Pesanan</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

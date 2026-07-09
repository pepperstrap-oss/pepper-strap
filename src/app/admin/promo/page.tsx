// =============================================
// src/app/admin/promo/page.tsx — Kelola Promo
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { PromoForm } from '@/components/admin/PromoForm'

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPromo, setEditPromo] = useState<any>(null)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  async function loadPromos() {
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
    setPromos(data || [])
    setLoading(false)
  }

  useEffect(() => { loadPromos() }, [])

  async function toggleActive(promo: any) {
    await supabase.from('promotions').update({ is_active: !promo.is_active }).eq('id', promo.id)
    toast.success(promo.is_active ? 'Promo dinonaktifkan' : 'Promo diaktifkan')
    loadPromos()
  }

  async function deletePromo(id: string) {
    if (!confirm('Hapus promo ini?')) return
    await supabase.from('promotions').delete().eq('id', id)
    toast.success('Promo dihapus')
    loadPromos()
  }

  function describeDiscount(p: any) {
    if (p.discount_type === 'percentage') return `${p.discount_value}% off` + (p.max_discount ? ` (maks ${fmt(p.max_discount)})` : '')
    if (p.discount_type === 'fixed') return `Potong ${fmt(p.discount_value)}`
    return 'Gratis Ongkir'
  }

  return (
    <div className="p-3.5 pb-24">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-gray-800">Kode Promo</div>
        <button
          onClick={() => { setEditPromo(null); setShowForm(true) }}
          className="bg-[#4a6650] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg"
        >
          + Buat Promo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat...</div>
      ) : promos.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Belum ada promo</div>
      ) : promos.map(p => {
        const expired = new Date(p.end_date) < new Date()
        const quotaFull = p.usage_limit !== null && p.usage_count >= p.usage_limit
        return (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 mb-3 p-3.5">
            <div className="flex justify-between items-start mb-1.5">
              <div className="font-mono font-bold text-[14px] text-[#4a6650]">{p.code}</div>
              <button
                onClick={() => toggleActive(p)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {p.is_active ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
            {p.description && <div className="text-[11px] text-gray-500 mb-1.5">{p.description}</div>}
            <div className="text-[12px] text-gray-700 font-semibold mb-1">{describeDiscount(p)}</div>
            {p.min_purchase > 0 && (
              <div className="text-[11px] text-gray-500">Min. belanja {fmt(p.min_purchase)}</div>
            )}
            <div className="text-[11px] text-gray-500">
              {new Date(p.start_date).toLocaleDateString('id-ID')} – {new Date(p.end_date).toLocaleDateString('id-ID')}
              {expired && <span className="text-red-500 font-semibold"> (kadaluarsa)</span>}
            </div>
            <div className="text-[11px] text-gray-500 mb-2">
              Dipakai {p.usage_count}{p.usage_limit !== null ? `/${p.usage_limit}` : ''} kali
              {quotaFull && <span className="text-red-500 font-semibold"> (kuota habis)</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditPromo(p); setShowForm(true) }}
                className="text-[11px] text-[#4a6650] border border-[#4a6650] px-2.5 py-1 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={() => deletePromo(p.id)}
                className="text-[11px] text-red-500 border border-red-200 px-2.5 py-1 rounded-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        )
      })}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold text-[14px]">{editPromo ? 'Edit Promo' : 'Buat Promo'}</div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <PromoForm
              editPromo={editPromo}
              onSuccess={() => { setShowForm(false); loadPromos() }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

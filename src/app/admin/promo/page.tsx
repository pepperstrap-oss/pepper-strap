// =============================================
// src/app/admin/promo/page.tsx — Kelola Promo
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', description: '', label: '', discount_percent: 0, min_purchase: 0, promo_code: '' })
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false })
    setPromos(data || [])
  }
  useEffect(() => { load() }, [])

  async function savePromo(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.label) { toast.error('Judul dan label wajib diisi'); return }
    const { error } = await supabase.from('promos').insert({ ...form, is_active: true })
    if (error) { toast.error('Gagal menyimpan promo'); return }
    toast.success('Promo ditambahkan!')
    setForm({ title: '', description: '', label: '', discount_percent: 0, min_purchase: 0, promo_code: '' })
    setShowForm(false)
    load()
  }

  async function togglePromo(id: string, isActive: boolean) {
    await supabase.from('promos').update({ is_active: !isActive }).eq('id', id)
    load()
  }

  async function deletePromo(id: string) {
    if (!confirm('Hapus promo ini?')) return
    await supabase.from('promos').delete().eq('id', id)
    toast.success('Promo dihapus')
    load()
  }

  return (
    <div className="p-3.5 pb-24">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-gray-800">Kelola Promo</div>
        <button onClick={() => setShowForm(s => !s)} className="bg-[#4a6650] text-white text-[12px] px-3 py-1.5 rounded-lg font-semibold">
          + Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={savePromo} className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3 space-y-2.5">
          <div className="text-[13px] font-bold text-gray-800 mb-2">Promo Baru</div>
          {[
            { label: 'Judul *', key: 'title', placeholder: 'Gratis Ongkir' },
            { label: 'Deskripsi', key: 'description', placeholder: 'Min. pembelian Rp 200.000' },
            { label: 'Label Badge *', key: 'label', placeholder: 'GRATIS ONGKIR' },
            { label: 'Kode Promo', key: 'promo_code', placeholder: 'NEWSTRAP (kosongkan jika tidak ada)' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
              <input type="text" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Diskon %</label>
              <input type="number" value={form.discount_percent} onChange={e => setForm(p => ({ ...p, discount_percent: +e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px]" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Min. Pembelian</label>
              <input type="number" value={form.min_purchase} onChange={e => setForm(p => ({ ...p, min_purchase: +e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px]" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#4a6650] text-white py-2.5 rounded-lg font-semibold text-[13px]">Simpan Promo</button>
        </form>
      )}

      <div className="space-y-2.5">
        {promos.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3.5">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded mr-2">{p.label}</span>
                <span className="text-[12px] font-semibold text-gray-800">{p.title}</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 mb-2">{p.description}</div>
            {p.promo_code && <div className="text-[11px] text-[#4a6650] font-semibold mb-2">Kode: {p.promo_code}</div>}
            <div className="flex gap-2">
              <button onClick={() => togglePromo(p.id, p.is_active)}
                className="flex-1 text-[11px] border border-gray-200 text-gray-600 py-1.5 rounded-lg">
                {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button onClick={() => deletePromo(p.id)}
                className="flex-1 text-[11px] border border-red-200 text-red-500 py-1.5 rounded-lg">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

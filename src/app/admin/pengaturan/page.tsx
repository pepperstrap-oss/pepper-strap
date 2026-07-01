// =============================================
// src/app/admin/pengaturan/page.tsx — Pengaturan Tampilan
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [hero, setHero] = useState({ title: '', subtitle: '', theme_color: '#4a6650' })
  const [banner, setBanner] = useState({ title: '', subtitle: '', discount_label: '', is_active: true })
  const [store, setStore] = useState({ name: '', whatsapp: '', email: '', instagram: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (!data) return
      data.forEach(s => {
        if (s.key === 'hero') setHero(s.value)
        if (s.key === 'promo_banner') setBanner(s.value)
        if (s.key === 'store_info') setStore(s.value)
      })
    })
  }, [])

  async function saveSettings() {
    setSaving(true)
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'hero', value: hero, updated_at: new Date().toISOString() }),
      supabase.from('site_settings').upsert({ key: 'promo_banner', value: banner, updated_at: new Date().toISOString() }),
      supabase.from('site_settings').upsert({ key: 'store_info', value: store, updated_at: new Date().toISOString() }),
    ])
    toast.success('Pengaturan disimpan!')
    setSaving(false)
  }

  const COLORS = ['#4a6650', '#3d2b1f', '#2c5f6e', '#7b4f2e', '#1a1a2e', '#5a3e6e']

  return (
    <div className="p-3.5 pb-24 space-y-3">
      {/* Hero */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5">
        <div className="text-[13px] font-bold text-[#4a6650] mb-3">🎨 Desain Hero</div>
        <label className="text-[11px] text-gray-500 mb-1 block">Warna Tema</label>
        <div className="flex gap-2 mb-3">
          {COLORS.map(c => (
            <button key={c} onClick={() => setHero(h => ({ ...h, theme_color: c }))}
              className={`w-7 h-7 rounded-full border-2 transition-all ${hero.theme_color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ background: c }} />
          ))}
        </div>
        {[
          { label: 'Judul Hero', key: 'title' as keyof typeof hero, placeholder: 'Handmade Leather Watch Strap' },
          { label: 'Subjudul', key: 'subtitle' as keyof typeof hero, placeholder: 'Strap kulit premium...' },
        ].map(f => (
          <div key={f.key} className="mb-2">
            <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
            <input type="text" value={hero[f.key]} onChange={e => setHero(h => ({ ...h, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]" />
          </div>
        ))}
      </div>

      {/* Promo Banner */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5">
        <div className="text-[13px] font-bold text-[#4a6650] mb-3">🏷️ Banner Promo</div>
        {[
          { label: 'Judul Banner', key: 'title' as keyof typeof banner },
          { label: 'Keterangan', key: 'subtitle' as keyof typeof banner },
          { label: 'Label Diskon', key: 'discount_label' as keyof typeof banner, placeholder: '15% OFF' },
        ].map(f => (
          <div key={f.key} className="mb-2">
            <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
            <input type="text" value={banner[f.key] as string} onChange={e => setBanner(b => ({ ...b, [f.key]: e.target.value }))}
              placeholder={f.placeholder || ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]" />
          </div>
        ))}
        <label className="flex items-center gap-2 text-[12px] cursor-pointer">
          <input type="checkbox" checked={banner.is_active} onChange={e => setBanner(b => ({ ...b, is_active: e.target.checked }))} />
          Tampilkan banner di beranda
        </label>
      </div>

      {/* Info Toko */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5">
        <div className="text-[13px] font-bold text-[#4a6650] mb-3">🏪 Info Toko</div>
        {[
          { label: 'Nama Toko', key: 'name' as keyof typeof store },
          { label: 'WhatsApp', key: 'whatsapp' as keyof typeof store, placeholder: '081234567890' },
          { label: 'Email', key: 'email' as keyof typeof store },
          { label: 'Instagram', key: 'instagram' as keyof typeof store, placeholder: '@pepperstrap' },
        ].map(f => (
          <div key={f.key} className="mb-2">
            <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
            <input type="text" value={store[f.key]} onChange={e => setStore(s => ({ ...s, [f.key]: e.target.value }))}
              placeholder={f.placeholder || ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]" />
          </div>
        ))}
      </div>

      <button onClick={saveSettings} disabled={saving}
        className="w-full bg-[#4a6650] text-white py-3.5 rounded-xl font-bold text-[14px] disabled:opacity-60">
        {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
      </button>
    </div>
  )
}

// =============================================
// src/app/admin/pengaturan/page.tsx
// Pengaturan Tampilan Toko — Hero, Banner, Info Toko
// =============================================
'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadProductImage } from '@/lib/uploadImage'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [hero, setHero] = useState({ title: '', subtitle: '', theme_color: '#4a6650', image_url: '' })
  const [banner, setBanner] = useState({ title: '', subtitle: '', discount_label: '', is_active: true, image_url: '', end_date: '' })
  const [store, setStore] = useState({ name: '', whatsapp: '', email: '', instagram: '' })
  const [saving, setSaving] = useState(false)

  // Refs untuk upload foto
  const heroImgRef = useRef<HTMLInputElement>(null)
  const bannerImgRef = useRef<HTMLInputElement>(null)
  const [heroImgFile, setHeroImgFile] = useState<File | null>(null)
  const [bannerImgFile, setBannerImgFile] = useState<File | null>(null)
  const [heroImgPreview, setHeroImgPreview] = useState('')
  const [bannerImgPreview, setBannerImgPreview] = useState('')

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (!data) return
      data.forEach(s => {
        if (s.key === 'hero') { setHero(s.value); setHeroImgPreview(s.value.image_url || '') }
        if (s.key === 'promo_banner') { setBanner({ end_date: '', ...s.value }); setBannerImgPreview(s.value.image_url || '') }
        if (s.key === 'store_info') setStore(s.value)
      })
    })
  }, [])

  function handleHeroImg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setHeroImgFile(f); setHeroImgPreview(URL.createObjectURL(f))
  }

  function handleBannerImg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setBannerImgFile(f); setBannerImgPreview(URL.createObjectURL(f))
  }

  async function saveSettings() {
    setSaving(true)
    try {
      // Upload foto hero kalau ada
      let heroImageUrl = hero.image_url
      if (heroImgFile) {
        const url = await uploadProductImage(heroImgFile, `hero-banner-${Date.now()}`)
        if (url) heroImageUrl = url
      }

      // Upload foto promo banner kalau ada
      let bannerImageUrl = banner.image_url
      if (bannerImgFile) {
        const url = await uploadProductImage(bannerImgFile, `promo-banner-${Date.now()}`)
        if (url) bannerImageUrl = url
      }

      await Promise.all([
        supabase.from('site_settings').upsert({ key: 'hero', value: { ...hero, image_url: heroImageUrl }, updated_at: new Date().toISOString() }),
        supabase.from('site_settings').upsert({ key: 'promo_banner', value: { ...banner, image_url: bannerImageUrl }, updated_at: new Date().toISOString() }),
        supabase.from('site_settings').upsert({ key: 'store_info', value: store, updated_at: new Date().toISOString() }),
      ])

      setHero(h => ({ ...h, image_url: heroImageUrl }))
      setBanner(b => ({ ...b, image_url: bannerImageUrl }))
      setHeroImgFile(null)
      setBannerImgFile(null)
      toast.success('Pengaturan disimpan!')
    } catch {
      toast.error('Gagal menyimpan pengaturan')
    }
    setSaving(false)
  }

  const COLORS = ['#4a6650', '#3d2b1f', '#2c5f6e', '#7b4f2e', '#1a1a2e', '#5a3e6e', '#8b5e3c', '#2d6a4f']

  return (
    <div className="p-3.5 pb-24 space-y-3">

      {/* ===== HERO BERANDA ===== */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5">
        <div className="text-[13px] font-bold text-[#4a6650] mb-3">🎨 Hero Beranda</div>

        {/* Upload foto hero */}
        <label className="text-[11px] text-gray-500 mb-1 block">Foto Background Hero (opsional)</label>
        <div onClick={() => heroImgRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-[#4a6650] hover:bg-[#e8f0e9] transition-colors mb-2.5">
          {heroImgPreview ? (
            <img src={heroImgPreview} alt="Hero preview" className="w-full h-20 object-cover rounded-lg" />
          ) : (
            <>
              <div className="text-xl mb-0.5">🖼️</div>
              <p className="text-[10px] text-gray-400">Ketuk untuk upload foto hero</p>
            </>
          )}
        </div>
        <input ref={heroImgRef} type="file" accept="image/*" onChange={handleHeroImg} className="hidden" />
        {heroImgPreview && (
          <button type="button" onClick={() => { setHeroImgPreview(''); setHeroImgFile(null); setHero(h => ({ ...h, image_url: '' })) }}
            className="text-[10px] text-red-500 mb-2 block">Hapus foto hero</button>
        )}

        {/* Warna tema */}
        <label className="text-[11px] text-gray-500 mb-1 block">Warna Tema Hero</label>
        <div className="flex gap-2 mb-3 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setHero(h => ({ ...h, theme_color: c }))}
              className={`w-7 h-7 rounded-full border-2 transition-all flex-shrink-0 ${hero.theme_color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ background: c }} />
          ))}
        </div>

        {/* Judul & subjudul */}
        {[
          { label: 'Judul Hero', key: 'title' as keyof typeof hero, placeholder: 'Handmade Leather Watch Strap' },
          { label: 'Subjudul', key: 'subtitle' as keyof typeof hero, placeholder: 'Strap kulit premium buatan tangan...' },
        ].map(f => (
          <div key={f.key} className="mb-2">
            <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
            <input type="text" value={hero[f.key]} onChange={e => setHero(h => ({ ...h, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] text-gray-800 bg-white" />
          </div>
        ))}

        {/* Preview mini hero */}
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-100">
          <div className="p-3 text-white text-[10px] font-bold" style={{ background: hero.theme_color }}>
            {hero.title || 'Judul Hero'} — Preview
          </div>
        </div>
      </div>

      {/* ===== BANNER PROMO ===== */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5">
        <div className="text-[13px] font-bold text-[#4a6650] mb-3">🏷️ Banner Promo Beranda</div>

        {/* Upload foto banner */}
        <label className="text-[11px] text-gray-500 mb-1 block">Foto Banner Promo (opsional)</label>
        <div onClick={() => bannerImgRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-[#4a6650] hover:bg-[#e8f0e9] transition-colors mb-2.5">
          {bannerImgPreview ? (
            <img src={bannerImgPreview} alt="Banner preview" className="w-full h-16 object-cover rounded-lg" />
          ) : (
            <>
              <div className="text-xl mb-0.5">🖼️</div>
              <p className="text-[10px] text-gray-400">Ketuk untuk upload foto banner promo</p>
            </>
          )}
        </div>
        <input ref={bannerImgRef} type="file" accept="image/*" onChange={handleBannerImg} className="hidden" />
        {bannerImgPreview && (
          <button type="button" onClick={() => { setBannerImgPreview(''); setBannerImgFile(null); setBanner(b => ({ ...b, image_url: '' })) }}
            className="text-[10px] text-red-500 mb-2 block">Hapus foto banner</button>
        )}

        {[
          { label: 'Judul Banner', key: 'title' as keyof typeof banner },
          { label: 'Keterangan', key: 'subtitle' as keyof typeof banner },
          { label: 'Label Diskon (misal: 15% OFF)', key: 'discount_label' as keyof typeof banner, placeholder: '15% OFF' },
        ].map(f => (
          <div key={f.key} className="mb-2">
            <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
            <input type="text" value={banner[f.key] as string} onChange={e => setBanner(b => ({ ...b, [f.key]: e.target.value }))}
              placeholder={f.placeholder || ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] text-gray-800 bg-white" />
          </div>
        ))}

        {/* Tanggal & jam berakhir — buat countdown timer di banner */}
        <div className="mb-2">
          <label className="text-[11px] text-gray-500 mb-1 block">Tanggal & Jam Berakhir Promo (opsional)</label>
          <input
            type="datetime-local"
            value={banner.end_date}
            onChange={e => setBanner(b => ({ ...b, end_date: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] text-gray-800 bg-white"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Kalau diisi, banner akan menampilkan hitung mundur dan otomatis hilang sendiri setelah waktu ini lewat. Kosongkan kalau promo tidak ada batas waktu.
          </p>
        </div>

        <label className="flex items-center gap-2 text-[12px] cursor-pointer mt-1">
          <input type="checkbox" checked={banner.is_active} onChange={e => setBanner(b => ({ ...b, is_active: e.target.checked }))} />
          Tampilkan banner promo di beranda
        </label>
      </div>

      {/* ===== INFO TOKO ===== */}
      <div className="bg-white rounded-xl border border-gray-100 p-3.5">
        <div className="text-[13px] font-bold text-[#4a6650] mb-3">🏪 Info Toko</div>
        {[
          { label: 'Nama Toko', key: 'name' as keyof typeof store, placeholder: 'Pepper Strap' },
          { label: 'No. WhatsApp', key: 'whatsapp' as keyof typeof store, placeholder: '6281234567890 (pakai kode negara)' },
          { label: 'Email Toko', key: 'email' as keyof typeof store, placeholder: 'toko@email.com' },
          { label: 'Instagram', key: 'instagram' as keyof typeof store, placeholder: '@pepperstrap' },
        ].map(f => (
          <div key={f.key} className="mb-2">
            <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
            <input type="text" value={store[f.key]} onChange={e => setStore(s => ({ ...s, [f.key]: e.target.value }))}
              placeholder={f.placeholder || ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] text-gray-800 bg-white" />
          </div>
        ))}
        <p className="text-[10px] text-gray-400 mt-1">No. WhatsApp dipakai untuk tombol "Hubungi Kami" di halaman lacak pesanan.</p>
      </div>

      <button onClick={saveSettings} disabled={saving}
        className="w-full bg-[#4a6650] text-white py-3.5 rounded-xl font-bold text-[14px] disabled:opacity-60">
        {saving ? 'Menyimpan...' : '💾 Simpan Semua Pengaturan'}
      </button>
    </div>
  )
}

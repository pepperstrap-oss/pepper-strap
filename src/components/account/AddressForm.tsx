// =============================================
// src/components/account/AddressForm.tsx
// Form tambah/edit alamat tersimpan milik pelanggan
// =============================================
'use client'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Address } from '@/types'

type LocationOption = {
  id: string
  label: string
  city_name: string
  province_name: string
  postal_code: string
}

type Props = {
  userId: string
  onSuccess: () => void
  onCancel: () => void
  editAddress?: Address | null
}

export function AddressForm({ userId, onSuccess, onCancel, editAddress }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    label: editAddress?.label || 'Rumah',
    recipient_name: editAddress?.recipient_name || '',
    phone: editAddress?.phone || '',
    street: editAddress?.street || '',
    postal_code: editAddress?.postal_code || '',
    is_default: editAddress?.is_default || false,
  })
  // Lokasi (kota/provinsi) — dicari lewat API yang sama dipakai di halaman keranjang
  const [locationLabel, setLocationLabel] = useState(
    editAddress ? `${editAddress.city}, ${editAddress.province}` : ''
  )
  const [locationData, setLocationData] = useState<{
    city: string; province: string; province_id: string
  } | null>(editAddress ? {
    city: editAddress.city, province: editAddress.province, province_id: editAddress.province_id,
  } : null)
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLocationSearch(value: string) {
    setLocationLabel(value)
    setLocationData(null)
    setLocationOptions([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 3) return
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/ongkir/cities?search=${encodeURIComponent(value)}`)
        const data = await res.json()
        setLocationOptions(data.results || [])
      } catch {
        toast.error('Gagal mencari lokasi')
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  function selectLocation(opt: LocationOption) {
    setLocationLabel(opt.label)
    setLocationData({ city: opt.city_name, province: opt.province_name, province_id: opt.id })
    setLocationOptions([])
    if (!form.postal_code && opt.postal_code) {
      setForm(f => ({ ...f, postal_code: opt.postal_code }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.recipient_name || !form.phone || !form.street || !form.postal_code) {
      toast.error('Lengkapi semua data alamat')
      return
    }
    if (!locationData) {
      toast.error('Pilih kota/kecamatan tujuan dari hasil pencarian')
      return
    }

    setLoading(true)
    try {
      const payload = {
        user_id: userId,
        label: form.label || 'Rumah',
        recipient_name: form.recipient_name,
        phone: form.phone,
        street: form.street,
        city: locationData.city,
        province: locationData.province,
        province_id: locationData.province_id,
        postal_code: form.postal_code,
        is_default: form.is_default,
      }

      // Kalau alamat ini dijadikan default, lepas status default dari alamat lain dulu
      if (form.is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
      }

      const { error } = editAddress
        ? await supabase.from('addresses').update(payload).eq('id', editAddress.id)
        : await supabase.from('addresses').insert(payload)

      if (error) throw error
      toast.success(editAddress ? 'Alamat diperbarui' : 'Alamat disimpan')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan alamat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Label Alamat</label>
        <input
          type="text"
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          placeholder="Rumah, Kantor, dll"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]"
        />
      </div>

      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Nama Penerima</label>
        <input
          type="text"
          value={form.recipient_name}
          onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))}
          placeholder="Nama lengkap penerima"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]"
        />
      </div>

      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">No. HP</label>
        <input
          type="text"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="08xxxxxxxxxx"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]"
        />
      </div>

      <div className="relative">
        <label className="text-[11px] text-gray-500 mb-1 block">Kota / Kecamatan Tujuan</label>
        <input
          type="text"
          value={locationLabel}
          onChange={e => handleLocationSearch(e.target.value)}
          placeholder="Ketik nama kecamatan/kota, min. 3 huruf"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]"
        />
        {searching && <div className="text-[11px] text-gray-400 mt-1">Mencari lokasi...</div>}
        {locationOptions.length > 0 && (
          <div className="border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto bg-white shadow-sm relative z-10">
            {locationOptions.map(opt => (
              <div
                key={opt.id}
                onClick={() => selectLocation(opt)}
                className="px-3 py-2 text-[11px] text-gray-700 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-[#e8f0e9]"
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
        {locationData && (
          <div className="text-[10px] text-[#4a6650] mt-1">✓ {locationData.city}, {locationData.province}</div>
        )}
      </div>

      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Alamat Lengkap</label>
        <textarea
          value={form.street}
          onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
          placeholder="Nama jalan, no. rumah, RT/RW"
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] resize-none"
        />
      </div>

      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Kode Pos</label>
        <input
          type="text"
          value={form.postal_code}
          onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
          placeholder="12345"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]"
        />
      </div>

      <label className="flex items-center gap-2 text-[12px] text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
        />
        Jadikan alamat utama
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl font-semibold text-[12px]"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#4a6650] text-white py-2.5 rounded-xl font-semibold text-[12px] disabled:opacity-60"
        >
          {loading ? 'Menyimpan...' : 'Simpan Alamat'}
        </button>
      </div>
    </form>
  )
}

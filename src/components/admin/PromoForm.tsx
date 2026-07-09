// =============================================
// src/components/admin/PromoForm.tsx
// Form tambah/edit kode promo
// =============================================
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Props = { editPromo?: any; onSuccess: () => void }

export function PromoForm({ editPromo, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: editPromo?.code || '',
    description: editPromo?.description || '',
    discount_type: editPromo?.discount_type || 'percentage',
    discount_value: editPromo?.discount_value || '',
    min_purchase: editPromo?.min_purchase || 0,
    max_discount: editPromo?.max_discount || '',
    start_date: editPromo?.start_date?.slice(0, 10) || '',
    end_date: editPromo?.end_date?.slice(0, 10) || '',
    usage_limit: editPromo?.usage_limit ?? '',
    is_active: editPromo?.is_active ?? true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code || !form.start_date || !form.end_date) {
      toast.error('Kode, tanggal mulai, dan tanggal selesai wajib diisi')
      return
    }
    if (form.discount_type !== 'free_shipping' && !form.discount_value) {
      toast.error('Isi nilai potongan')
      return
    }

    setLoading(true)
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: form.discount_type === 'free_shipping' ? 0 : parseFloat(form.discount_value.toString()),
        min_purchase: parseFloat(form.min_purchase.toString()) || 0,
        max_discount: form.max_discount ? parseFloat(form.max_discount.toString()) : null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date + 'T23:59:59').toISOString(),
        usage_limit: form.usage_limit === '' ? null : parseInt(form.usage_limit.toString()),
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }

      const { error } = editPromo
        ? await supabase.from('promotions').update(payload).eq('id', editPromo.id)
        : await supabase.from('promotions').insert(payload)

      if (error) throw error
      toast.success(editPromo ? 'Promo diperbarui!' : 'Promo dibuat!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message?.includes('duplicate') ? 'Kode promo sudah dipakai' : (err.message || 'Terjadi kesalahan'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Kode Promo *</label>
        <input
          type="text"
          value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="LELANG77"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white font-mono"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Keterangan (opsional)</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Promo Mid Year Sale 7.7"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Jenis Potongan *</label>
        <select
          value={form.discount_type}
          onChange={e => setForm({ ...form, discount_type: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
        >
          <option value="percentage">Persen (%)</option>
          <option value="fixed">Nominal Tetap (Rp)</option>
          <option value="free_shipping">Gratis Ongkir</option>
        </select>
      </div>

      {form.discount_type !== 'free_shipping' && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Nilai Potongan * {form.discount_type === 'percentage' ? '(%)' : '(Rp)'}
          </label>
          <input
            type="number"
            value={form.discount_value}
            onChange={e => setForm({ ...form, discount_value: e.target.value })}
            placeholder={form.discount_type === 'percentage' ? '20' : '50000'}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
            required
          />
        </div>
      )}

      {form.discount_type === 'percentage' && (
        <div>
          <label className="block text-sm font-medium mb-1">Maks. Potongan (Rp, opsional)</label>
          <input
            type="number"
            value={form.max_discount}
            onChange={e => setForm({ ...form, max_discount: e.target.value })}
            placeholder="Kosongkan = tanpa batas"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Minimal Pembelian (Rp)</label>
        <input
          type="number"
          value={form.min_purchase}
          onChange={e => setForm({ ...form, min_purchase: e.target.value })}
          placeholder="0 = tanpa minimal"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Mulai *</label>
          <input
            type="date"
            value={form.start_date}
            onChange={e => setForm({ ...form, start_date: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Selesai *</label>
          <input
            type="date"
            value={form.end_date}
            onChange={e => setForm({ ...form, end_date: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kuota Pemakaian (opsional)</label>
        <input
          type="number"
          value={form.usage_limit}
          onChange={e => setForm({ ...form, usage_limit: e.target.value })}
          placeholder="Kosongkan = tanpa batas"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
        Aktifkan promo ini
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-60"
      >
        {loading ? 'Menyimpan...' : (editPromo ? 'Simpan Perubahan' : 'Buat Promo')}
      </button>
    </form>
  )
}

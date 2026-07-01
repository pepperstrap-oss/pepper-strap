// =============================================
// src/components/admin/ProductForm.tsx
// Form tambah/edit produk di panel admin
// =============================================

'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadProductImage } from '@/lib/uploadImage'
import toast from 'react-hot-toast'

type Props = {
  categories: { id: string; name: string }[]
  onSuccess: () => void
  editProduct?: any
}

export function ProductForm({ categories, onSuccess, editProduct }: Props) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(editProduct?.image_url || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: editProduct?.name || '',
    slug: editProduct?.slug || '',
    description: editProduct?.description || '',
    price: editProduct?.price || '',
    original_price: editProduct?.original_price || '',
    stock: editProduct?.stock || 10,
    weight_gram: editProduct?.weight_gram || 120,
    category_id: editProduct?.category_id || categories[0]?.id || '',
    sizes: editProduct?.sizes?.join(',') || '18mm,20mm,22mm',
    is_new: editProduct?.is_new || false,
    is_active: editProduct?.is_active ?? true,
  })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function generateSlug(name: string) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Nama dan harga wajib diisi')
      return
    }

    setLoading(true)
    try {
      let imageUrl = editProduct?.image_url || null

      // Upload foto jika ada
      if (imageFile) {
        const slug = form.slug || generateSlug(form.name)
        imageUrl = await uploadProductImage(imageFile, slug)
        if (!imageUrl) throw new Error('Gagal upload foto')
      }

      const productData = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        price: parseInt(form.price.toString()),
        original_price: parseInt(form.original_price.toString()) || 0,
        stock: parseInt(form.stock.toString()),
        weight_gram: parseInt(form.weight_gram.toString()),
        category_id: form.category_id,
        sizes: form.sizes.split(',').map((s: string) => s.trim()),
        is_new: form.is_new,
        is_active: form.is_active,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }

      let error
      if (editProduct) {
        // Update produk
        const result = await supabase.from('products').update(productData).eq('id', editProduct.id)
        error = result.error
      } else {
        // Tambah produk baru
        const result = await supabase.from('products').insert(productData)
        error = result.error
      }

      if (error) throw error

      toast.success(editProduct ? 'Produk diperbarui!' : 'Produk berhasil ditambahkan!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upload Foto */}
      <div>
        <label className="block text-sm font-medium mb-1">Foto Produk</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          ) : (
            <>
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-gray-500">Ketuk untuk upload foto produk</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (maks 5MB)</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        {imagePreview && (
          <button
            type="button"
            onClick={() => { setImagePreview(''); setImageFile(null) }}
            className="mt-1 text-xs text-red-500"
          >
            Hapus foto
          </button>
        )}
      </div>

      {/* Nama */}
      <div>
        <label className="block text-sm font-medium mb-1">Nama Produk *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
          placeholder="Classic Brown Leather"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium mb-1">Deskripsi</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Deskripsi produk..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
        />
      </div>

      {/* Harga */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Harga Jual *</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            placeholder="249000"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Harga Coret</label>
          <input
            type="number"
            value={form.original_price}
            onChange={e => setForm({ ...form, original_price: e.target.value })}
            placeholder="0 = tidak ada"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Stok & Berat */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Stok</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Berat (gram)</label>
          <input
            type="number"
            value={form.weight_gram}
            onChange={e => setForm({ ...form, weight_gram: parseInt(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium mb-1">Kategori</label>
        <select
          value={form.category_id}
          onChange={e => setForm({ ...form, category_id: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Ukuran */}
      <div>
        <label className="block text-sm font-medium mb-1">Ukuran (pisahkan dengan koma)</label>
        <input
          type="text"
          value={form.sizes}
          onChange={e => setForm({ ...form, sizes: e.target.value })}
          placeholder="18mm,20mm,22mm,24mm"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Toggle */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_new}
            onChange={e => setForm({ ...form, is_new: e.target.checked })}
          />
          Badge &quot;Baru&quot;
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={e => setForm({ ...form, is_active: e.target.checked })}
          />
          Aktif (tampil di toko)
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-60"
      >
        {loading ? 'Menyimpan...' : (editProduct ? 'Simpan Perubahan' : 'Tambah Produk')}
      </button>
    </form>
  )
}

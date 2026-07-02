// =============================================
// src/components/admin/ProductForm.tsx
// Form tambah/edit produk di panel admin
// =============================================

'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadProductImages, deleteProductImage } from '@/lib/uploadImage'
import toast from 'react-hot-toast'

type Props = {
  categories: { id: string; name: string }[]
  onSuccess: () => void
  editProduct?: any
}

const MIN_PHOTOS = 1
const MAX_PHOTOS = 8

// Foto yang sudah tersimpan di database (URL string) digabung dengan
// foto baru yang baru dipilih user (File, belum diupload) dalam satu list
// supaya urutan tampil di form sama persis dengan urutan disimpan.
type GalleryItem = { url: string; file?: File }

export function ProductForm({ categories, onSuccess, editProduct }: Props) {
  const [loading, setLoading] = useState(false)

  const initialGallery: GalleryItem[] = (() => {
    if (editProduct?.images?.length) return editProduct.images.map((url: string) => ({ url }))
    if (editProduct?.image_url) return [{ url: editProduct.image_url }]
    return []
  })()
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery)
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
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = MAX_PHOTOS - gallery.length
    if (remainingSlots <= 0) {
      toast.error(`Maksimal ${MAX_PHOTOS} foto per produk`)
      e.target.value = ''
      return
    }
    const accepted = files.slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      toast.error(`Hanya ${remainingSlots} foto ditambahkan (maksimal ${MAX_PHOTOS} total)`)
    }

    const newItems: GalleryItem[] = accepted.map(file => ({ url: URL.createObjectURL(file), file }))
    setGallery(prev => [...prev, ...newItems])
    e.target.value = '' // supaya bisa pilih file yang sama lagi kalau perlu
  }

  async function removeImage(index: number) {
    const item = gallery[index]
    setGallery(prev => prev.filter((_, i) => i !== index))
    // Kalau foto ini sudah tersimpan di storage (bukan file baru), hapus dari storage juga
    if (!item.file) {
      deleteProductImage(item.url).catch(() => {})
    }
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
    if (gallery.length < MIN_PHOTOS) {
      toast.error('Tambahkan minimal 1 foto produk')
      return
    }

    setLoading(true)
    try {
      const slug = form.slug || generateSlug(form.name)

      // Upload semua foto baru (yang masih berupa File), sambil tetap
      // mempertahankan urutan tampil di form
      const newFiles = gallery.filter(g => g.file).map(g => g.file!) as File[]
      const uploadedUrls = newFiles.length ? await uploadProductImages(newFiles, slug) : []
      if (newFiles.length && uploadedUrls.length !== newFiles.length) {
        throw new Error('Sebagian foto gagal diupload, coba lagi')
      }

      let uploadIdx = 0
      const finalImages = gallery.map(g => (g.file ? uploadedUrls[uploadIdx++] : g.url))

      const productData = {
        name: form.name,
        slug,
        description: form.description,
        price: parseInt(form.price.toString()),
        original_price: parseInt(form.original_price.toString()) || 0,
        stock: parseInt(form.stock.toString()),
        weight_gram: parseInt(form.weight_gram.toString()),
        category_id: form.category_id,
        sizes: form.sizes.split(',').map((s: string) => s.trim()),
        is_new: form.is_new,
        is_active: form.is_active,
        images: finalImages,
        image_url: finalImages[0], // foto pertama tetap dipakai sbg thumbnail/cover
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
      {/* Upload Foto (galeri 1-8 foto) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium">Foto Produk *</label>
          <span className="text-xs text-gray-400">{gallery.length}/{MAX_PHOTOS} foto</span>
        </div>
        <p className="text-xs text-gray-400 mb-2">
          Tambahkan 3-8 foto (min. {MIN_PHOTOS}) agar pembeli bisa lihat detail strap dari berbagai sisi. Foto pertama jadi foto sampul.
        </p>

        <div className="grid grid-cols-4 gap-2 mb-2">
          {gallery.map((item, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              <img src={item.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-0.5 left-0.5 bg-[#4a6650] text-white text-[8px] font-bold px-1 py-0.5 rounded">
                  SAMPUL
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white text-[10px] rounded-full flex items-center justify-center"
                aria-label="Hapus foto"
              >
                ✕
              </button>
            </div>
          ))}

          {gallery.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <span className="text-xl">📷</span>
              <span className="text-[10px] mt-0.5">Tambah</span>
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
        <p className="text-xs text-gray-400">JPG, PNG, WEBP (maks 5MB per foto). Ketuk foto pertama jadi sampul — hapus lalu unggah ulang untuk mengubah urutan.</p>
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

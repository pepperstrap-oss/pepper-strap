// =============================================
// src/app/admin/kategori/page.tsx
// Halaman Admin: Kelola Kategori Produk + Cover
// =============================================
'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadProductImage } from '@/lib/uploadImage'
import toast from 'react-hot-toast'

type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
  sort_order: number
}

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', sort_order: 0 })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  }

  function openForm(cat?: Category) {
    if (cat) {
      setEditCat(cat)
      setForm({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order })
      setImagePreview(cat.image_url || '')
    } else {
      setEditCat(null)
      setForm({ name: '', slug: '', sort_order: categories.length })
      setImagePreview('')
    }
    setImageFile(null)
    setShowForm(true)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast.error('Nama kategori wajib diisi'); return }
    setSaving(true)
    try {
      let imageUrl = editCat?.image_url || null
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile, `category-${form.slug || generateSlug(form.name)}`)
        if (!imageUrl) throw new Error('Gagal upload foto')
      }

      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        image_url: imageUrl,
        sort_order: form.sort_order,
        updated_at: new Date().toISOString(),
      }

      if (editCat) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editCat.id)
        if (error) throw error
        toast.success('Kategori diperbarui!')
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
        toast.success('Kategori ditambahkan!')
      }

      setShowForm(false)
      setEditCat(null)
      load()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan')
    }
    setSaving(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"? Produk dalam kategori ini tidak akan ikut terhapus.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast.error('Gagal menghapus'); return }
    toast.success('Kategori dihapus')
    load()
  }

  return (
    <div className="p-3.5 pb-24">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-gray-800">Kelola Kategori</div>
        <button onClick={() => openForm()}
          className="bg-[#4a6650] text-white text-[12px] px-3 py-1.5 rounded-lg font-semibold">
          + Tambah
        </button>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3 space-y-2.5">
          <div className="flex justify-between items-center mb-1">
            <div className="text-[13px] font-bold text-gray-800">{editCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}</div>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
          </div>

          {/* Upload foto cover */}
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Foto Cover Kategori</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#4a6650] hover:bg-[#e8f0e9] transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
              ) : (
                <>
                  <div className="text-2xl mb-1">🖼️</div>
                  <p className="text-[11px] text-gray-500">Ketuk untuk upload foto cover</p>
                  <p className="text-[10px] text-gray-400">Rasio 1:1 atau landscape (JPG/PNG/WEBP)</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview && (
              <button type="button" onClick={() => { setImagePreview(''); setImageFile(null) }}
                className="mt-1 text-[11px] text-red-500">Hapus foto</button>
            )}
          </div>

          {/* Nama */}
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Nama Kategori *</label>
            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))}
              placeholder="Crocodile Leather"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650] text-gray-800 bg-white"
              required />
          </div>

          {/* Urutan */}
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Urutan Tampil</label>
            <input type="number" value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-800 bg-white" />
            <p className="text-[10px] text-gray-400 mt-0.5">Angka kecil = tampil lebih awal</p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-[#4a6650] text-white py-2.5 rounded-lg font-semibold text-[13px] disabled:opacity-60">
            {saving ? 'Menyimpan...' : (editCat ? 'Simpan Perubahan' : 'Tambah Kategori')}
          </button>
        </form>
      )}

      {/* Daftar kategori */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-3xl mb-2">📂</div>
          <div className="text-sm">Belum ada kategori</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 items-center">
              {/* Foto cover */}
              <div className="w-14 h-14 bg-[#e8f0e9] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                {cat.image_url
                  ? <img src={cat.image_url} className="w-full h-full object-cover" alt={cat.name} />
                  : <span className="text-2xl">📂</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-800">{cat.name}</div>
                <div className="text-[10px] text-gray-400">/{cat.slug} · Urutan #{cat.sort_order}</div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => openForm(cat)}
                  className="text-[10px] border border-[#4a6650] text-[#4a6650] px-2 py-1 rounded-lg">Edit</button>
                <button onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-[10px] border border-red-200 text-red-500 px-2 py-1 rounded-lg">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

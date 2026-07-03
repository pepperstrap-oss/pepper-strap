// =============================================
// src/app/admin/produk/page.tsx — Kelola Produk
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductForm } from '@/components/admin/ProductForm'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  async function load() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setProducts(p || [])
    setCategories(c || [])
  }

  useEffect(() => { load() }, [])

  async function deleteProduct(id: string) {
    if (!confirm('Hapus produk ini?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Produk dihapus')
    load()
  }

  async function toggleActive(id: string, isActive: boolean) {
    await supabase.from('products').update({ is_active: !isActive }).eq('id', id)
    load()
  }

  return (
    <div className="p-3.5 pb-24">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-gray-800">Kelola Produk</div>
        <button onClick={() => { setEditProduct(null); setShowForm(true) }}
          className="bg-[#4a6650] text-white text-[12px] px-3 py-1.5 rounded-lg font-semibold">
          + Tambah
        </button>
      </div>

      {(showForm || editProduct) && (
        <div className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[13px] font-bold text-gray-800">{editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</div>
            <button onClick={() => { setShowForm(false); setEditProduct(null) }} className="text-gray-400 text-lg">✕</button>
          </div>
          <ProductForm
            categories={categories}
            editProduct={editProduct}
            onSuccess={() => { setShowForm(false); setEditProduct(null); load() }}
          />
        </div>
      )}

      <div className="space-y-2.5">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3">
            <div className="w-14 h-14 bg-[#e8f0e9] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {p.image_url
                ? <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} />
                : <span className="text-2xl">📦</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="text-[12px] font-semibold text-gray-800 truncate">{p.name}</div>
                {!p.is_active && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">Nonaktif</span>}
              </div>
              <div className="text-[11px] text-gray-400 mb-1">{p.categories?.name} · Stok: {p.stock}</div>
              <div className="text-[12px] font-bold text-[#4a6650]">{fmt(p.price)}</div>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => { setEditProduct(p); setShowForm(false) }}
                className="text-[10px] border border-[#4a6650] text-[#4a6650] px-2 py-1 rounded-lg">Edit</button>
              <button onClick={() => toggleActive(p.id, p.is_active)}
                className="text-[10px] border border-gray-200 text-gray-500 px-2 py-1 rounded-lg">{p.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
              <button onClick={() => deleteProduct(p.id)}
                className="text-[10px] border border-red-200 text-red-500 px-2 py-1 rounded-lg">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

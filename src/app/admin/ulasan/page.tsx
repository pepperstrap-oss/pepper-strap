// =============================================
// src/app/admin/ulasan/page.tsx — Moderasi Ulasan
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Tab = 'pending' | 'approved' | 'rejected' | 'all'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<Tab>('pending')
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadReviews() {
    setLoading(true)
    let query = supabase
      .from('reviews')
      .select('*, products(name, image_url)')
      .order('created_at', { ascending: false })
    if (tab !== 'all') query = query.eq('status', tab)

    const { data } = await query
    let results = data || []

    if (results.length) {
      const ids = [...new Set(results.map((r: any) => r.user_id))]
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids)
      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]))
      results = results.map((r: any) => ({ ...r, reviewer_name: nameMap[r.user_id] || 'Pembeli' }))
    }

    setReviews(results)
    setLoading(false)
  }

  useEffect(() => { loadReviews() }, [tab])

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('reviews').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.error('Gagal memperbarui ulasan'); return }
    toast.success(status === 'approved' ? 'Ulasan disetujui' : 'Ulasan ditolak')
    loadReviews()
  }

  async function deleteReview(id: string) {
    if (!confirm('Hapus ulasan ini secara permanen?')) return
    await supabase.from('reviews').delete().eq('id', id)
    toast.success('Ulasan dihapus')
    loadReviews()
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Menunggu' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'rejected', label: 'Ditolak' },
    { key: 'all', label: 'Semua' },
  ]

  return (
    <div className="p-3.5 pb-24">
      <div className="text-[15px] font-bold text-gray-800 mb-3">Ulasan Pembeli</div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${
              tab === t.key ? 'bg-[#4a6650] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Memuat...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Tidak ada ulasan di kategori ini</div>
      ) : reviews.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-gray-100 mb-3 p-3.5">
          <div className="flex gap-2.5 mb-2">
            <div className="w-10 h-10 bg-[#e8f0e9] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {r.products?.image_url
                ? <img src={r.products.image_url} className="w-full h-full object-cover" alt={r.products?.name} />
                : <span>📦</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-gray-800 truncate">{r.products?.name || 'Produk dihapus'}</div>
              <div className="text-[10px] text-gray-400">oleh {r.reviewer_name} · {fmtDate(r.created_at)}</div>
            </div>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full h-fit ${
              r.status === 'approved' ? 'bg-green-100 text-green-700' :
              r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {r.status === 'approved' ? 'Disetujui' : r.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
            </span>
          </div>

          <Stars rating={r.rating} />
          {r.comment && <p className="text-[12px] text-gray-600 mt-1.5">{r.comment}</p>}

          {r.photos?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {r.photos.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 block">
                  <img src={url} className="w-full h-full object-cover" alt={`Foto ${i + 1}`} />
                </a>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {r.status !== 'approved' && (
              <button onClick={() => updateStatus(r.id, 'approved')} className="flex-1 bg-green-600 text-white text-[11px] font-semibold py-1.5 rounded-lg">
                ✓ Setujui
              </button>
            )}
            {r.status !== 'rejected' && (
              <button onClick={() => updateStatus(r.id, 'rejected')} className="flex-1 bg-gray-100 text-gray-600 text-[11px] font-semibold py-1.5 rounded-lg">
                Tolak
              </button>
            )}
            <button onClick={() => deleteReview(r.id)} className="px-3 bg-red-50 text-red-500 text-[11px] font-semibold py-1.5 rounded-lg">
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

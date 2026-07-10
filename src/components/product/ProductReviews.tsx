// =============================================
// src/components/product/ProductReviews.tsx
// Ringkasan rating + daftar ulasan + form kirim ulasan (kalau memenuhi syarat)
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ReviewForm } from './ReviewForm'

type Review = {
  id: string
  rating: number
  comment: string | null
  photos: string[]
  created_at: string
  user_id: string
  reviewer_name?: string
}

function Stars({ rating, size = 'text-sm' }: { rating: number; size?: string }) {
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

export function ProductReviews({ productId, productSlug }: { productId: string; productSlug: string }) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // Status kelayakan user untuk kasih ulasan
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null)
  const [ownReview, setOwnReview] = useState<{ status: string } | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function loadReviews() {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comment, photos, created_at, user_id')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    let results: Review[] = data || []

    // Ambil nama pembeli secara terpisah (reviews.user_id tidak berelasi langsung ke profiles)
    if (results.length) {
      const ids = [...new Set(results.map(r => r.user_id))]
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids)
      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]))
      results = results.map(r => ({ ...r, reviewer_name: nameMap[r.user_id] || 'Pembeli' }))
    }

    setReviews(results)
    setLoading(false)
  }

  async function checkEligibility() {
    if (!user) return
    setCheckingEligibility(true)
    try {
      // Cek apakah sudah pernah kasih ulasan untuk produk ini
      const { data: existing } = await supabase
        .from('reviews')
        .select('status')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        setOwnReview(existing)
        setCheckingEligibility(false)
        return
      }

      // Cek apakah pernah beli produk ini dengan pesanan yang sudah dibayar
      const { data: purchases } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(id, status, user_id)')
        .eq('product_id', productId)
        .eq('orders.user_id', user.id)

      const valid = (purchases || []).find((p: any) => !['pending', 'cancelled'].includes(p.orders.status))
      if (valid) setEligibleOrderId(valid.order_id)
    } catch {
      // diamkan — kalau gagal cek, form kirim ulasan cukup tidak ditampilkan
    }
    setCheckingEligibility(false)
  }

  useEffect(() => { loadReviews() }, [productId])
  useEffect(() => { checkEligibility() }, [productId, user])

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="border-t border-gray-100 pt-4 mt-2">
      <h2 className="text-[14px] font-bold text-gray-800 mb-3">Ulasan Pembeli</h2>

      {/* Ringkasan rating */}
      {!loading && reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-[#f7f5f0] rounded-xl p-3.5">
          <div className="text-[24px] font-bold text-gray-800">{avgRating.toFixed(1)}</div>
          <div>
            <Stars rating={avgRating} />
            <div className="text-[11px] text-gray-500 mt-0.5">{reviews.length} ulasan</div>
          </div>
        </div>
      )}

      {/* CTA kirim ulasan — hanya kalau memenuhi syarat */}
      {!checkingEligibility && eligibleOrderId && !ownReview && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-[#4a6650] text-[#4a6650] py-2.5 rounded-lg font-semibold text-[13px] mb-4"
        >
          ✍️ Tulis Ulasan
        </button>
      )}

      {showForm && user && (
        <div className="mb-4">
          <ReviewForm
            productId={productId}
            productSlug={productSlug}
            userId={user.id}
            orderId={eligibleOrderId}
            onSuccess={() => { setShowForm(false); setOwnReview({ status: 'pending' }); loadReviews() }}
          />
        </div>
      )}

      {ownReview && (
        <div className="bg-[#e8f0e9] rounded-lg p-3 text-[12px] text-[#4a6650] mb-4">
          {ownReview.status === 'approved'
            ? '✅ Ulasan Anda sudah tayang. Terima kasih!'
            : ownReview.status === 'pending'
            ? '⏳ Ulasan Anda sedang menunggu persetujuan admin.'
            : 'Ulasan Anda belum bisa ditampilkan.'}
        </div>
      )}

      {/* Daftar ulasan */}
      {loading ? (
        <div className="text-center py-6 text-gray-400 text-[12px]">Memuat ulasan...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-[12px]">Belum ada ulasan untuk produk ini.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-gray-800">{r.reviewer_name}</span>
                <span className="text-[10px] text-gray-400">{fmtDate(r.created_at)}</span>
              </div>
              <Stars rating={r.rating} size="text-xs" />
              {r.comment && <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>}
              {r.photos?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.photos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 block">
                      <img src={url} alt={`Foto ulasan ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

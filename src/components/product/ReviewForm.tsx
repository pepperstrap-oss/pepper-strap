// =============================================
// src/components/product/ReviewForm.tsx
// Form kirim ulasan produk (hanya untuk pembeli terverifikasi)
// =============================================
'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadReviewImages } from '@/lib/uploadImage'
import toast from 'react-hot-toast'

const MAX_PHOTOS = 3

export function ReviewForm({
  productId,
  productSlug,
  userId,
  orderId,
  onSuccess,
}: {
  productId: string
  productSlug: string
  userId: string
  orderId: string | null
  onSuccess: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<{ url: string; file: File }[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      toast.error(`Maksimal ${MAX_PHOTOS} foto`)
      e.target.value = ''
      return
    }
    const accepted = files.slice(0, remaining)
    setPhotos(prev => [...prev, ...accepted.map(file => ({ url: URL.createObjectURL(file), file }))])
    e.target.value = ''
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('Pilih rating bintang dulu'); return }

    setLoading(true)
    try {
      const photoUrls = photos.length ? await uploadReviewImages(photos.map(p => p.file), productSlug) : []

      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: userId,
        order_id: orderId,
        rating,
        comment: comment.trim() || null,
        photos: photoUrls,
        status: 'pending',
      })

      if (error) throw error
      toast.success('Ulasan terkirim! Menunggu persetujuan admin.')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message?.includes('duplicate') ? 'Anda sudah pernah memberi ulasan untuk produk ini' : 'Gagal mengirim ulasan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#f7f5f0] rounded-xl p-3.5 space-y-3">
      <div className="text-[12px] font-semibold text-gray-800">Tulis Ulasan Anda</div>

      {/* Rating bintang */}
      <div>
        <div className="text-[11px] text-gray-500 mb-1">Rating</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl leading-none"
            >
              <span className={i <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            </button>
          ))}
        </div>
      </div>

      {/* Komentar */}
      <div>
        <div className="text-[11px] text-gray-500 mb-1">Komentar (opsional)</div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Ceritakan pengalaman Anda dengan produk ini..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-800 bg-white resize-none outline-none focus:border-[#4a6650]"
        />
      </div>

      {/* Foto */}
      <div>
        <div className="text-[11px] text-gray-500 mb-1">Foto (opsional, maks {MAX_PHOTOS})</div>
        <div className="flex gap-2">
          {photos.map((p, idx) => (
            <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
              <img src={p.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white text-[9px] rounded-full flex items-center justify-center"
              >✕</button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-lg"
            >📷</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#4a6650] text-white py-2.5 rounded-lg font-semibold text-[13px] disabled:opacity-60"
      >
        {loading ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  )
}

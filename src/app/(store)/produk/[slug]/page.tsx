// =============================================
// src/app/(store)/produk/[slug]/page.tsx
// Halaman Detail Produk
// =============================================
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'

export const revalidate = 0

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name,slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white pb-24">
      <ProductDetailClient product={product} />
    </div>
  )
}

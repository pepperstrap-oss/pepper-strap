// =============================================
// src/app/(store)/produk/page.tsx
// Halaman Daftar Produk
// =============================================
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { ProductListClient } from '@/components/product/ProductListClient'

async function getProducts() {
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, categories(name,slug)').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order'),
  ])
  return { products: products || [], categories: categories || [] }
}

export const revalidate = 0

export default async function ProductsPage() {
  const { products, categories } = await getProducts()
  return (
    <MobileLayout>
      <Suspense fallback={null}>
        <ProductListClient products={products} categories={categories} />
      </Suspense>
    </MobileLayout>
  )
}

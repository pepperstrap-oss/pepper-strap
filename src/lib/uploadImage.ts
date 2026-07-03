// =============================================
// src/lib/uploadImage.ts
// Upload foto produk ke Supabase Storage
// =============================================

import { supabase } from './supabase'

export async function uploadProductImage(file: File, productSlug: string): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const fileName = `${productSlug}-${Date.now()}.${ext}`
  const filePath = `products/${fileName}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  // Ambil public URL
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  // Ekstrak path dari URL
  const path = imageUrl.split('/product-images/')[1]
  if (!path) return

  await supabase.storage.from('product-images').remove([path])
}

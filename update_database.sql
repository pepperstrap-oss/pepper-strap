-- =============================================
-- UPDATE DATABASE: Fitur Banner, Kategori & Lacak Pesanan
-- Jalankan di Supabase → SQL Editor → New Query
-- =============================================

-- 1. Pastikan tabel site_settings sudah ada kolom yang benar
-- (Sudah ada dari schema awal, tidak perlu diubah)

-- 2. Update storage bucket: izinkan upload foto untuk kategori dan banner
-- (Bucket 'product-images' sudah ada, kita pakai folder berbeda di dalamnya)
-- Folder: product-images/categories/ → foto cover kategori
-- Folder: product-images/hero/ → foto background hero
-- Folder: product-images/banners/ → foto promo banner
-- Tidak perlu SQL tambahan karena sudah pakai bucket yang sama

-- 3. Pastikan RLS policy untuk orders sudah mengizinkan lacak pesanan
-- (Sudah ada dari update sebelumnya: "Anyone can view order by order_number")
-- Kalau belum ada, jalankan ini:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' 
    AND policyname = 'Anyone can view order by order_number'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view order by order_number" ON orders FOR SELECT USING (true)';
  END IF;
END;
$$;

-- 4. Pastikan order_items juga bisa dibaca untuk lacak pesanan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' 
    AND policyname = 'Anyone can view order items by order'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view order items by order" ON order_items FOR SELECT USING (true)';
  END IF;
END;
$$;

-- 5. Pastikan kolom guest_email ada untuk verifikasi lacak pesanan tamu
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Selesai! Tidak ada perubahan struktur tabel lain yang diperlukan.
SELECT 'Update berhasil! Fitur banner, kategori, dan lacak pesanan siap digunakan.' AS status;

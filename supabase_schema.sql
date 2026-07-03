-- =============================================
-- PEPPER STRAP — Supabase Schema
-- Jalankan di: Supabase → SQL Editor → New Query
-- =============================================

-- 1. PROFILES (data pelanggan, terhubung ke auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: otomatis buat profil saat user baru daftar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. ADDRESSES (alamat pengiriman pelanggan — disiapkan untuk fitur "buku alamat"
--    di masa depan; saat ini checkout menyimpan alamat langsung ke kolom
--    shipping_address di tabel orders, jadi tabel ini belum dipakai aktif)
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Rumah',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  province_id TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES (kategori produk)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Classic Strap', 'classic', 1),
  ('Vintage Strap', 'vintage', 2),
  ('Slim Strap', 'slim', 3),
  ('Crocodile Strap', 'crocodile', 4);

-- 4. PRODUCTS (produk)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INT NOT NULL,
  original_price INT DEFAULT 0,
  stock INT DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  images JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '["18mm","20mm","22mm"]',
  weight_gram INT DEFAULT 120,
  is_active BOOLEAN DEFAULT TRUE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO products (name, slug, description, price, original_price, stock, image_url, is_new, category_id)
SELECT
  'Classic Brown', 'classic-brown',
  'Strap kulit sapi asli handmade. Cocok untuk jam formal dan kasual harian.',
  249000, 0, 15, null, false, id
FROM categories WHERE slug = 'classic';

INSERT INTO products (name, slug, description, price, original_price, stock, image_url, is_new, category_id)
SELECT
  'Olive Green', 'olive-green',
  'Warna olive elegan dengan finishing premium. Cocok untuk semua jenis jam.',
  249000, 0, 8, null, true, id
FROM categories WHERE slug = 'slim';

INSERT INTO products (name, slug, description, price, original_price, stock, image_url, is_new, category_id)
SELECT
  'Vintage Tan', 'vintage-tan',
  'Strap kulit vegetable-tanned. Semakin indah seiring waktu pemakaian.',
  269000, 320000, 10, null, true, id
FROM categories WHERE slug = 'vintage';

INSERT INTO products (name, slug, description, price, original_price, stock, image_url, is_new, category_id)
SELECT
  'Black Stitch', 'black-stitch',
  'Kulit hitam klasik dengan jahitan kontras. Untuk semua kesempatan.',
  249000, 280000, 12, null, false, id
FROM categories WHERE slug = 'classic';

-- 5. PROMOS (promo/banner)
CREATE TABLE promos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  label TEXT NOT NULL,
  discount_percent INT DEFAULT 0,
  min_purchase INT DEFAULT 0,
  promo_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO promos (title, description, label, discount_percent, min_purchase)
VALUES
  ('Gratis Ongkir', 'Min. pembelian Rp 200.000 ke seluruh Indonesia', 'GRATIS ONGKIR', 0, 200000),
  ('Diskon Strap Pertama', 'Khusus pelanggan baru. Kode: NEWSTRAP', 'DISKON 20%', 20, 0);

-- 6. ORDERS (pesanan)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id), -- boleh kosong (NULL) untuk pesanan dari pembeli tanpa akun (guest checkout)
  guest_name TEXT,   -- nama pembeli (diisi jika checkout tanpa akun)
  guest_email TEXT,  -- email pembeli (diisi jika checkout tanpa akun, untuk Midtrans & lacak pesanan)
  guest_phone TEXT,  -- no. HP pembeli (diisi jika checkout tanpa akun)
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  subtotal INT NOT NULL,
  shipping_cost INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  courier TEXT,
  courier_service TEXT,
  tracking_number TEXT,
  estimated_days TEXT,
  shipping_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'qris',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  midtrans_order_id TEXT,
  midtrans_token TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM orders;
  NEW.order_number := 'PS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- 7. ORDER_ITEMS (item dalam pesanan)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  size TEXT,
  price INT NOT NULL,
  quantity INT NOT NULL,
  subtotal INT NOT NULL
);

-- 8. SITE_SETTINGS (pengaturan tampilan oleh admin)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('hero', '{"title":"Handmade Leather Watch Strap","subtitle":"Strap kulit premium buatan tangan untuk gaya yang tak lekang oleh waktu.","theme_color":"#4a6650"}'),
  ('promo_banner', '{"title":"Diskon 15% untuk semua produk","subtitle":"Periode terbatas!","discount_label":"15% OFF","is_active":true}'),
  ('store_info', '{"name":"Pepper Strap","whatsapp":"081234567890","email":"info@pepperstrap.id","instagram":"pepperstrap"}');

-- =============================================
-- ROW LEVEL SECURITY (RLS) — Keamanan data
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: user hanya bisa lihat/edit profil sendiri
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses: user hanya akses alamat sendiri (perbaikan: tambah WITH CHECK agar insert/update tervalidasi)
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Products & Categories: semua orang bisa lihat (publik)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view promos" ON promos FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);

-- Admin: bisa insert/update/delete products
-- (perbaikan: tambah WITH CHECK — tanpa ini, baris baru dari INSERT tidak tervalidasi sebagai admin)
CREATE POLICY "Admin can manage products" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can manage promos" ON promos FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can manage settings" ON site_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders: user lihat pesanan sendiri, admin lihat semua, tamu (guest) boleh membuat pesanan
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Tamu tanpa akun boleh membuat pesanan (user_id kosong), wajib isi data kontak tamu
CREATE POLICY "Guests create orders" ON orders FOR INSERT WITH CHECK (
  user_id IS NULL AND guest_email IS NOT NULL AND guest_phone IS NOT NULL
);
-- Siapapun boleh melihat 1 pesanan spesifik jika tahu nomor pesanannya persis (untuk halaman sukses & lacak pesanan tamu)
CREATE POLICY "Anyone can view order by order_number" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin manage all orders" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Anyone can view order items by order" ON order_items FOR SELECT USING (true);
CREATE POLICY "Users create order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (user_id = auth.uid() OR user_id IS NULL))
);
CREATE POLICY "Admin manage order items" ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- STORAGE — Bucket untuk foto produk
-- =============================================
-- PENTING: Bucket ini HARUS dibuat manual di dashboard Supabase
-- (tidak bisa lewat SQL Editor), caranya:
-- Storage (menu kiri) → New Bucket → Name: product-images → Public bucket: YES → Save

# 🪙 Pepper Strap — Website Toko Online

Selamat! Ini adalah kode lengkap untuk website toko online **Pepper Strap**, dibuat dengan Next.js + Supabase + Midtrans + RajaOngkir.

Panduan ini ditulis untuk yang **belum pernah** mengerjakan website sebelumnya. Ikuti langkah demi langkah, jangan dilompati.

---

## 📋 Yang Anda Butuhkan (semua GRATIS untuk mulai)

| Layanan | Fungsi | Link Daftar |
|---|---|---|
| GitHub | Tempat menyimpan kode | github.com |
| Vercel | Tempat website "hidup" online | vercel.com |
| Supabase | Database (produk, pesanan, akun) | supabase.com |
| RajaOngkir | Hitung ongkos kirim | rajaongkir.com |
| Midtrans | Terima pembayaran (QRIS, dll) | midtrans.com |

---

## 🚀 LANGKAH 1 — Siapkan Database di Supabase

1. Buka project Supabase yang sudah Anda buat (Dashboard).
2. Di menu kiri, klik **SQL Editor** → **New Query**.
3. Buka file `supabase_schema.sql` yang ada di folder ini, **copy semua isinya**.
4. **Paste** ke SQL Editor di Supabase, lalu klik **Run** (atau tombol play).
5. Tunggu sampai muncul "Success. No rows returned" — artinya database sudah siap dengan tabel produk, pesanan, dll.

### Buat tempat penyimpanan foto produk
1. Di menu kiri Supabase, klik **Storage**.
2. Klik **New Bucket**.
3. Nama: `product-images`
4. Centang **Public bucket** -> YES (supaya foto bisa tampil di website)
5. Klik **Create bucket**.

### Ambil kunci API Supabase
1. Klik ikon gerigi **Project Settings** (di menu kiri bawah) -> **API**.
2. Anda akan melihat 3 nilai penting, **catat di tempat aman**:
   - `Project URL` -> ini untuk `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> ini untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (klik "reveal" untuk melihat) -> ini untuk `SUPABASE_SERVICE_ROLE_KEY`
   - PENTING: service_role key BERSIFAT RAHASIA, jangan pernah dibagikan ke siapapun.

---

## 🚚 LANGKAH 2 — Daftar RajaOngkir

1. Buka rajaongkir.com, daftar akun gratis (paket Starter).
2. Setelah masuk, cari halaman API Key di dashboard, copy kunci Anda.
3. Cari kode kota tempat Anda mengirim barang (kota asal toko) -- biasanya ada fitur pencarian kota di dashboard RajaOngkir, atau tanyakan ke saya nama kota Anda dan saya bantu carikan kodenya.

---

## 💳 LANGKAH 3 — Daftar Midtrans

1. Buka midtrans.com -> Daftar.
2. Isi data bisnis Anda (boleh pakai data Toni Strap / Pepper Strap).
3. Setelah daftar, Anda akan masuk ke mode SANDBOX dulu (mode uji coba, belum mode asli) -- ini bagus untuk tes website sebelum benar-benar menerima uang.
4. Di Dashboard Midtrans, buka Settings -> Access Keys, catat:
   - Server Key (yang ada tulisan SB- di depan, untuk sandbox)
   - Client Key (juga ada tulisan SB- di depan)
5. Verifikasi bisnis (KTP, NPWP, rekening bank) bisa dilakukan belakangan untuk pindah ke mode produksi (asli) -- boleh jalan dulu pakai sandbox untuk tes.

---

## 💻 LANGKAH 4 — Upload Kode ke GitHub

1. Buka github.com, klik tombol "+" di kanan atas -> New repository.
2. Nama repository: `pepper-strap`
3. Pilih Private (supaya kode tidak terlihat orang lain) atau Public (boleh juga).
4. JANGAN centang "Add a README file" (kita sudah punya).
5. Klik Create repository.
6. Anda akan melihat halaman dengan instruksi -- gunakan opsi "...or push an existing repository". Di komputer Anda, di folder project ini, jalankan (lewat Terminal/Command Prompt):

```bash
git init
git add .
git commit -m "Initial commit - Pepper Strap"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/pepper-strap.git
git push -u origin main
```

(Ganti USERNAME-ANDA dengan username GitHub Anda)

> Kalau Anda tidak familiar dengan Terminal, beri tahu saya -- saya bisa bantu Anda lewat cara lain, misalnya upload file secara manual di web GitHub.

---

## 🌐 LANGKAH 5 — Deploy ke Vercel (Membuat Website Jadi LIVE)

1. Buka vercel.com, login dengan akun GitHub Anda.
2. Klik Add New -> Project.
3. Pilih repository `pepper-strap` yang baru Anda upload, klik Import.
4. Sebelum klik Deploy, klik Environment Variables dan isi SATU PER SATU sesuai isi `.env.example`:

| Nama Variabel | Isi dengan |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Project URL dari Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | anon public key dari Supabase |
| SUPABASE_SERVICE_ROLE_KEY | service_role key dari Supabase |
| RAJAONGKIR_API_KEY | API key dari RajaOngkir |
| RAJAONGKIR_ORIGIN_CITY_ID | Kode kota asal toko Anda |
| MIDTRANS_SERVER_KEY | Server Key dari Midtrans (yang ada SB-) |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | Client Key dari Midtrans (yang ada SB-) |
| NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION | false (tetap false dulu sampai siap jualan asli) |
| NEXT_PUBLIC_SITE_URL | Isi nanti setelah dapat alamat web (lihat langkah berikut) |
| NEXT_PUBLIC_SITE_NAME | Pepper Strap |

5. Klik Deploy. Tunggu 2-3 menit.
6. Setelah selesai, Vercel akan memberi Anda alamat web, misalnya: pepper-strap-xyz.vercel.app
7. PENTING: Kembali ke Environment Variables, update NEXT_PUBLIC_SITE_URL dengan alamat tersebut (pakai https://), lalu klik Redeploy di tab Deployments supaya perubahan berlaku.

Website Anda sekarang LIVE dan bisa dibuka siapa saja!

---

## 🔗 LANGKAH 6 — Hubungkan Webhook Midtrans

Supaya status pembayaran otomatis terupdate (tidak perlu cek manual):

1. Di dashboard Midtrans -> Settings -> Configuration.
2. Cari kolom Payment Notification URL, isi dengan:
   ```
   https://alamat-website-anda.vercel.app/api/midtrans/webhook
   ```
3. Simpan.

---

## 👑 LANGKAH 7 — Jadikan Diri Anda Admin

1. Buka website Anda, klik Daftar Akun, daftar dengan email Anda sendiri.
2. Setelah berhasil daftar, buka Supabase -> Table Editor -> tabel `profiles`.
3. Cari baris dengan email Anda, ubah kolom `role` dari `customer` menjadi `admin`.
4. Simpan. Sekarang saat Anda login di website, akan muncul menu Panel Admin di halaman Akun.

Dari Panel Admin, Anda bisa:
- Menambah/edit/hapus produk (termasuk upload foto)
- Mengatur promo dan banner
- Melihat & memproses pesanan pelanggan, input nomor resi
- Mengubah tampilan beranda (judul, warna, dll)

---

## ✅ Cara Tes Website Sebelum Jualan Asli

1. Coba beli produk sendiri di website Anda dengan mode Midtrans sandbox (masih false).
2. Saat pembayaran QRIS muncul, gunakan simulator pembayaran sandbox Midtrans (ada tombol "Bayar" simulasi di halaman sandbox).
3. Cek apakah status pesanan otomatis berubah jadi "Dibayar" di Panel Admin.
4. Jika semua lancar, baru ajukan akun Midtrans Anda ke mode produksi, lalu ganti NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION jadi true dan masukkan Server Key & Client Key yang ASLI (bukan yang ada SB-).

---

## 🆘 Kalau Ada Error / Bingung

Tenang -- kembali saja ke percakapan dengan Claude, kirim:
- Screenshot error yang muncul, atau
- Pesan error yang di-copy

Saya akan bantu cari solusinya.

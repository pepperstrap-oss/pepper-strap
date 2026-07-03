// =============================================
// src/app/(store)/cara-belanja/page.tsx — Cara Belanja
// =============================================
import { MobileLayout } from '@/components/layout/MobileLayout'
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader'

const steps = [
  { title: 'Pilih Produk', desc: 'Jelajahi katalog di menu Produk, pilih strap yang Anda suka, lalu tentukan ukuran yang sesuai dengan jam tangan Anda.' },
  { title: 'Masukkan ke Keranjang', desc: 'Tambahkan produk ke keranjang. Anda bisa mengubah jumlah atau ukuran sebelum checkout.' },
  { title: 'Cek Ongkos Kirim', desc: 'Di halaman keranjang, masukkan lokasi tujuan untuk melihat estimasi ongkos kirim dan waktu pengiriman JNE/JNT.' },
  { title: 'Isi Data Pengiriman', desc: 'Lengkapi nama penerima, nomor HP, dan alamat lengkap. Kalau sudah punya akun, alamat tersimpan bisa langsung dipakai.' },
  { title: 'Bayar', desc: 'Selesaikan pembayaran lewat QRIS atau metode lain yang tersedia di halaman pembayaran.' },
  { title: 'Pesanan Diproses', desc: 'Setelah pembayaran terkonfirmasi, pesanan akan kami kemas dan kirim. Anda bisa memantau status lewat menu Lacak Pesanan.' },
]

export default function CaraBelanjaPage() {
  return (
    <MobileLayout>
      <StoreInfoHeader title="Cara Belanja" />
      <div className="p-4 pb-24">
        <p className="text-[12px] text-gray-500 mb-4">
          Belanja di Pepper Strap mudah dan cepat. Ikuti langkah-langkah berikut:
        </p>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3.5 flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#4a6650] text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="text-[12px] font-semibold text-gray-800 mb-0.5">{s.title}</div>
                <div className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}

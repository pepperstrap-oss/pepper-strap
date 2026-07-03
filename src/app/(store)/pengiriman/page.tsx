// =============================================
// src/app/(store)/pengiriman/page.tsx — Info Pengiriman
// =============================================
import { MobileLayout } from '@/components/layout/MobileLayout'
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader'

export default function PengirimanPage() {
  return (
    <MobileLayout>
      <StoreInfoHeader title="Informasi Pengiriman" />
      <div className="p-4 pb-24 space-y-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-bold text-[#4a6650] mb-2">🚚 Ekspedisi Tersedia</h2>
          <p className="text-[11px] text-gray-500 leading-relaxed mb-2">
            Kami bekerja sama dengan ekspedisi JNE dan J&T untuk mengirim pesanan ke seluruh Indonesia.
            Ongkos kirim dan estimasi waktu tiba dihitung otomatis berdasarkan lokasi tujuan saat Anda
            checkout.
          </p>
          <div className="flex gap-2">
            <span className="bg-[#e8f0e9] text-[#4a6650] text-[10px] font-semibold px-2.5 py-1 rounded">JNE</span>
            <span className="bg-[#e8f0e9] text-[#4a6650] text-[10px] font-semibold px-2.5 py-1 rounded">J&T</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-bold text-[#4a6650] mb-2">📦 Proses Pengemasan</h2>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Setiap strap dikemas dengan rapi menggunakan bubble wrap dan kotak/pouch pelindung agar
            tetap aman selama perjalanan. Pesanan biasanya dikirim dalam 1–2 hari kerja setelah
            pembayaran terkonfirmasi.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-bold text-[#4a6650] mb-2">🔍 Melacak Pesanan</h2>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Setelah pesanan dikirim, nomor resi akan tersedia di menu <b>Lacak Pesanan</b> atau di
            halaman <b>Pesanan Saya</b> pada akun Anda. Gunakan nomor resi tersebut untuk memantau
            posisi paket lewat aplikasi/website ekspedisi terkait.
          </p>
        </div>
      </div>
    </MobileLayout>
  )
}

// =============================================
// src/app/(store)/pembayaran/page.tsx — Info Pembayaran
// =============================================
import { MobileLayout } from '@/components/layout/MobileLayout'
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader'

export default function PembayaranPage() {
  return (
    <MobileLayout>
      <StoreInfoHeader title="Informasi Pembayaran" />
      <div className="p-4 pb-24 space-y-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-bold text-[#4a6650] mb-2">🔒 Pembayaran Aman</h2>
          <p className="text-[11px] text-gray-500 leading-relaxed mb-2">
            Semua transaksi diproses melalui payment gateway resmi, sehingga data pembayaran Anda
            terjamin keamanannya. Kami tidak pernah menyimpan data kartu atau rekening Anda.
          </p>
          <span className="bg-[#e8f0e9] text-[#4a6650] text-[10px] font-semibold px-2.5 py-1 rounded">QRIS — Semua Bank & E-Wallet</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-bold text-[#4a6650] mb-2">📱 Cara Bayar dengan QRIS</h2>
          <div className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
            <div>1. Selesaikan proses checkout hingga muncul kode QRIS.</div>
            <div>2. Buka aplikasi e-wallet atau m-banking favorit Anda (GoPay, OVO, DANA, ShopeePay, atau bank apa pun yang mendukung QRIS).</div>
            <div>3. Pilih menu "Scan QR", arahkan ke kode QRIS yang muncul di layar.</div>
            <div>4. Periksa nominal pembayaran, lalu selesaikan transaksi.</div>
            <div>5. Status pesanan akan otomatis diperbarui setelah pembayaran terkonfirmasi.</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <h2 className="text-[13px] font-bold text-[#4a6650] mb-2">⏱️ Batas Waktu Pembayaran</h2>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Kode QRIS berlaku dalam jangka waktu tertentu. Jika belum membayar hingga batas waktu
            habis, pesanan akan otomatis dibatalkan dan Anda perlu melakukan checkout ulang.
          </p>
        </div>
      </div>
    </MobileLayout>
  )
}

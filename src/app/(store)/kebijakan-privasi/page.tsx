// =============================================
// src/app/(store)/kebijakan-privasi/page.tsx — Kebijakan Privasi
// =============================================
import { MobileLayout } from '@/components/layout/MobileLayout'
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader'

const sections = [
  {
    title: 'Data yang Kami Kumpulkan',
    body: 'Saat Anda berbelanja atau membuat akun, kami mengumpulkan data seperti nama, nomor HP, email, dan alamat pengiriman. Data ini digunakan semata-mata untuk memproses pesanan Anda.',
  },
  {
    title: 'Penggunaan Data',
    body: 'Data yang Anda berikan digunakan untuk memproses transaksi, mengirim pesanan, memberikan informasi status pesanan, dan meningkatkan kualitas layanan kami. Kami tidak menjual atau membagikan data pribadi Anda ke pihak ketiga untuk kepentingan pemasaran.',
  },
  {
    title: 'Keamanan Data',
    body: 'Kami menggunakan sistem autentikasi dan penyimpanan data yang aman. Data pembayaran diproses langsung oleh payment gateway resmi dan tidak disimpan di server kami.',
  },
  {
    title: 'Alamat Tersimpan',
    body: 'Jika Anda memilih untuk menyimpan alamat pengiriman di akun, data tersebut hanya dapat diakses oleh Anda sendiri dan digunakan untuk mempercepat proses checkout di kemudian hari.',
  },
  {
    title: 'Hak Anda',
    body: 'Anda berhak untuk melihat, memperbarui, atau menghapus data pribadi dan alamat tersimpan Anda kapan saja melalui halaman akun, atau dengan menghubungi kami langsung.',
  },
  {
    title: 'Perubahan Kebijakan',
    body: 'Kebijakan privasi ini dapat diperbarui sewaktu-waktu mengikuti perkembangan layanan kami. Perubahan signifikan akan kami informasikan melalui halaman ini.',
  },
]

export default function KebijakanPrivasiPage() {
  return (
    <MobileLayout>
      <StoreInfoHeader title="Kebijakan Privasi" />
      <div className="p-4 pb-24 space-y-3">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Kami menghargai privasi Anda. Halaman ini menjelaskan bagaimana Pepper Strap mengumpulkan,
          menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan kami.
        </p>
        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3.5">
            <h2 className="text-[12px] font-bold text-[#4a6650] mb-1.5">{s.title}</h2>
            <p className="text-[11px] text-gray-500 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </MobileLayout>
  )
}

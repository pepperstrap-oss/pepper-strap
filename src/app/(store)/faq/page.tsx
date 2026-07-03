// =============================================
// src/app/(store)/faq/page.tsx — FAQ
// =============================================
'use client'
import { useState } from 'react'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader'

const faqs = [
  {
    q: 'Bagaimana cara menentukan ukuran strap yang tepat?',
    a: 'Ukuran strap diukur berdasarkan lebar lug (celah tempat strap terpasang) pada jam tangan Anda, biasanya dalam mm (18mm, 20mm, 22mm, dst). Anda bisa melihat ukuran ini di strap lama, buku manual jam, atau mengukur langsung lebar celah lug dengan penggaris.',
  },
  {
    q: 'Apakah strap bisa dipasang di semua merek jam tangan?',
    a: 'Bisa, selama ukuran lug jam tangan Anda sesuai dengan ukuran strap yang dipilih. Strap kulit kami menggunakan mekanisme pin standar yang kompatibel dengan hampir semua merek jam tangan.',
  },
  {
    q: 'Berapa lama estimasi pengiriman?',
    a: 'Estimasi waktu pengiriman tergantung lokasi tujuan dan ditampilkan otomatis saat Anda mengecek ongkos kirim di halaman keranjang, umumnya 1–5 hari kerja tergantung jarak.',
  },
  {
    q: 'Apakah bisa request warna atau ukuran khusus?',
    a: 'Untuk saat ini kami menyediakan pilihan warna dan ukuran sesuai yang tertera di setiap produk. Untuk kebutuhan khusus, silakan hubungi kami lewat halaman Kontak untuk ditanyakan ketersediaannya.',
  },
  {
    q: 'Bagaimana jika produk yang diterima cacat atau tidak sesuai?',
    a: 'Segera hubungi kami lewat WhatsApp di halaman Kontak dengan menyertakan foto produk dan nomor pesanan, maksimal 2x24 jam setelah paket diterima. Kami akan bantu proses penggantian.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Saat ini pembayaran dilakukan melalui QRIS, yang mendukung hampir semua aplikasi e-wallet dan m-banking di Indonesia. Detail lengkap ada di halaman Pembayaran.',
  },
  {
    q: 'Bagaimana cara melacak status pesanan saya?',
    a: 'Gunakan menu Lacak Pesanan di navigasi bawah, atau masuk ke akun Anda dan buka halaman Pesanan Saya untuk melihat status dan nomor resi terbaru.',
  },
]

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <MobileLayout>
      <StoreInfoHeader title="FAQ — Pertanyaan Umum" />
      <div className="p-4 pb-24 space-y-2">
        {faqs.map((f, i) => {
          const isOpen = openIdx === i
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full text-left px-3.5 py-3 flex items-center justify-between gap-2"
              >
                <span className="text-[12px] font-semibold text-gray-800">{f.q}</span>
                <span className={`text-[#4a6650] text-sm flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3.5 text-[11px] text-gray-500 leading-relaxed border-t border-gray-50 pt-2.5">
                  {f.a}
                </div>
              )}
            </div>
          )
        })}

        <div className="bg-[#e8f0e9] rounded-xl p-3.5 text-[11px] text-[#4a6650] leading-relaxed mt-3">
          Tidak menemukan jawaban yang Anda cari? Hubungi kami langsung lewat halaman Kontak.
        </div>
      </div>
    </MobileLayout>
  )
}

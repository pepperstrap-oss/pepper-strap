// =============================================
// src/app/(store)/tentang/page.tsx — Tentang Kami
// =============================================
import { MobileLayout } from '@/components/layout/MobileLayout'
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader'

export default function TentangPage() {
  return (
    <MobileLayout>
      <StoreInfoHeader title="Tentang Kami" />
      <div className="p-4 pb-24 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h1 className="text-[15px] font-bold text-gray-800 mb-2">Pepper Strap</h1>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Pepper Strap adalah usaha kerajinan kulit yang berfokus pada pembuatan strap jam tangan
            handmade berkualitas premium. Setiap strap kami buat dengan tangan menggunakan kulit
            pilihan, sehingga setiap produk memiliki karakter dan keunikannya sendiri.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-[13px] font-bold text-[#4a6650] mb-2">🏆 Kenapa Pilih Kami</h2>
          <div className="space-y-3">
            {[
              { icon: '✋', title: 'Handmade Sepenuhnya', desc: 'Setiap strap dijahit dan dibentuk manual oleh pengrajin, bukan produksi massal pabrik.' },
              { icon: '🐄', title: 'Kulit Asli Pilihan', desc: 'Kami hanya menggunakan bahan kulit asli berkualitas untuk daya tahan dan tampilan terbaik.' },
              { icon: '📏', title: 'Ukuran Fleksibel', desc: 'Tersedia berbagai ukuran lug untuk berbagai jenis dan merek jam tangan.' },
              { icon: '💚', title: 'Layanan Ramah', desc: 'Tim kami siap membantu menjawab pertanyaan seputar produk dan pesanan Anda.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <div className="text-[12px] font-semibold text-gray-800">{f.title}</div>
                  <div className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}

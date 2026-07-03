// =============================================
// src/app/(store)/kontak/page.tsx — Kontak
// =============================================
import { supabase } from '@/lib/supabase'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader'

export const revalidate = 0

async function getStoreInfo() {
  const { data } = await supabase.from('site_settings').select('*').eq('key', 'store_info').single()
  return data?.value || {}
}

export default async function KontakPage() {
  const store = await getStoreInfo()
  const whatsapp = (store.whatsapp || '').replace(/^0/, '62').replace(/\D/g, '')

  const contacts = [
    { icon: '💬', label: 'WhatsApp', value: store.whatsapp || '-', href: whatsapp ? `https://wa.me/${whatsapp}` : undefined },
    { icon: '✉️', label: 'Email', value: store.email || '-', href: store.email ? `mailto:${store.email}` : undefined },
    { icon: '📷', label: 'Instagram', value: store.instagram ? `@${store.instagram.replace('@', '')}` : '-', href: store.instagram ? `https://instagram.com/${store.instagram.replace('@', '')}` : undefined },
  ]

  return (
    <MobileLayout>
      <StoreInfoHeader title="Kontak Kami" />
      <div className="p-4 pb-24 space-y-3">
        <p className="text-[12px] text-gray-500 mb-1">
          Ada pertanyaan seputar produk, pesanan, atau kerjasama? Hubungi kami lewat salah satu kanal berikut.
        </p>
        {contacts.map(c => (
          <a
            key={c.label}
            href={c.href}
            target={c.href ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={`flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3.5 ${c.href ? 'active:bg-gray-50' : 'opacity-60'}`}
          >
            <span className="text-2xl">{c.icon}</span>
            <div>
              <div className="text-[11px] text-gray-400">{c.label}</div>
              <div className="text-[13px] font-semibold text-gray-800">{c.value}</div>
            </div>
          </a>
        ))}

        <div className="bg-[#e8f0e9] rounded-xl p-3.5 text-[11px] text-[#4a6650] leading-relaxed">
          ⏰ Jam operasional layanan pelanggan: Senin–Sabtu, 09.00–17.00 WIB. Pesan yang masuk di luar jam
          tersebut akan kami balas secepatnya di hari kerja berikutnya.
        </div>
      </div>
    </MobileLayout>
  )
}

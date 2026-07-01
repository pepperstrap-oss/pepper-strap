// =============================================
// src/app/(store)/keranjang/page.tsx
// Halaman Keranjang + Hitung Ongkir (RajaOngkir API V2)
// =============================================
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { MobileLayout } from '@/components/layout/MobileLayout'
import toast from 'react-hot-toast'
import type { OngkirResult } from '@/types'

type DestinationOption = {
  id: number
  label: string
  province_name: string
  city_name: string
  district_name: string
  subdistrict_name: string
  zip_code: string
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore()

  const [search, setSearch] = useState('')
  const [destinations, setDestinations] = useState<DestinationOption[]>([])
  const [selectedDestination, setSelectedDestination] = useState<DestinationOption | null>(null)
  const [searching, setSearching] = useState(false)

  const [ongkirResults, setOngkirResults] = useState<OngkirResult[]>([])
  const [selectedOngkir, setSelectedOngkir] = useState<OngkirResult | null>(null)
  const [loadingOngkir, setLoadingOngkir] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

  // Cari lokasi tujuan sambil mengetik (dengan jeda/debounce supaya tidak terlalu sering memanggil API)
  function handleSearchChange(value: string) {
    setSearch(value)
    setSelectedDestination(null)
    setOngkirResults([])
    setSelectedOngkir(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 3) { setDestinations([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/ongkir/cities?search=${encodeURIComponent(value)}`)
        const data = await res.json()
        setDestinations(data.results || [])
      } catch {
        toast.error('Gagal mencari lokasi')
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  function selectDestination(dest: DestinationOption) {
    setSelectedDestination(dest)
    setSearch(dest.label)
    setDestinations([])
    fetchOngkir(dest.id)
  }

  async function fetchOngkir(destinationId: number) {
    setLoadingOngkir(true)
    setOngkirResults([])
    setSelectedOngkir(null)
    try {
      const weight = items.reduce((sum, i) => sum + i.product.weight_gram * i.quantity, 0)
      const res = await fetch('/api/ongkir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId, weight }),
      })
      const data = await res.json()
      if (!data.results || data.results.length === 0) {
        toast.error('Tidak ada layanan pengiriman untuk lokasi ini')
      }
      setOngkirResults(data.results || [])
    } catch { toast.error('Gagal hitung ongkir') }
    finally { setLoadingOngkir(false) }
  }

  const grandTotal = total() + (selectedOngkir?.cost || 0)

  function goCheckout() {
    if (!selectedOngkir || !selectedDestination) { toast.error('Pilih layanan pengiriman dulu!'); return }
    if (items.length === 0) { toast.error('Keranjang kosong!'); return }
    sessionStorage.setItem('checkout_shipping', JSON.stringify({
      destinationId: selectedDestination.id,
      cityName: selectedDestination.city_name,
      province: selectedDestination.province_name,
      zipCode: selectedDestination.zip_code,
      fullLabel: selectedDestination.label,
      ongkir: selectedOngkir,
    }))
    router.push('/checkout')
  }

  if (items.length === 0) return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <div className="text-base font-semibold text-gray-700 mb-2">Keranjang Kosong</div>
        <div className="text-sm text-gray-400 mb-6">Yuk tambahkan produk favorit Anda</div>
        <button onClick={() => router.push('/produk')} className="bg-[#4a6650] text-white px-6 py-3 rounded-xl font-semibold text-sm">
          Lihat Produk
        </button>
      </div>
    </MobileLayout>
  )

  return (
    <MobileLayout>
      <div className="p-3.5 pb-24">
        {/* Item keranjang */}
        <div className="space-y-2.5 mb-3">
          {items.map(item => (
            <div key={`${item.product.id}-${item.size}`} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3">
              <div className="w-14 h-14 bg-[#e8f0e9] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.product.image_url
                  ? <img src={item.product.image_url} className="w-full h-full object-cover" alt={item.product.name} />
                  : <span className="text-2xl">📦</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-gray-800 truncate">{item.product.name}</div>
                <div className="text-[11px] text-gray-400 mb-1">Ukuran: {item.size}</div>
                <div className="text-[13px] font-bold text-[#4a6650]">{fmt(item.product.price)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                    className="w-6 h-6 rounded-full border border-[#4a6650] text-[#4a6650] text-sm font-bold flex items-center justify-center">-</button>
                  <span className="text-[13px] font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                    className="w-6 h-6 rounded-full border border-[#4a6650] text-[#4a6650] text-sm font-bold flex items-center justify-center">+</button>
                  <button onClick={() => removeItem(item.product.id, item.size)}
                    className="ml-auto text-red-400 text-sm">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hitung Ongkir */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3">
          <div className="text-[13px] font-semibold text-[#4a6650] mb-3">🚚 Hitung Ongkos Kirim</div>
          <label className="text-[11px] text-gray-500 mb-1 block">Cari Kecamatan / Kota Tujuan</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Contoh: Wonogiri, atau nama kecamatan"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] mb-1"
            />
            {searching && (
              <div className="text-[11px] text-gray-400 mt-1">Mencari lokasi...</div>
            )}
            {destinations.length > 0 && (
              <div className="border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto bg-white shadow-sm">
                {destinations.map(d => (
                  <div
                    key={d.id}
                    onClick={() => selectDestination(d)}
                    className="px-3 py-2 text-[11px] text-gray-700 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-[#e8f0e9]"
                  >
                    {d.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {loadingOngkir && <div className="text-center py-3 text-[12px] text-gray-400">Menghitung ongkir...</div>}

          {ongkirResults.length > 0 && (
            <div className="space-y-2 mt-2">
              <div className="text-[11px] text-gray-500 mb-1">Pilih Layanan Pengiriman</div>
              {ongkirResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedOngkir(r)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedOngkir === r ? 'border-[#4a6650] bg-[#e8f0e9]' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <div className="text-[12px] font-semibold text-gray-800">{r.courier} {r.service}</div>
                    <div className="text-[10px] text-gray-500">{r.description} · Est. {r.etd} hari</div>
                  </div>
                  <div className="text-[13px] font-bold text-[#4a6650]">{fmt(r.cost)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ringkasan */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3">
          <div className="flex justify-between text-[12px] text-gray-600 mb-2">
            <span>Subtotal ({itemCount()} item)</span>
            <span>{fmt(total())}</span>
          </div>
          <div className="flex justify-between text-[12px] text-gray-600 mb-3">
            <span>Ongkos Kirim</span>
            <span>{selectedOngkir ? fmt(selectedOngkir.cost) : '-'}</span>
          </div>
          <div className="flex justify-between text-[14px] font-bold text-[#4a6650] border-t border-gray-100 pt-3">
            <span>Total Bayar</span>
            <span>{selectedOngkir ? fmt(grandTotal) : '-'}</span>
          </div>
        </div>

        <button onClick={goCheckout} className="w-full bg-[#4a6650] text-white py-3.5 rounded-xl font-bold text-[14px]">
          Lanjut ke Pembayaran
        </button>
      </div>
    </MobileLayout>
  )
}

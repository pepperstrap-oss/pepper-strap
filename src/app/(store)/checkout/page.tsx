// =============================================
// src/app/(store)/checkout/page.tsx
// Halaman Checkout + Alamat + Midtrans
// Mendukung checkout dengan akun ATAU sebagai tamu (guest checkout)
// =============================================
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Address } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const { user, profile } = useAuthStore()
  const [shipping, setShipping] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [snapReady, setSnapReady] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [saveNewAddress, setSaveNewAddress] = useState(false)
  const [form, setForm] = useState({
    recipient_name: '',
    email: '',
    phone: '',
    street: '',
    postal_code: '',
    notes: '',
  })
  const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID')
  const isGuest = !user

  useEffect(() => {
    const saved = sessionStorage.getItem('checkout_shipping')
    if (!saved) { router.push('/keranjang'); return }
    const parsedShipping = JSON.parse(saved)
    setShipping(parsedShipping)
    setForm(f => ({
      ...f,
      recipient_name: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      postal_code: parsedShipping.zipCode || f.postal_code,
    }))
  }, [user, profile])

  // Ambil daftar alamat tersimpan untuk pelanggan yang sudah login
  useEffect(() => {
    if (!user) { setSavedAddresses([]); return }
    supabase.from('addresses').select('*').eq('user_id', user.id)
      .order('is_default', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => {
        setSavedAddresses(data || [])
        const def = (data || []).find(a => a.is_default) || (data || [])[0]
        if (def) applyAddress(def)
      })
  }, [user])

  function applyAddress(a: Address) {
    setSelectedAddressId(a.id)
    setForm(f => ({
      ...f,
      recipient_name: a.recipient_name,
      phone: a.phone,
      street: a.street,
      postal_code: a.postal_code,
    }))
  }

  function useNewAddress() {
    setSelectedAddressId(null)
    setForm(f => ({ ...f, recipient_name: profile?.full_name || '', phone: profile?.phone || '', street: '', postal_code: shipping?.zipCode || '' }))
  }

  async function handleOrder() {
    if (!form.recipient_name || !form.phone || !form.street || !form.postal_code) {
      toast.error('Lengkapi semua data alamat')
      return
    }
    if (isGuest && !form.email) {
      toast.error('Email wajib diisi untuk konfirmasi pesanan')
      return
    }
    if (!snapReady) {
      toast.error('Sistem pembayaran sedang dimuat, coba lagi sebentar')
      return
    }
    setLoading(true)
    try {
      const shippingAddress = {
        recipient_name: form.recipient_name,
        phone: form.phone,
        street: form.street,
        city: shipping.cityName,
        province: shipping.province,
        province_id: shipping.destinationId?.toString() || '',
        postal_code: form.postal_code || shipping.zipCode || '',
      }
      const subtotal = total()
      const shippingCost = shipping.ongkir?.cost || 0
      const grandTotal = subtotal + shippingCost
      const customerEmail = isGuest ? form.email : user!.email

      // Simpan order ke Supabase — user_id diisi jika login, atau kosong (tamu) dengan data kontak guest_*
      const orderPayload: any = {
        subtotal,
        shipping_cost: shippingCost,
        total: grandTotal,
        courier: shipping.ongkir?.courier,
        courier_service: shipping.ongkir?.service,
        estimated_days: shipping.ongkir?.etd,
        shipping_address: shippingAddress,
        notes: form.notes,
        status: 'pending',
        payment_status: 'unpaid',
      }
      if (isGuest) {
        orderPayload.guest_name = form.recipient_name
        orderPayload.guest_email = form.email
        orderPayload.guest_phone = form.phone
      } else {
        orderPayload.user_id = user!.id
      }

      const { data: order, error: orderError } = await supabase.from('orders').insert(orderPayload).select().single()

      if (orderError) throw orderError

      // Simpan alamat baru ke buku alamat jika pengguna login, memilih entri manual,
      // dan mencentang opsi "simpan alamat"
      if (!isGuest && !selectedAddressId && saveNewAddress) {
        supabase.from('addresses').insert({
          user_id: user!.id,
          label: 'Rumah',
          recipient_name: form.recipient_name,
          phone: form.phone,
          street: form.street,
          city: shipping.cityName,
          province: shipping.province,
          province_id: shipping.destinationId?.toString() || '',
          postal_code: form.postal_code || shipping.zipCode || '',
          is_default: savedAddresses.length === 0,
        }).then(({ error }) => { if (error) console.error('Gagal simpan alamat:', error) })
      }

      // Simpan order items
      await supabase.from('order_items').insert(
        items.map(i => ({
          order_id: order.id,
          product_id: i.product.id,
          product_name: i.product.name,
          product_image: i.product.image_url,
          size: i.size,
          price: i.product.price,
          quantity: i.quantity,
          subtotal: i.product.price * i.quantity,
        }))
      )

      // Buat token Midtrans
      const payRes = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: items.map(i => ({ product_id: i.product.id, name: i.product.name, size: i.size, price: i.product.price, quantity: i.quantity })),
          customer: { name: form.recipient_name, email: customerEmail, phone: form.phone, address: shippingAddress },
          shippingCost,
        }),
      })

      const payData = await payRes.json()
      if (!payData.token) throw new Error('Gagal membuat transaksi pembayaran')

      // Buka Midtrans Snap
      // @ts-ignore
      window.snap.pay(payData.token, {
        onSuccess: () => { clearCart(); sessionStorage.removeItem('checkout_shipping'); router.push(`/sukses?order=${order.order_number}`) },
        onPending: () => { clearCart(); sessionStorage.removeItem('checkout_shipping'); router.push(`/sukses?order=${order.order_number}`) },
        onError: () => toast.error('Pembayaran gagal, silakan coba lagi'),
        onClose: () => toast('Pembayaran dibatalkan'),
      })
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!shipping) return null
  const grandTotal = total() + (shipping.ongkir?.cost || 0)
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  const snapUrl = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f5f0] pb-24">
      {/* Midtrans Snap script */}
      <Script
        src={snapUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onReady={() => setSnapReady(true)}
        strategy="afterInteractive"
      />

      <div className="bg-[#4a6650] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <span className="text-white font-semibold text-sm">Checkout</span>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Info guest checkout */}
        {isGuest && (
          <div className="bg-[#e8f0e9] rounded-xl p-3.5 text-[12px] text-[#4a6650] leading-relaxed">
            Anda berbelanja tanpa akun. Isi data di bawah untuk melanjutkan, atau{' '}
            <button onClick={() => router.push('/auth/masuk?redirect=/checkout')} className="font-bold underline">
              masuk ke akun
            </button>{' '}
            agar bisa melacak pesanan lebih mudah nanti.
          </div>
        )}

        {/* Alamat Tersimpan */}
        {!isGuest && savedAddresses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[13px] font-semibold text-[#4a6650]">📍 Pilih Alamat Tersimpan</div>
              <button onClick={() => router.push('/akun/alamat')} className="text-[11px] text-[#4a6650] underline">Kelola</button>
            </div>
            <div className="space-y-2">
              {savedAddresses.map(a => (
                <div
                  key={a.id}
                  onClick={() => applyAddress(a)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedAddressId === a.id ? 'border-[#4a6650] bg-[#e8f0e9]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-800">{a.label}</span>
                    {a.is_default && <span className="text-[9px] bg-white text-[#4a6650] px-1.5 py-0.5 rounded">Utama</span>}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5">{a.recipient_name} · {a.phone}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{a.street}, {a.city}</div>
                </div>
              ))}
              <button
                onClick={useNewAddress}
                className={`w-full p-2.5 rounded-lg border text-[11px] text-center transition-colors ${
                  selectedAddressId === null ? 'border-[#4a6650] bg-[#e8f0e9] text-[#4a6650] font-semibold' : 'border-dashed border-gray-300 text-gray-500'
                }`}
              >
                + Gunakan alamat lain
              </button>
            </div>
          </div>
        )}

        {/* Alamat */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <div className="text-[13px] font-semibold text-[#4a6650] mb-3">📍 Data Pemesan & Alamat Pengiriman</div>
          {[
            { label: 'Nama Penerima', key: 'recipient_name', placeholder: 'Nama lengkap penerima', type: 'text' },
            ...(isGuest ? [{ label: 'Email', key: 'email', placeholder: 'email@example.com (untuk konfirmasi pesanan)', type: 'email' }] : []),
            { label: 'No. HP', key: 'phone', placeholder: '08xxxxxxxxxx', type: 'text' },
            { label: 'Alamat Lengkap', key: 'street', placeholder: 'Nama jalan, no. rumah, RT/RW', type: 'text' },
            { label: 'Kode Pos', key: 'postal_code', placeholder: '12345', type: 'text' },
          ].map(f => (
            <div key={f.key} className="mb-2.5">
              <label className="text-[11px] text-gray-500 mb-1 block">{f.label}</label>
              <input
                type={f.type as 'text' | 'email'}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#4a6650]"
              />
            </div>
          ))}
          <div className="bg-[#e8f0e9] rounded-lg px-3 py-2 text-[11px] text-[#4a6650]">
            📍 {shipping.cityName}, {shipping.province}
          </div>

          {!isGuest && selectedAddressId === null && (
            <label className="flex items-center gap-2 text-[11px] text-gray-600 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveNewAddress}
                onChange={e => setSaveNewAddress(e.target.checked)}
              />
              Simpan alamat ini untuk pembelian berikutnya
            </label>
          )}
        </div>

        {/* Pengiriman */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <div className="text-[13px] font-semibold text-[#4a6650] mb-2">🚚 Pengiriman</div>
          <div className="flex justify-between text-[12px]">
            <span className="text-gray-600">{shipping.ongkir?.courier} {shipping.ongkir?.service}</span>
            <span className="font-semibold">{'Rp ' + (shipping.ongkir?.cost || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Estimasi {shipping.ongkir?.etd} hari kerja</div>
        </div>

        {/* Ringkasan produk */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <div className="text-[13px] font-semibold text-[#4a6650] mb-2">📦 Ringkasan Pesanan</div>
          {items.map(i => (
            <div key={`${i.product.id}-${i.size}`} className="flex justify-between text-[12px] text-gray-600 mb-1.5">
              <span>{i.product.name} ({i.size}) x{i.quantity}</span>
              <span>{'Rp ' + (i.product.price * i.quantity).toLocaleString('id-ID')}</span>
            </div>
          ))}
          <div className="flex justify-between text-[12px] text-gray-400 mb-2">
            <span>Ongkir ({shipping.ongkir?.courier} {shipping.ongkir?.service})</span>
            <span>{'Rp ' + (shipping.ongkir?.cost || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[14px] font-bold text-[#4a6650] border-t border-gray-100 pt-2.5">
            <span>Total Bayar</span>
            <span>{fmt(grandTotal)}</span>
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <label className="text-[12px] text-gray-500 mb-1 block">Catatan (opsional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Catatan untuk penjual..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] resize-none outline-none focus:border-[#4a6650]"
          />
        </div>

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-[#4a6650] text-white py-3.5 rounded-xl font-bold text-[14px] disabled:opacity-60"
        >
          {loading ? 'Memproses...' : `Bayar ${fmt(grandTotal)}`}
        </button>
      </div>
    </div>
  )
}

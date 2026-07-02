// =============================================
// src/app/(store)/akun/alamat/page.tsx
// Buku Alamat — kelola alamat tersimpan pelanggan
// =============================================
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { AddressForm } from '@/components/account/AddressForm'
import toast from 'react-hot-toast'
import type { Address } from '@/types'

export default function AddressBookPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editAddress, setEditAddress] = useState<Address | null>(null)

  async function load() {
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    setAddresses(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  async function deleteAddress(id: string) {
    if (!confirm('Hapus alamat ini?')) return
    await supabase.from('addresses').delete().eq('id', id)
    toast.success('Alamat dihapus')
    load()
  }

  async function setDefault(id: string) {
    if (!user) return
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    toast.success('Alamat utama diperbarui')
    load()
  }

  if (!user) return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-5xl mb-4">📍</div>
        <div className="text-sm text-gray-500">Masuk untuk mengelola alamat Anda</div>
      </div>
    </MobileLayout>
  )

  return (
    <MobileLayout>
      <div className="bg-[#4a6650] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <span className="text-white font-semibold text-sm">Alamat Tersimpan</span>
      </div>

      <div className="p-3.5 pb-24">
        {(showForm || editAddress) && (
          <div className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[13px] font-bold text-gray-800">{editAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}</div>
              <button onClick={() => { setShowForm(false); setEditAddress(null) }} className="text-gray-400 text-lg">✕</button>
            </div>
            <AddressForm
              userId={user.id}
              editAddress={editAddress}
              onCancel={() => { setShowForm(false); setEditAddress(null) }}
              onSuccess={() => { setShowForm(false); setEditAddress(null); load() }}
            />
          </div>
        )}

        {!showForm && !editAddress && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full border-2 border-dashed border-[#4a6650] text-[#4a6650] py-3 rounded-xl font-semibold text-[13px] mb-3"
          >
            + Tambah Alamat Baru
          </button>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Memuat alamat...</div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📍</div>
            <div className="text-sm text-gray-500">Belum ada alamat tersimpan</div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {addresses.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[12px] font-bold text-gray-800">{a.label}</span>
                  {a.is_default && (
                    <span className="text-[9px] bg-[#e8f0e9] text-[#4a6650] font-semibold px-1.5 py-0.5 rounded">Utama</span>
                  )}
                </div>
                <div className="text-[12px] text-gray-700 font-medium">{a.recipient_name} · {a.phone}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  {a.street}, {a.city}, {a.province} {a.postal_code}
                </div>
                <div className="flex gap-2 mt-2.5">
                  {!a.is_default && (
                    <button onClick={() => setDefault(a.id)}
                      className="text-[10px] border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg">
                      Jadikan Utama
                    </button>
                  )}
                  <button onClick={() => { setEditAddress(a); setShowForm(false) }}
                    className="text-[10px] border border-[#4a6650] text-[#4a6650] px-2.5 py-1 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => deleteAddress(a.id)}
                    className="text-[10px] border border-red-200 text-red-500 px-2.5 py-1 rounded-lg ml-auto">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  )
}

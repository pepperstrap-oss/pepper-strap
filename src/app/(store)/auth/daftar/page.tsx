// =============================================
// src/app/(store)/auth/daftar/page.tsx
// Halaman Register
// =============================================
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuthStore()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Password tidak cocok'); return }
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.full_name)
    if (error) {
      toast.error(error.message || 'Gagal mendaftar')
    } else {
      toast.success('Akun berhasil dibuat! Cek email untuk verifikasi.')
      router.push('/auth/masuk')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f5f0] flex flex-col">
      <div className="bg-[#4a6650] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <span className="text-white font-semibold text-sm">Daftar Akun</span>
      </div>
      <div className="flex-1 px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Buat Akun Baru</h1>
        <p className="text-sm text-gray-500 mb-6">Daftar untuk mulai berbelanja</p>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {[
            { label: 'Nama Lengkap', key: 'full_name', type: 'text', placeholder: 'Nama Anda' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 6 karakter' },
            { label: 'Konfirmasi Password', key: 'confirm', type: 'password', placeholder: 'Ulangi password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[12px] text-gray-600 mb-1 block font-medium">{f.label}</label>
              <input
                type={f.type} required
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#4a6650] text-gray-800 bg-white"
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-[#4a6650] text-white py-3.5 rounded-xl font-bold text-[14px] mt-2 disabled:opacity-60">
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
        <div className="text-center mt-4 text-[12px] text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/auth/masuk" className="text-[#4a6650] font-semibold">Masuk</Link>
        </div>
      </div>
    </div>
  )
}

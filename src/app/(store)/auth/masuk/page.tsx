// =============================================
// src/app/(store)/auth/masuk/page.tsx
// Halaman Login
// =============================================
'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { signIn } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(form.email, form.password)
    if (error) {
      toast.error('Email atau password salah')
    } else {
      toast.success('Berhasil masuk!')
      router.push(redirect)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f5f0] flex flex-col">
      <div className="bg-[#4a6650] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <span className="text-white font-semibold text-sm">Masuk</span>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4a6650] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Selamat Datang</h1>
          <p className="text-sm text-gray-500 mt-1">Masuk ke akun Pepper Strap Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[12px] text-gray-600 mb-1 block font-medium">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#4a6650]"
            />
          </div>
          <div>
            <label className="text-[12px] text-gray-600 mb-1 block font-medium">Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#4a6650]"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#4a6650] text-white py-3.5 rounded-xl font-bold text-[14px] mt-2 disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="text-center mt-6 text-[12px] text-gray-500">
          Belum punya akun?{' '}
          <Link href="/auth/daftar" className="text-[#4a6650] font-semibold">Daftar Sekarang</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

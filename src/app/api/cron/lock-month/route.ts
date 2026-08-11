// =============================================
// src/app/api/cron/lock-month/route.ts
// Dipanggil otomatis oleh Vercel Cron tiap tanggal 1 — mengunci laporan bulan sebelumnya
// =============================================
import { NextRequest, NextResponse } from 'next/server'
import { lockMonth } from '@/lib/monthlyReport'

export async function GET(req: NextRequest) {
  // Lindungi endpoint ini supaya cuma bisa dipanggil oleh Vercel Cron (bukan publik)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Cron ini jalan tanggal 1, jadi yang perlu dikunci adalah BULAN SEBELUMNYA (yang baru saja selesai)
    const now = new Date()
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const year = prevMonthDate.getFullYear()
    const month = prevMonthDate.getMonth() + 1

    const result = await lockMonth(year, month)
    return NextResponse.json({ status: 'ok', ...result })
  } catch (error: any) {
    console.error('Lock month cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

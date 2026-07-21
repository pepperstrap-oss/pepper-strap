// =============================================
// src/app/api/doku/notification/route.ts
// Terima notifikasi pembayaran dari DOKU (opsional — kita tidak bergantung penuh ke ini,
// karena halaman sukses & admin juga bisa cek status manual lewat /api/doku/check-status)
// =============================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function mapStatus(dokuStatus: string) {
  const s = (dokuStatus || '').toUpperCase()
  if (s === 'SUCCESS') return { payment_status: 'paid', status: 'processing' }
  if (s === 'FAILED' || s === 'EXPIRED' || s === 'CANCELED' || s === 'CANCELLED') return { payment_status: 'unpaid', status: 'cancelled' }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('DOKU notification received:', JSON.stringify(body))

    const invoiceNumber = body?.order?.invoice_number
    const dokuStatus = body?.transaction?.status
    const mapped = mapStatus(dokuStatus)

    if (!invoiceNumber || !mapped) {
      return NextResponse.json({ status: 'ignored' })
    }

    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('order_number', invoiceNumber)
      .single()

    if (findError || !order) {
      console.error('Order not found for DOKU notification:', invoiceNumber)
      return NextResponse.json({ status: 'order_not_found' })
    }

    await supabaseAdmin
      .from('orders')
      .update({ ...mapped, updated_at: new Date().toISOString() })
      .eq('id', order.id)

    console.log(`Order ${order.order_number} updated via DOKU notification: ${mapped.status}/${mapped.payment_status}`)
    return NextResponse.json({ status: 'ok' })
  } catch (error: any) {
    console.error('DOKU notification error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 })
  }
}

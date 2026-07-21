// =============================================
// src/app/api/doku/check-status/route.ts
// Cek status pembayaran langsung ke DOKU (nggak bergantung notifikasi)
// =============================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getBaseUrl, generateSignatureGet, newRequestId, nowTimestamp } from '@/lib/doku'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function mapStatus(dokuStatus: string) {
  const s = (dokuStatus || '').toUpperCase()
  if (s === 'SUCCESS') return { payment_status: 'paid', status: 'processing' }
  if (s === 'FAILED' || s === 'EXPIRED' || s === 'CANCELED' || s === 'CANCELLED') return { payment_status: 'unpaid', status: 'cancelled' }
  return null // PENDING atau status lain — jangan ubah dulu
}

export async function GET(req: NextRequest) {
  try {
    const orderNumber = req.nextUrl.searchParams.get('order_number')
    if (!orderNumber) {
      return NextResponse.json({ error: 'order_number wajib diisi' }, { status: 400 })
    }

    const clientId = process.env.DOKU_CLIENT_ID!
    const secretKey = process.env.DOKU_SECRET_KEY!
    const isProduction = process.env.DOKU_IS_PRODUCTION === 'true'
    const baseUrl = getBaseUrl(isProduction)

    const requestId = newRequestId()
    const timestamp = nowTimestamp()
    const requestTarget = `/orders/v1/status/${orderNumber}`
    const signature = generateSignatureGet(requestId, timestamp, requestTarget, secretKey)

    const response = await fetch(`${baseUrl}${requestTarget}`, {
      method: 'GET',
      headers: {
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
    })
    const data = await response.json()
    console.log('DOKU check-status response:', JSON.stringify(data))

    const dokuStatus = data?.transaction?.status
    const mapped = mapStatus(dokuStatus)

    if (mapped) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id, status, payment_status')
        .eq('order_number', orderNumber)
        .single()

      if (order && (order.status !== mapped.status || order.payment_status !== mapped.payment_status)) {
        await supabaseAdmin
          .from('orders')
          .update({ ...mapped, updated_at: new Date().toISOString() })
          .eq('id', order.id)
      }
    }

    return NextResponse.json({ doku_status: dokuStatus, mapped })
  } catch (error: any) {
    console.error('DOKU check-status error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 })
  }
}

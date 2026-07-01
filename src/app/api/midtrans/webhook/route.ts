// =============================================
// src/app/api/midtrans/webhook/route.ts
// Webhook: Notifikasi status pembayaran dari Midtrans
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, transaction_status, fraud_status, signature_key, gross_amount } = body

    // Verifikasi signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const statusCode = body.status_code
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${statusCode}${gross_amount}${serverKey}`)
      .digest('hex')

    if (hash !== signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Update status order di database
    let paymentStatus = 'unpaid'
    let orderStatus = 'pending'

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        paymentStatus = 'paid'
        orderStatus = 'processing'
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
      orderStatus = 'cancelled'
    }

    await supabaseAdmin
      .from('orders')
      .update({ payment_status: paymentStatus, status: orderStatus, updated_at: new Date().toISOString() })
      .eq('midtrans_order_id', order_id)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

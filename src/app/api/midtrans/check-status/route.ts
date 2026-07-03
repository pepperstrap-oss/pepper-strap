// =============================================
// src/app/api/midtrans/check-status/route.ts
// Cek status pembayaran langsung ke Midtrans (polling backup)
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('order_id')
    if (!orderId) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const baseUrl = isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2'

    const authString = Buffer.from(`${serverKey}:`).toString('base64')
    const response = await fetch(`${baseUrl}/${orderId}/status`, {
      headers: { Authorization: `Basic ${authString}` },
    })

    const data = await response.json()
    const { transaction_status, fraud_status } = data

    // Update order di database sesuai status terbaru
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

    // Update database
    await supabaseAdmin
      .from('orders')
      .update({ payment_status: paymentStatus, status: orderStatus, updated_at: new Date().toISOString() })
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)

    return NextResponse.json({ 
      transaction_status, 
      payment_status: paymentStatus, 
      order_status: orderStatus 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Check status error' }, { status: 500 })
  }
}

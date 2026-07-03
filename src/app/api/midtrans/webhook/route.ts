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
    const { order_id, transaction_status, fraud_status, signature_key, gross_amount, status_code } = body

    console.log('Midtrans webhook received:', { order_id, transaction_status, status_code })

    // Verifikasi signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (hash !== signature_key) {
      console.error('Invalid signature:', { hash, signature_key })
      // Di sandbox, skip verifikasi signature untuk memudahkan testing
      const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
      if (isProduction) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      console.warn('Skipping signature check in sandbox mode')
    }

    // Tentukan status berdasarkan notifikasi Midtrans
    let paymentStatus = 'unpaid'
    let orderStatus = 'pending'

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        paymentStatus = 'paid'
        orderStatus = 'processing'
      }
    } else if (transaction_status === 'pending') {
      paymentStatus = 'unpaid'
      orderStatus = 'pending'
    } else if (transaction_status === 'cancel' || transaction_status === 'expire' || transaction_status === 'deny') {
      paymentStatus = 'unpaid'
      orderStatus = 'cancelled'
    } else if (transaction_status === 'refund') {
      paymentStatus = 'refunded'
      orderStatus = 'cancelled'
    }

    // Update order — coba match berdasarkan midtrans_order_id (UUID order) atau order_number
    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .or(`id.eq.${order_id},order_number.eq.${order_id}`)
      .single()

    if (findError || !order) {
      console.error('Order not found for:', order_id)
      // Return 200 supaya Midtrans tidak terus retry — log saja
      return NextResponse.json({ status: 'order_not_found', order_id })
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        payment_status: paymentStatus, 
        status: orderStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    console.log(`Order ${order.order_number} updated: ${orderStatus} / ${paymentStatus}`)
    return NextResponse.json({ status: 'ok', order_number: order.order_number })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

// =============================================
// src/app/api/doku/create-transaction/route.ts
// Buat transaksi DOKU Checkout (server-side)
// =============================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getBaseUrl, generateSignaturePost, newRequestId, nowTimestamp } from '@/lib/doku'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, orderNumber, items, customer, shippingCost, discountAmount } = body

    if (!orderId || !items?.length || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: 'Data pesanan tidak lengkap' }, { status: 400 })
    }

    const clientId = process.env.DOKU_CLIENT_ID!
    const secretKey = process.env.DOKU_SECRET_KEY!
    const isProduction = process.env.DOKU_IS_PRODUCTION === 'true'
    const baseUrl = getBaseUrl(isProduction)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    // DOKU cuma izinkan karakter: a-z A-Z 0-9 . - / + , = _ : ' @ %
    // Jadi nggak boleh pakai tanda kurung () — diganti pakai strip
    const sanitizeName = (s: string) => s.replace(/[()]/g, '').replace(/[^a-zA-Z0-9.\-/+,=_:'@% ]/g, '')
    const lineItems = items.map((i: any) => ({
      name: sanitizeName(`${i.name} - ${i.size}`).substring(0, 100),
      price: i.price,
      quantity: i.quantity,
    }))
    lineItems.push({ name: 'Ongkos Kirim', price: shippingCost || 0, quantity: 1 })

    const discount = Math.max(0, Number(discountAmount) || 0)
    if (discount > 0) {
      lineItems.push({ name: 'Diskon Promo', price: -discount, quantity: 1 })
    }

    const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
    const totalAmount = Math.max(0, subtotal + (shippingCost || 0) - discount)

    const requestBody = {
      order: {
        amount: totalAmount,
        invoice_number: orderNumber,
        currency: 'IDR',
        callback_url: `${siteUrl}/sukses?order=${orderNumber}`,
        callback_url_cancel: `${siteUrl}/keranjang`,
        line_items: lineItems,
        auto_redirect: true,
      },
      payment: {
        payment_due_date: 60, // menit
      },
      customer: {
        id: orderId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        country: 'ID',
      },
      additional_info: {
        // Kirim URL notifikasi langsung lewat request, tidak perlu setting manual di dashboard DOKU
        override_notification_url: `${siteUrl}/api/doku/notification`,
      },
    }

    const requestId = newRequestId()
    const timestamp = nowTimestamp()
    const requestTarget = '/checkout/v1/payment'
    const { signature } = generateSignaturePost(requestBody, requestId, timestamp, requestTarget, secretKey)

    const response = await fetch(`${baseUrl}${requestTarget}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()
    console.log('DOKU create-transaction response:', JSON.stringify(data))

    // URL pembayaran bisa ada di beberapa kemungkinan lokasi tergantung versi respons DOKU
    const paymentUrl = data?.response?.payment?.url || data?.payment?.url || data?.response?.payment?.checkout_url

    if (!paymentUrl) {
      console.error('DOKU create-transaction error:', data)
      throw new Error(data?.message?.[0] || data?.error?.message || 'Gagal membuat transaksi pembayaran DOKU')
    }

    await supabaseAdmin
      .from('orders')
      .update({ doku_invoice_number: orderNumber })
      .eq('id', orderId)

    return NextResponse.json({ url: paymentUrl })
  } catch (error: any) {
    console.error('DOKU create-transaction error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 })
  }
}

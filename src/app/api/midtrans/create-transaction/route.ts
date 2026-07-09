// =============================================
// src/app/api/midtrans/create-transaction/route.ts
// API Route: Buat transaksi Midtrans (server-side)
// =============================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// Supabase admin client (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, items, customer, shippingCost, discountAmount } = body
    if (!orderId || !items?.length || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: 'Data pesanan tidak lengkap' }, { status: 400 })
    }
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
    // Hitung total (subtotal produk + ongkir - diskon promo, kalau ada)
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const discount = Math.max(0, Number(discountAmount) || 0)
    const total = Math.max(0, subtotal + shippingCost - discount)
    // Siapkan daftar item untuk Midtrans — item_details harus totalnya sama persis dengan gross_amount
    const itemDetails = [
      ...items.map((item: any) => ({
        id: item.product_id,
        name: `${item.name} (${item.size})`.substring(0, 50),
        price: item.price,
        quantity: item.quantity,
      })),
      {
        id: 'SHIPPING',
        name: 'Ongkos Kirim',
        price: shippingCost,
        quantity: 1,
      },
    ]
    // Tambahkan baris diskon (nilai negatif) kalau ada promo yang dipakai
    if (discount > 0) {
      itemDetails.push({
        id: 'DISCOUNT',
        name: 'Diskon Promo',
        price: -discount,
        quantity: 1,
      })
    }
    // Siapkan payload Midtrans
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        shipping_address: {
          first_name: customer.name,
          phone: customer.phone,
          address: customer.address.street,
          city: customer.address.city,
          postal_code: customer.address.postal_code,
          country_code: 'IDN',
        },
      },
      enabled_payments: ['qris', 'gopay', 'shopeepay', 'dana', 'bca_va', 'bni_va', 'bri_va'],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/sukses?order=${orderId}`,
      },
      expiry: {
        unit: 'minutes',
        duration: 60,
      },
    }
    const authString = Buffer.from(`${serverKey}:`).toString('base64')
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!data.token) {
      throw new Error('Gagal mendapat token Midtrans: ' + JSON.stringify(data))
    }
    // Simpan token ke database
    await supabaseAdmin
      .from('orders')
      .update({ midtrans_token: data.token, midtrans_order_id: orderId })
      .eq('id', orderId)
    return NextResponse.json({ token: data.token, redirect_url: data.redirect_url })
  } catch (error: any) {
    console.error('Midtrans error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

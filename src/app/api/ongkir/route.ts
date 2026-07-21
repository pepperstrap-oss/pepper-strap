// =============================================
// src/app/api/ongkir/route.ts
// Hitung ongkir via api.co.id — hanya tampilkan JNE dan J&T
// =============================================
import { NextRequest, NextResponse } from 'next/server'

// Kurir yang boleh ditampilkan ke pembeli (sesuaikan di sini kalau nanti mau nambah/kurangi)
const ALLOWED_COURIERS = ['jne', 'jnt', 'j&t']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { destinationId, weight } = body
    if (!destinationId || !weight) {
      return NextResponse.json(
        { error: 'destinationId dan weight wajib diisi' },
        { status: 400 }
      )
    }
    const origin = process.env.RAJAONGKIR_ORIGIN_CITY_ID // kode village asal (10 digit)
    const apiKey = process.env.APICOID_API_KEY!
    if (!apiKey || !origin) {
      return NextResponse.json(
        { error: 'APICOID_API_KEY / RAJAONGKIR_ORIGIN_CITY_ID belum dikonfigurasi' },
        { status: 500 }
      )
    }
    // Konversi berat dari gram ke kilogram (api.co.id pakai KG)
    const weightKg = Math.max(1, Math.ceil(weight / 1000))
    const url = `https://use.api.co.id/expedition/shipping-cost?origin_village_code=${origin}&destination_village_code=${destinationId}&weight=${weightKg}`
    const response = await fetch(url, {
      headers: { 'x-api-co-id': apiKey },
    })
    const data = await response.json()
    if (!data.is_success || !data.data?.couriers) {
      return NextResponse.json({ results: [] })
    }
    // Format hasil ke struktur yang sama dengan sebelumnya, sekaligus filter cuma JNE & J&T
    const results = data.data.couriers
      .filter((c: any) => c.price > 0)
      .filter((c: any) => {
        const name = (c.courier_name || '').toLowerCase()
        const code = (c.courier_code || '').toLowerCase()
        return ALLOWED_COURIERS.some(k => name.includes(k) || code.includes(k))
      })
      .map((c: any) => ({
        courier: c.courier_name,
        service: c.courier_code,
        description: c.courier_name,
        cost: c.price,
        etd: c.estimation || '-',
      }))
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Ongkir API error:', error)
    return NextResponse.json(
      { error: 'Gagal menghitung ongkir' },
      { status: 500 }
    )
  }
}

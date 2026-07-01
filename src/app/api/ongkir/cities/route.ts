// =============================================
// src/app/api/ongkir/cities/route.ts
// Cari kelurahan/desa tujuan pengiriman (api.co.id)
// =============================================

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const apiKey = process.env.APICOID_API_KEY!

    if (!search || search.trim().length < 3) {
      return NextResponse.json({ results: [] })
    }

    // Cari kelurahan berdasarkan nama, max 15 hasil
    const url = `https://use.api.co.id/regional/indonesia/villages?name=${encodeURIComponent(search)}&page=1`

    const response = await fetch(url, {
      headers: { 'x-api-co-id': apiKey },
      next: { revalidate: 0 },
    })

    const data = await response.json()

    if (!data.is_success) {
      return NextResponse.json({ results: [] })
    }

    // Format hasil supaya mudah ditampilkan di UI
    const results = (data.data || []).slice(0, 15).map((v: any) => ({
      id: v.code,           // kode 10 digit kelurahan
      label: `${v.name}, Kec. ${v.district_name}, ${v.regency_name}, ${v.province_name}`,
      village_name: v.name,
      district_name: v.district_name,
      city_name: v.regency_name,
      province_name: v.province_name,
      postal_code: v.postal_code || '',
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Cities API error:', error)
    return NextResponse.json({ error: 'Gagal mencari lokasi' }, { status: 500 })
  }
}

// =============================================
// src/lib/monthlyReport.ts
// Hitung & kunci laporan performa toko untuk satu bulan tertentu
// =============================================
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function lockMonth(year: number, month: number) {
  // Rentang tanggal 1 bulan itu (UTC), sampai tanggal 1 bulan berikutnya
  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString()
  const endDate = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1)).toISOString()

  // Hanya hitung pesanan yang pembayarannya sudah lunas
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('id, total, order_items(quantity)')
    .eq('payment_status', 'paid')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  if (error) throw error

  const totalSales = (orders || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0)
  const totalProductsSold = (orders || []).reduce(
    (sum: number, o: any) => sum + (o.order_items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0),
    0
  )
  const orderCount = (orders || []).length

  const { error: upsertError } = await supabaseAdmin
    .from('monthly_reports')
    .upsert(
      {
        year,
        month,
        total_sales: totalSales,
        total_products_sold: totalProductsSold,
        order_count: orderCount,
        locked_at: new Date().toISOString(),
      },
      { onConflict: 'year,month' }
    )

  if (upsertError) throw upsertError

  return { year, month, total_sales: totalSales, total_products_sold: totalProductsSold, order_count: orderCount }
}

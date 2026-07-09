// =============================================
// src/components/order/OrderTimeline.tsx
// Timeline visual untuk status pesanan
// =============================================

const STEPS = [
  { key: 'pending', label: 'Pesanan Dibuat', icon: '🛒' },
  { key: 'paid', label: 'Pembayaran Diterima', icon: '✅' },
  { key: 'processing', label: 'Sedang Dikemas', icon: '📦' },
  { key: 'shipped', label: 'Dalam Pengiriman', icon: '🚚' },
  { key: 'delivered', label: 'Pesanan Sampai', icon: '🎉' },
]

export function OrderTimeline({
  status,
  orderDate,
  trackingNumber,
  courier,
}: {
  status: string
  orderDate: string
  trackingNumber?: string
  courier?: string
}) {
  const currentIndex = STEPS.findIndex(s => s.key === status)
  // Kalau status di luar tahap normal (misal 'cancelled'), jangan tampilkan timeline
  if (currentIndex === -1) return null

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5">
      <div className="text-[12px] font-semibold text-[#4a6650] mb-3">📍 Perjalanan Pesanan</div>
      <div>
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex
          const isLast = i === STEPS.length - 1

          const circleClass = isCompleted
            ? 'bg-[#4a6650] text-white'
            : isCurrent
            ? 'bg-white border-2 border-[#4a6650] text-[#4a6650]'
            : 'bg-gray-100 text-gray-300 border border-gray-200'

          const labelClass = isCompleted || isCurrent
            ? 'text-gray-800 font-semibold'
            : 'text-gray-400'

          return (
            <div key={step.key} className="flex gap-3">
              {/* Ikon + garis penghubung */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] flex-shrink-0 ${circleClass}`}>
                  {step.icon}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[20px] ${isCompleted ? 'bg-[#4a6650]' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Label & keterangan */}
              <div className={`${isLast ? 'pb-0' : 'pb-5'} pt-1`}>
                <div className={`text-[12px] ${labelClass}`}>{step.label}</div>
                {step.key === 'pending' && (
                  <div className="text-[10px] text-gray-400 mt-0.5">{fmtDate(orderDate)}</div>
                )}
                {step.key === 'shipped' && trackingNumber && (isCompleted || isCurrent) && (
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {courier ? `${courier} · ` : ''}Resi: {trackingNumber}
                  </div>
                )}
                {isCurrent && (
                  <div className="text-[10px] text-[#4a6650] font-semibold mt-0.5">● Tahap saat ini</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================
// src/components/product/ProductDescription.tsx
// Merapikan deskripsi produk: pisah jadi bagian berjudul + daftar poin
// =============================================
'use client'

type Section = { title: string; items: string[]; text: string }

function parseDescription(text: string): { intro: string; sections: Section[] } {
  if (!text) return { intro: '', sections: [] }

  // Cari judul bagian: tulisan HURUF BESAR SEMUA diikuti titik dua, misal "SPESIFIKASI:"
  const headerRegex = /([A-Z][A-Z\s&]{2,40}:)/g
  const parts = text.split(headerRegex)

  const intro = (parts[0] || '').trim()
  const sections: Section[] = []

  for (let i = 1; i < parts.length; i += 2) {
    const rawTitle = parts[i]
    const content = parts[i + 1] || ''
    if (!rawTitle) continue
    const title = rawTitle.replace(/:$/, '').trim()
    const items = content.split('•').map(s => s.trim()).filter(Boolean)
    sections.push({ title, items, text: items.length === 0 ? content.trim() : '' })
  }

  return { intro, sections }
}

export function ProductDescription({ description }: { description?: string | null }) {
  const { intro, sections } = parseDescription(description || '')

  // Kalau nggak kedeteksi ada bagian berjudul, tapi ada tanda "•", pecah jadi daftar poin sederhana
  if (sections.length === 0) {
    const bullets = (description || '').split('•').map(s => s.trim()).filter(Boolean)
    if (bullets.length > 1) {
      return (
        <div className="text-[12px] text-gray-500 leading-relaxed mb-4 space-y-1.5">
          <p>{bullets[0]}</p>
          <ul className="space-y-1">
            {bullets.slice(1).map((item, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-[#4a6650]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    return <p className="text-[12px] text-gray-500 leading-relaxed mb-4">{description}</p>
  }

  return (
    <div className="mb-4 space-y-3">
      {intro && <p className="text-[12px] text-gray-500 leading-relaxed">{intro}</p>}
      {sections.map((s, i) => (
        <div key={i}>
          <div className="text-[11px] font-bold text-[#4a6650] uppercase tracking-wide mb-1">{s.title}</div>
          {s.items.length > 0 ? (
            <ul className="space-y-1">
              {s.items.map((item, j) => (
                <li key={j} className="text-[12px] text-gray-500 leading-relaxed flex gap-1.5">
                  <span className="text-[#4a6650] flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-gray-500 leading-relaxed">{s.text}</p>
          )}
        </div>
      ))}
    </div>
  )
}

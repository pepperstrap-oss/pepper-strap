import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/layout/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Pepper Strap — Handmade Leather Watch Strap',
  description: 'Strap jam tangan kulit handmade premium. Dibuat dengan tangan, untuk gaya yang tak lekang oleh waktu.',
  keywords: 'strap jam tangan, leather watch strap, handmade, kulit asli',
  openGraph: {
    title: 'Pepper Strap',
    description: 'Strap jam tangan kulit handmade premium',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 2000,
              style: { background: '#333', color: '#fff', fontSize: '13px', borderRadius: '20px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

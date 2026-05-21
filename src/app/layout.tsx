import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'AgriMarket — Hasil Panen Segar Langsung dari Petani',
  description: 'Platform e-commerce yang menghubungkan petani lokal langsung dengan konsumen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  )
}

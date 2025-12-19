import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = { title: 'CVA Cotizador', description: 'Sistema de cotizaciones CVA Systems' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-cva-gray-100 min-h-screen font-sans">
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#fff', color: '#212121', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '12px 16px' } }} />
      </body>
    </html>
  )
}
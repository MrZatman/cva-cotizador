import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
export const metadata: Metadata = { title: 'CVA Cotizador', description: 'Sistema de cotizaciones CVA Systems' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-cva-gray-100 min-h-screen">
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#fff', color: '#212121', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '12px 16px' } }} />
      </body>
    </html>
  )
}

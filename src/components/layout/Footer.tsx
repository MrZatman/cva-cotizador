'use client'
import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="bg-white border-t border-cva-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cva-green rounded flex items-center justify-center"><span className="text-white font-bold text-sm">CVA</span></div>
            <span className="text-sm text-cva-gray-500">© {new Date().getFullYear()} CVA Systems</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/cotizaciones" className="text-sm text-cva-gray-600 hover:text-cva-green">Cotizaciones</Link>
            <Link href="/clientes" className="text-sm text-cva-gray-600 hover:text-cva-green">Clientes</Link>
            <Link href="/usuarios" className="text-sm text-cva-gray-600 hover:text-cva-green">Usuarios</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

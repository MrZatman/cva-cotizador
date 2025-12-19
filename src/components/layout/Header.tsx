'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Usuario } from '@/types'

interface ConfigItem {
  clave: string
  valor: string | null
}

export default function Header({ usuario }: { usuario: Usuario | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [nombreEmpresa, setNombreEmpresa] = useState('CVA Systems')
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchConfiguracion()
  }, [])

  const fetchConfiguracion = async () => {
    try {
      const { data } = await supabase.from('configuracion').select('*')
      data?.forEach((item: ConfigItem) => {
        if (item.clave === 'nombre_empresa' && item.valor) setNombreEmpresa(item.valor)
        if (item.clave === 'logo_url') setLogoUrl(item.valor)
      })
    } catch (e) {
      console.error('Error al cargar configuración')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-cva-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/cotizaciones" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={nombreEmpresa} className="h-10 max-w-[180px] object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 bg-cva-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CVA</span>
                </div>
                <span className="hidden sm:block text-cva-gray-900 font-semibold">{nombreEmpresa.replace('CVA ', '')}</span>
              </>
            )}
          </Link>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cva-gray-100">
              <div className="w-8 h-8 bg-cva-green rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm text-cva-gray-700">{usuario?.nombre || 'Usuario'}</span>
              <ChevronDown className="w-4 h-4 text-cva-gray-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium">{usuario?.nombre}</p>
                  <p className="text-xs text-cva-gray-500 truncate">{usuario?.email}</p>
                </div>
                <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cva-gray-50" onClick={() => setMenuOpen(false)}>
                  <Settings className="w-4 h-4" />Mi Perfil
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" />Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
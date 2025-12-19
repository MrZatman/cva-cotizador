'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Search, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Producto } from '@/types'

interface ProductoComboboxProps {
  value: string
  onChange: (value: string) => void
  onSelectProducto: (producto: Producto | null) => void
  placeholder?: string
  className?: string
}

export default function ProductoCombobox({
  value,
  onChange,
  onSelectProducto,
  placeholder = 'Buscar producto o escribir concepto...',
  className = '',
}: ProductoComboboxProps) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Cargar productos al montar
  useEffect(() => {
    fetchProductos()
  }, [])

  // Sincronizar valor externo
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      setProductos(data || [])
    } catch (e) {
      console.error('Error al cargar productos:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSelectProducto = (producto: Producto) => {
    setSearchTerm(producto.nombre)
    onChange(producto.nombre)
    onSelectProducto(producto)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSearchTerm('')
    onChange('')
    onSelectProducto(null)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Filtrar productos según búsqueda
  const filteredProductos = productos.filter((p) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.codigo?.toLowerCase().includes(term) ||
      p.descripcion?.toLowerCase().includes(term)
    )
  })

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cva-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-cva-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cva-green text-sm"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cva-gray-400 hover:text-cva-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-cva-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-cva-gray-500 text-sm">
              Cargando productos...
            </div>
          ) : (
            <>
              {/* Opción de texto libre si hay algo escrito */}
              {searchTerm && !productos.some((p) => p.nombre.toLowerCase() === searchTerm.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectProducto(null)
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-cva-gray-50 flex items-center gap-3 border-b border-cva-gray-100"
                >
                  <div className="w-8 h-8 bg-cva-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-cva-gray-500 text-xs">✏️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Usar: "{searchTerm}"</p>
                    <p className="text-xs text-cva-gray-500">Escribir concepto manualmente</p>
                  </div>
                </button>
              )}

              {/* Lista de productos */}
              {filteredProductos.length === 0 ? (
                <div className="p-4 text-center text-cva-gray-500 text-sm">
                  No se encontraron productos
                </div>
              ) : (
                filteredProductos.slice(0, 10).map((producto) => (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => handleSelectProducto(producto)}
                    className="w-full px-4 py-3 text-left hover:bg-cva-gray-50 flex items-center gap-3 border-b border-cva-gray-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-cva-green rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {producto.codigo && (
                          <span className="text-xs font-mono text-cva-gray-500">{producto.codigo}</span>
                        )}
                        <p className="text-sm font-medium truncate">{producto.nombre}</p>
                      </div>
                      {producto.descripcion && (
                        <p className="text-xs text-cva-gray-500 truncate">{producto.descripcion}</p>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-cva-green flex-shrink-0">
                      {formatCurrency(producto.precio)}
                    </div>
                  </button>
                ))
              )}

              {filteredProductos.length > 10 && (
                <div className="px-4 py-2 text-xs text-center text-cva-gray-500 bg-cva-gray-50">
                  Mostrando 10 de {filteredProductos.length} resultados. Escribe para filtrar más.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
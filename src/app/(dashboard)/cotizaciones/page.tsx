'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Loading, Select } from '@/components/ui'
import { AccordionItem } from '@/components/ui/Accordion'
import { Plus, Search, FileText, Edit, Trash2, Eye } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils/formatters'
import type { Cotizacion } from '@/types'
import toast from 'react-hot-toast'
export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [rangoFecha, setRangoFecha] = useState('30')
  const supabase = createClient()
  useEffect(() => { fetchCotizaciones() }, [rangoFecha])
  const fetchCotizaciones = async () => {
    setLoading(true)
    try {
      let query = supabase.from('cotizaciones').select('*, cliente:clientes(id, nombre, razon_social), creador:usuarios!cotizaciones_created_by_fkey(nombre)').order('created_at', { ascending: false })
      if (rangoFecha !== 'all') {
        const dias = rangoFecha === 'year' ? 365 : parseInt(rangoFecha)
        const fechaDesde = new Date(); fechaDesde.setDate(fechaDesde.getDate() - dias)
        query = query.gte('fecha_emision', fechaDesde.toISOString().split('T')[0])
      }
      const { data, error } = await query
      if (error) throw error
      const formatted = data?.map(c => ({ ...c, cliente_nombre: c.cliente?.nombre, cliente_razon_social: c.cliente?.razon_social, creado_por_nombre: c.creador?.nombre })) || []
      setCotizaciones(formatted)
    } catch (e) { toast.error('Error al cargar cotizaciones') }
    finally { setLoading(false) }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cotización?')) return
    try { const { error } = await supabase.from('cotizaciones').delete().eq('id', id); if (error) throw error; toast.success('Eliminada'); fetchCotizaciones() }
    catch (e) { toast.error('Error al eliminar') }
  }
  const filtered = cotizaciones.filter(c => c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || c.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || c.numero_cotizacion.toString().includes(searchTerm))
  if (loading) return <Loading text="Cargando cotizaciones..." />
  return (
    <div>
      <div className="mb-8"><h1 className="font-display text-4xl italic text-cva-green mb-2">Cotizaciones</h1></div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Link href="/cotizaciones/nueva"><Button className="flex items-center gap-2"><Plus className="w-4 h-4" />Crear nueva cotización</Button></Link>
        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:justify-end">
          <div className="w-full sm:w-48"><label className="block text-sm font-medium text-cva-gray-700 mb-1">Rango de fecha</label><Select value={rangoFecha} onChange={(e) => setRangoFecha(e.target.value)} options={[{ value: '7', label: 'Últimos 7 días' }, { value: '30', label: 'Últimos 30 días' }, { value: '90', label: 'Últimos 90 días' }, { value: 'year', label: 'Este año' }, { value: 'all', label: 'Todos' }]} /></div>
          <div className="w-full sm:w-64"><label className="block text-sm font-medium text-cva-gray-700 mb-1">&nbsp;</label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cva-gray-400" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-cva-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cva-green" /></div></div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12"><FileText className="w-12 h-12 text-cva-gray-300 mx-auto mb-4" /><p className="text-cva-gray-500">No hay cotizaciones</p><Link href="/cotizaciones/nueva"><Button variant="secondary" className="mt-4">Crear primera cotización</Button></Link></div>
      ) : (
        <div className="space-y-3">{filtered.map((c) => (
          <AccordionItem key={c.id} title={c.titulo} subtitle={`#${c.numero_cotizacion} | ${formatDate(c.fecha_emision)}`}>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div><p className="text-sm text-cva-gray-500">Cliente:</p><p className="font-medium">{c.cliente_nombre}</p></div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>{getStatusLabel(c.status)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-cva-gray-200">
                <div><p className="text-sm text-cva-gray-500">Subtotal</p><p className="text-lg font-semibold">{formatCurrency(c.subtotal)}</p></div>
                <div><p className="text-sm text-cva-gray-500">IVA 16%</p><p className="text-lg font-semibold">{formatCurrency(c.iva)}</p></div>
                <div><p className="text-sm text-cva-gray-500">Total</p><p className="text-lg font-bold text-cva-green">{formatCurrency(c.total)}</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/cotizaciones/${c.id}`}><Button variant="secondary" size="sm" className="flex items-center gap-1"><Eye className="w-4 h-4" />Ver</Button></Link>
                <Link href={`/cotizaciones/${c.id}?edit=true`}><Button variant="ghost" size="sm" className="flex items-center gap-1"><Edit className="w-4 h-4" />Editar</Button></Link>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-red-600 hover:bg-red-50" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" />Borrar</Button>
              </div>
            </div>
          </AccordionItem>
        ))}</div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, TextArea, Card, Loading } from '@/components/ui'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import ProductoCombobox from '@/components/cotizaciones/ProductoCombobox'
import type { Cliente, Producto } from '@/types'
import toast from 'react-hot-toast'

interface PartidaLocal { 
  id: string
  numero_partida: number
  modelo: string
  descripcion: string
  precio_unitario: number
  cantidad: number 
}

export default function NuevaCotizacionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState({ 
    titulo: '', 
    cliente_id: '', 
    realizado_por: '', 
    fecha_vigencia: '', 
    alcance_trabajo: '', 
    exclusiones: '', 
    observaciones: '', 
    condiciones_pago: '', 
    capacitacion: '' 
  })
  const [partidas, setPartidas] = useState<PartidaLocal[]>([])

  useEffect(() => { fetchClientes() }, [])

  const fetchClientes = async () => { 
    try { 
      const { data } = await supabase.from('clientes').select('*').order('nombre')
      setClientes(data || []) 
    } catch (e) { 
      toast.error('Error al cargar clientes') 
    } finally { 
      setLoadingClientes(false) 
    } 
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { 
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })) 
  }

  const addPartida = () => { 
    setPartidas([...partidas, { 
      id: crypto.randomUUID(), 
      numero_partida: partidas.length + 1, 
      modelo: '', 
      descripcion: '', 
      precio_unitario: 0, 
      cantidad: 1 
    }]) 
  }

  const updatePartida = (id: string, field: string, value: string | number) => { 
    setPartidas(partidas.map(p => p.id === id ? { ...p, [field]: value } : p)) 
  }

  const handleSelectProducto = (partidaId: string, producto: Producto | null) => {
    if (producto) {
      setPartidas(partidas.map(p => p.id === partidaId ? {
        ...p,
        modelo: producto.nombre,
        descripcion: producto.descripcion || '',
        precio_unitario: producto.precio,
      } : p))
    }
  }

  const removePartida = (id: string) => { 
    setPartidas(partidas.filter(p => p.id !== id).map((p, i) => ({ ...p, numero_partida: i + 1 }))) 
  }

  const subtotal = partidas.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo || !formData.cliente_id) { 
      toast.error('Título y cliente requeridos')
      return 
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: usuario } = await supabase.from('usuarios').select('id').eq('auth_id', user?.id).single()
      const { data: cot, error: cotError } = await supabase.from('cotizaciones').insert({ 
        titulo: formData.titulo, 
        cliente_id: formData.cliente_id, 
        created_by: usuario?.id, 
        realizado_por: formData.realizado_por, 
        fecha_vigencia: formData.fecha_vigencia || null, 
        alcance_trabajo: formData.alcance_trabajo, 
        exclusiones: formData.exclusiones, 
        observaciones: formData.observaciones, 
        condiciones_pago: formData.condiciones_pago, 
        capacitacion: formData.capacitacion, 
        subtotal, 
        iva, 
        total 
      }).select().single()
      if (cotError) throw cotError
      if (partidas.length > 0) {
        const { error: partError } = await supabase.from('cotizacion_partidas').insert(
          partidas.map((p, i) => ({ 
            cotizacion_id: cot.id, 
            numero_partida: i + 1, 
            modelo: p.modelo, 
            descripcion: p.descripcion, 
            precio_unitario: p.precio_unitario, 
            cantidad: p.cantidad, 
            orden: i 
          }))
        )
        if (partError) throw partError
      }
      toast.success('Cotización creada')
      router.push('/cotizaciones')
    } catch (e) { 
      console.error(e)
      toast.error('Error al crear') 
    } finally { 
      setLoading(false) 
    }
  }

  if (loadingClientes) return <Loading text="Cargando..." />

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cotizaciones">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="font-display text-3xl italic text-cva-green">Nueva Cotización</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Datos Generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Título" name="titulo" value={formData.titulo} onChange={handleInputChange} placeholder="Ej: Cámaras Starbucks" required />
            <Select label="Cliente" name="cliente_id" value={formData.cliente_id} onChange={handleInputChange} options={clientes.map(c => ({ value: c.id, label: c.nombre }))} required />
            <Input label="Realizado por" name="realizado_por" value={formData.realizado_por} onChange={handleInputChange} />
            <Input type="date" label="Vigencia" name="fecha_vigencia" value={formData.fecha_vigencia} onChange={handleInputChange} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Partidas</h2>
            <Button type="button" variant="outline" size="sm" onClick={addPartida}>
              <Plus className="w-4 h-4 mr-1" />Agregar
            </Button>
          </div>

          {partidas.length === 0 ? (
            <p className="text-center py-8 text-cva-gray-500">No hay partidas. Haz clic en "Agregar" para añadir una.</p>
          ) : (
            <div className="space-y-4">
              {partidas.map((p) => (
                <div key={p.id} className="border border-cva-gray-200 rounded-lg p-4 bg-cva-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-cva-gray-500">Partida #{p.numero_partida}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePartida(p.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-cva-gray-700 mb-1">Concepto</label>
                      <ProductoCombobox
                        value={p.modelo}
                        onChange={(value) => updatePartida(p.id, 'modelo', value)}
                        onSelectProducto={(producto) => handleSelectProducto(p.id, producto)}
                        placeholder="Buscar producto o escribir concepto..."
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-cva-gray-700 mb-1">Descripción</label>
                      <textarea
                        value={p.descripcion}
                        onChange={(e) => updatePartida(p.id, 'descripcion', e.target.value)}
                        placeholder="Descripción del producto o servicio..."
                        rows={2}
                        className="w-full px-4 py-2.5 border border-cva-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cva-green resize-none text-sm"
                      />
                    </div>
                    
                    <div>
                      <Input 
                        label="Precio Unitario" 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={p.precio_unitario} 
                        onChange={(e) => updatePartida(p.id, 'precio_unitario', parseFloat(e.target.value) || 0)} 
                      />
                    </div>
                    
                    <div>
                      <Input 
                        label="Cantidad" 
                        type="number" 
                        min="1"
                        value={p.cantidad} 
                        onChange={(e) => updatePartida(p.id, 'cantidad', parseInt(e.target.value) || 1)} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-cva-gray-200 flex justify-end">
                    <span className="text-sm text-cva-gray-500">Subtotal: </span>
                    <span className="text-sm font-semibold text-cva-green ml-2">{formatCurrency(p.precio_unitario * p.cantidad)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {partidas.length > 0 && (
            <div className="mt-6 pt-4 border-t flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span>IVA 16%:</span><span className="font-medium">{formatCurrency(iva)}</span></div>
                <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total:</span><span className="text-cva-green">{formatCurrency(total)}</span></div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Info Adicional</h2>
          <div className="space-y-4">
            <TextArea label="Alcance" name="alcance_trabajo" value={formData.alcance_trabajo} onChange={handleInputChange} />
            <TextArea label="Exclusiones" name="exclusiones" value={formData.exclusiones} onChange={handleInputChange} />
            <TextArea label="Observaciones" name="observaciones" value={formData.observaciones} onChange={handleInputChange} />
            <TextArea label="Condiciones de Pago" name="condiciones_pago" value={formData.condiciones_pago} onChange={handleInputChange} />
            <TextArea label="Capacitación" name="capacitacion" value={formData.capacitacion} onChange={handleInputChange} />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/cotizaciones"><Button type="button" variant="ghost">Cancelar</Button></Link>
          <Button type="submit" loading={loading}><Save className="w-4 h-4 mr-2" />Guardar</Button>
        </div>
      </form>
    </div>
  )
}
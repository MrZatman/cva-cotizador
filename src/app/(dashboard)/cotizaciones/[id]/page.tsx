'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, TextArea, Card, Loading } from '@/components/ui'
import { ArrowLeft, Plus, Trash2, Save, Edit, X } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils/formatters'
import type { Cotizacion, Cliente, CotizacionPartida } from '@/types'
import toast from 'react-hot-toast'
export default function CotizacionDetallePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  const supabase = createClient()
  const cotizacionId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(isEditMode)
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [partidas, setPartidas] = useState<CotizacionPartida[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  useEffect(() => { fetchData() }, [cotizacionId])
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: cot, error: cotError } = await supabase.from('cotizaciones').select('*, cliente:clientes(*)').eq('id', cotizacionId).single()
      if (cotError) throw cotError
      const { data: parts } = await supabase.from('cotizacion_partidas').select('*').eq('cotizacion_id', cotizacionId).order('orden')
      const { data: clientesData } = await supabase.from('clientes').select('*').order('nombre')
      setCotizacion({ ...cot, cliente_nombre: cot.cliente?.nombre })
      setPartidas(parts || [])
      setClientes(clientesData || [])
    } catch (e) { toast.error('Error al cargar'); router.push('/cotizaciones') }
    finally { setLoading(false) }
  }
  const handleInputChange = (field: string, value: string) => { if (!cotizacion) return; setCotizacion({ ...cotizacion, [field]: value }) }
  const updatePartida = (id: string, field: string, value: string | number) => { setPartidas(partidas.map(p => p.id === id ? { ...p, [field]: value } : p)) }
  const addPartida = () => { setPartidas([...partidas, { id: crypto.randomUUID(), cotizacion_id: cotizacionId, numero_partida: partidas.length + 1, modelo: '', descripcion: '', precio_unitario: 0, cantidad: 1, subtotal: 0, orden: partidas.length, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]) }
  const removePartida = (id: string) => { setPartidas(partidas.filter(p => p.id !== id)) }
  const subtotal = partidas.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva
  const handleSave = async () => {
    if (!cotizacion) return
    setSaving(true)
    try {
      await supabase.from('cotizaciones').update({ titulo: cotizacion.titulo, cliente_id: cotizacion.cliente_id, realizado_por: cotizacion.realizado_por, fecha_vigencia: cotizacion.fecha_vigencia || null, alcance_trabajo: cotizacion.alcance_trabajo, exclusiones: cotizacion.exclusiones, observaciones: cotizacion.observaciones, condiciones_pago: cotizacion.condiciones_pago, capacitacion: cotizacion.capacitacion, status: cotizacion.status }).eq('id', cotizacionId)
      await supabase.from('cotizacion_partidas').delete().eq('cotizacion_id', cotizacionId)
      if (partidas.length > 0) await supabase.from('cotizacion_partidas').insert(partidas.map((p, i) => ({ cotizacion_id: cotizacionId, numero_partida: i + 1, modelo: p.modelo, descripcion: p.descripcion, precio_unitario: p.precio_unitario, cantidad: p.cantidad, orden: i })))
      toast.success('Guardado')
      setEditing(false)
      fetchData()
    } catch (e) { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }
  if (loading) return <Loading text="Cargando..." />
  if (!cotizacion) return <div>No encontrado</div>
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4"><Link href="/cotizaciones"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link><div><h1 className="font-display text-3xl italic text-cva-green">Cotización #{cotizacion.numero_cotizacion}</h1><p className="text-cva-gray-500">{cotizacion.titulo}</p></div></div>
        <div className="flex items-center gap-2">{editing ? (<><Button variant="ghost" onClick={() => { setEditing(false); fetchData() }}><X className="w-4 h-4 mr-1" />Cancelar</Button><Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-1" />Guardar</Button></>) : (<Button variant="secondary" onClick={() => setEditing(true)}><Edit className="w-4 h-4 mr-1" />Editar</Button>)}</div>
      </div>
      <div className="mb-6">{editing ? <Select label="Estado" value={cotizacion.status} onChange={(e) => handleInputChange('status', e.target.value)} options={[{ value: 'borrador', label: 'Borrador' }, { value: 'enviada', label: 'Enviada' }, { value: 'aprobada', label: 'Aprobada' }, { value: 'rechazada', label: 'Rechazada' }]} /> : <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(cotizacion.status)}`}>{getStatusLabel(cotizacion.status)}</span>}</div>
      <Card className="mb-6"><h2 className="text-lg font-semibold mb-4">Datos Generales</h2>{editing ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Título" value={cotizacion.titulo} onChange={(e) => handleInputChange('titulo', e.target.value)} /><Select label="Cliente" value={cotizacion.cliente_id} onChange={(e) => handleInputChange('cliente_id', e.target.value)} options={clientes.map(c => ({ value: c.id, label: c.nombre }))} /><Input label="Realizado por" value={cotizacion.realizado_por || ''} onChange={(e) => handleInputChange('realizado_por', e.target.value)} /><Input type="date" label="Vigencia" value={cotizacion.fecha_vigencia?.split('T')[0] || ''} onChange={(e) => handleInputChange('fecha_vigencia', e.target.value)} /></div> : <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div><p className="text-sm text-cva-gray-500">Cliente</p><p className="font-medium">{cotizacion.cliente_nombre}</p></div><div><p className="text-sm text-cva-gray-500">Realizado por</p><p className="font-medium">{cotizacion.realizado_por || '-'}</p></div><div><p className="text-sm text-cva-gray-500">Emisión</p><p className="font-medium">{formatDate(cotizacion.fecha_emision)}</p></div><div><p className="text-sm text-cva-gray-500">Vigencia</p><p className="font-medium">{cotizacion.fecha_vigencia ? formatDate(cotizacion.fecha_vigencia) : '-'}</p></div></div>}</Card>
      <Card className="mb-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Partidas</h2>{editing && <Button variant="secondary" size="sm" onClick={addPartida}><Plus className="w-4 h-4 mr-1" />Agregar</Button>}</div>
        <div className="overflow-x-auto"><table className="w-full"><thead className="bg-cva-gray-100"><tr><th className="px-4 py-3 text-left text-sm">#</th><th className="px-4 py-3 text-left text-sm">Modelo</th><th className="px-4 py-3 text-left text-sm">Descripción</th><th className="px-4 py-3 text-right text-sm">P.U.</th><th className="px-4 py-3 text-right text-sm">Cant.</th><th className="px-4 py-3 text-right text-sm">Subtotal</th>{editing && <th></th>}</tr></thead><tbody className="divide-y">{partidas.map((p, i) => (<tr key={p.id}><td className="px-4 py-3 text-sm">{i + 1}</td><td className="px-4 py-3">{editing ? <Input value={p.modelo || ''} onChange={(e) => updatePartida(p.id, 'modelo', e.target.value)} className="text-sm" /> : <span className="text-sm">{p.modelo || '-'}</span>}</td><td className="px-4 py-3">{editing ? <Input value={p.descripcion || ''} onChange={(e) => updatePartida(p.id, 'descripcion', e.target.value)} className="text-sm" /> : <span className="text-sm">{p.descripcion || '-'}</span>}</td><td className="px-4 py-3 text-right">{editing ? <Input type="number" value={p.precio_unitario} onChange={(e) => updatePartida(p.id, 'precio_unitario', parseFloat(e.target.value) || 0)} className="text-sm text-right w-28" /> : <span className="text-sm">{formatCurrency(p.precio_unitario)}</span>}</td><td className="px-4 py-3 text-right">{editing ? <Input type="number" value={p.cantidad} onChange={(e) => updatePartida(p.id, 'cantidad', parseInt(e.target.value) || 1)} className="text-sm text-right w-20" /> : <span className="text-sm">{p.cantidad}</span>}</td><td className="px-4 py-3 text-right font-medium">{formatCurrency(p.precio_unitario * p.cantidad)}</td>{editing && <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => removePartida(p.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button></td>}</tr>))}</tbody></table></div>
        <div className="mt-4 pt-4 border-t flex justify-end"><div className="w-64 space-y-2"><div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>IVA 16%:</span><span className="font-medium">{formatCurrency(iva)}</span></div><div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total:</span><span className="text-cva-green">{formatCurrency(total)}</span></div></div></div>
      </Card>
      <Card><h2 className="text-lg font-semibold mb-4">Info Adicional</h2>{editing ? <div className="space-y-4"><TextArea label="Alcance" value={cotizacion.alcance_trabajo || ''} onChange={(e) => handleInputChange('alcance_trabajo', e.target.value)} /><TextArea label="Exclusiones" value={cotizacion.exclusiones || ''} onChange={(e) => handleInputChange('exclusiones', e.target.value)} /><TextArea label="Observaciones" value={cotizacion.observaciones || ''} onChange={(e) => handleInputChange('observaciones', e.target.value)} /><TextArea label="Condiciones de Pago" value={cotizacion.condiciones_pago || ''} onChange={(e) => handleInputChange('condiciones_pago', e.target.value)} /><TextArea label="Capacitación" value={cotizacion.capacitacion || ''} onChange={(e) => handleInputChange('capacitacion', e.target.value)} /></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{cotizacion.alcance_trabajo && <div><h3 className="font-medium mb-2">Alcance</h3><p className="text-sm text-cva-gray-600 whitespace-pre-wrap">{cotizacion.alcance_trabajo}</p></div>}{cotizacion.exclusiones && <div><h3 className="font-medium mb-2">Exclusiones</h3><p className="text-sm text-cva-gray-600 whitespace-pre-wrap">{cotizacion.exclusiones}</p></div>}{cotizacion.observaciones && <div><h3 className="font-medium mb-2">Observaciones</h3><p className="text-sm text-cva-gray-600 whitespace-pre-wrap">{cotizacion.observaciones}</p></div>}{cotizacion.condiciones_pago && <div><h3 className="font-medium mb-2">Condiciones de Pago</h3><p className="text-sm text-cva-gray-600 whitespace-pre-wrap">{cotizacion.condiciones_pago}</p></div>}</div>}</Card>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, Modal, Loading } from '@/components/ui'
import { AccordionItem } from '@/components/ui/Accordion'
import { Plus, Search, Users, Edit, Trash2 } from 'lucide-react'
import { REGIMENES_FISCALES } from '@/constants'
import { formatRFC } from '@/lib/utils/formatters'
import { validateClienteForm } from '@/lib/utils/validators'
import type { Cliente, ClienteFormData } from '@/types'
import toast from 'react-hot-toast'

const emptyForm: ClienteFormData = { nombre: '', razon_social: '', rfc: '', domicilio_fiscal: '', email: '', telefono: '', regimen_fiscal: '' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState<ClienteFormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchClientes() }, [])

  const fetchClientes = async () => { setLoading(true); try { const { data } = await supabase.from('clientes').select('*').order('nombre'); setClientes(data || []) } catch (e) { toast.error('Error al cargar') } finally { setLoading(false) } }

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) { setEditingCliente(cliente); setFormData({ nombre: cliente.nombre, razon_social: cliente.razon_social || '', rfc: cliente.rfc || '', domicilio_fiscal: cliente.domicilio_fiscal || '', email: cliente.email || '', telefono: cliente.telefono || '', regimen_fiscal: cliente.regimen_fiscal || '' }) }
    else { setEditingCliente(null); setFormData(emptyForm) }
    setErrors({}); setModalOpen(true)
  }

  const handleCloseModal = () => { setModalOpen(false); setEditingCliente(null); setFormData(emptyForm); setErrors({}) }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { let val = e.target.value; if (e.target.name === 'rfc') val = formatRFC(val); setFormData(prev => ({ ...prev, [e.target.name]: val })); if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' })) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateClienteForm(formData); if (!validation.valid) { setErrors(validation.errors); return }
    setSaving(true)
    try {
      if (editingCliente) { await supabase.from('clientes').update(formData).eq('id', editingCliente.id); toast.success('Actualizado') }
      else { await supabase.from('clientes').insert(formData); toast.success('Creado') }
      handleCloseModal(); fetchClientes()
    } catch (e: any) { toast.error(e.code === '23505' ? 'RFC duplicado' : 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar cliente?')) return
    try { const { error } = await supabase.from('clientes').delete().eq('id', id); if (error?.code === '23503') { toast.error('Tiene cotizaciones asociadas'); return }; toast.success('Eliminado'); fetchClientes() }
    catch (e) { toast.error('Error al eliminar') }
  }

  const filtered = clientes.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) || c.rfc?.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) return <Loading text="Cargando clientes..." />

  return (
    <div>
      <div className="mb-8"><h1 className="font-display text-4xl italic text-cva-green mb-2">Clientes</h1></div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button variant="outline" onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />Agregar Cliente
        </Button>
        <div className="flex-1 flex justify-end"><div className="w-full sm:w-64 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cva-gray-400" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-cva-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cva-green" /></div></div>
      </div>
      {filtered.length === 0 ? <div className="text-center py-12"><Users className="w-12 h-12 text-cva-gray-300 mx-auto mb-4" /><p className="text-cva-gray-500">{searchTerm ? 'No encontrados' : 'No hay clientes'}</p></div> : (
        <div className="space-y-3">{filtered.map((c) => (
          <AccordionItem key={c.id} title={c.nombre} subtitle={c.razon_social || undefined}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{c.rfc && <div><p className="text-sm text-cva-gray-500">RFC</p><p className="font-medium">{c.rfc}</p></div>}{c.email && <div><p className="text-sm text-cva-gray-500">Email</p><p className="font-medium">{c.email}</p></div>}{c.telefono && <div><p className="text-sm text-cva-gray-500">Teléfono</p><p className="font-medium">{c.telefono}</p></div>}{c.regimen_fiscal && <div><p className="text-sm text-cva-gray-500">Régimen</p><p className="font-medium">{REGIMENES_FISCALES.find(r => r.value === c.regimen_fiscal)?.label || c.regimen_fiscal}</p></div>}{c.domicilio_fiscal && <div className="sm:col-span-2"><p className="text-sm text-cva-gray-500">Domicilio</p><p className="font-medium">{c.domicilio_fiscal}</p></div>}</div>
              <div className="flex gap-2 pt-2 border-t"><Button variant="secondary" size="sm" onClick={() => handleOpenModal(c)} className="flex items-center gap-1"><Edit className="w-4 h-4" />Editar</Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="flex items-center gap-1 text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" />Eliminar</Button></div>
            </div>
          </AccordionItem>
        ))}</div>
      )}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Nombre / Alias" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: OXXO" error={errors.nombre} required /><Input label="Razón Social" name="razon_social" value={formData.razon_social} onChange={handleInputChange} /><Input label="RFC" name="rfc" value={formData.rfc} onChange={handleInputChange} placeholder="XXXX000000XXX" error={errors.rfc} maxLength={13} /><Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} /><Input label="Teléfono" name="telefono" value={formData.telefono} onChange={handleInputChange} /><Select label="Régimen Fiscal" name="regimen_fiscal" value={formData.regimen_fiscal} onChange={handleInputChange} options={REGIMENES_FISCALES} /></div>
          <Input label="Domicilio Fiscal" name="domicilio_fiscal" value={formData.domicilio_fiscal} onChange={handleInputChange} />
          <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button><Button type="submit" loading={saving}>{editingCliente ? 'Guardar' : 'Crear'}</Button></div>
        </form>
      </Modal>
    </div>
  )
}
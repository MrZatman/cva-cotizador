'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Modal, Loading, Card } from '@/components/ui'
import { Search, UserCog, Edit, Check, X, User } from 'lucide-react'
import type { Usuario, Permisos } from '@/types'
import toast from 'react-hot-toast'
const defaultPermisos: Permisos = { cotizaciones: { crear: true, editar: true, borrar: false }, clientes: { crear: true, editar: true, borrar: false }, usuarios: { crear: false, editar: false, borrar: false } }
export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', permisos: defaultPermisos })
  const supabase = createClient()
  useEffect(() => { fetchUsuarios() }, [])
  const fetchUsuarios = async () => { setLoading(true); try { const { data } = await supabase.from('usuarios').select('*').order('nombre'); setUsuarios(data || []) } catch (e) { toast.error('Error al cargar') } finally { setLoading(false) } }
  const handleOpenModal = (u: Usuario) => { setEditingUsuario(u); setFormData({ nombre: u.nombre, email: u.email, telefono: u.telefono || '', permisos: u.permisos || defaultPermisos }); setModalOpen(true) }
  const handleCloseModal = () => { setModalOpen(false); setEditingUsuario(null) }
  const handlePermisoChange = (modulo: keyof Permisos, accion: string, value: boolean) => { setFormData(prev => ({ ...prev, permisos: { ...prev.permisos, [modulo]: { ...prev.permisos[modulo], [accion]: value } } })) }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingUsuario || !formData.nombre) return
    setSaving(true)
    try { await supabase.from('usuarios').update({ nombre: formData.nombre, telefono: formData.telefono, permisos: formData.permisos }).eq('id', editingUsuario.id); toast.success('Actualizado'); handleCloseModal(); fetchUsuarios() }
    catch (e) { toast.error('Error al guardar') } finally { setSaving(false) }
  }
  const handleToggleActivo = async (u: Usuario) => { try { await supabase.from('usuarios').update({ activo: !u.activo }).eq('id', u.id); toast.success(u.activo ? 'Desactivado' : 'Activado'); fetchUsuarios() } catch (e) { toast.error('Error') } }
  const filtered = usuarios.filter(u => u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  if (loading) return <Loading text="Cargando usuarios..." />
  return (
    <div>
      <div className="mb-8"><h1 className="font-display text-4xl italic text-cva-green mb-2">Usuarios</h1></div>
      <div className="flex justify-end mb-6"><div className="w-full sm:w-64 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cva-gray-400" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-cva-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cva-green" /></div></div>
      {filtered.length === 0 ? <div className="text-center py-12"><UserCog className="w-12 h-12 text-cva-gray-300 mx-auto mb-4" /><p className="text-cva-gray-500">No hay usuarios</p></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map((u) => (
          <Card key={u.id} className="relative">
            <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.activo ? 'Activo' : 'Inactivo'}</div>
            <div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 bg-cva-green rounded-full flex items-center justify-center"><User className="w-7 h-7 text-white" /></div><div className="min-w-0"><h3 className="font-semibold truncate">{u.nombre}</h3><p className="text-sm text-cva-gray-500 truncate">{u.email}</p></div></div>
            <div className="border-t pt-4 mb-4"><p className="text-xs font-medium text-cva-gray-500 mb-2">PERMISOS</p><div className="space-y-2">{(['cotizaciones', 'clientes', 'usuarios'] as const).map((m) => (<div key={m} className="flex items-center justify-between text-sm"><span className="capitalize">{m}</span><div className="flex gap-2">{(['crear', 'editar', 'borrar'] as const).map((a) => (<span key={a} className={`px-1.5 py-0.5 rounded text-xs ${u.permisos?.[m]?.[a] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{a.charAt(0).toUpperCase()}</span>))}</div></div>))}</div></div>
            <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => handleOpenModal(u)} className="flex-1"><Edit className="w-4 h-4 mr-1" />Editar</Button><Button variant="ghost" size="sm" onClick={() => handleToggleActivo(u)} className={u.activo ? 'text-red-600' : 'text-green-600'}>{u.activo ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}</Button></div>
          </Card>
        ))}</div>
      )}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Editar Usuario" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} required /><Input label="Email" type="email" value={formData.email} disabled helperText="No se puede cambiar" /><Input label="Teléfono" value={formData.telefono} onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} /></div>
          <div className="border-t pt-4"><h3 className="font-medium mb-4">Permisos</h3><div className="space-y-4">{(['cotizaciones', 'clientes', 'usuarios'] as const).map((m) => (<div key={m} className="flex items-center justify-between"><span className="capitalize font-medium">{m}</span><div className="flex gap-4">{(['crear', 'editar', 'borrar'] as const).map((a) => (<label key={a} className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={formData.permisos[m][a]} onChange={(e) => handlePermisoChange(m, a, e.target.checked)} className="w-4 h-4 text-cva-green rounded" /><span className="text-sm capitalize">{a}</span></label>))}</div></div>))}</div></div>
          <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button><Button type="submit" loading={saving}>Guardar</Button></div>
        </form>
      </Modal>
    </div>
  )
}

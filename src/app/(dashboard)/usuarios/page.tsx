'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Modal, Loading, Card } from '@/components/ui'
import { Plus, Search, UserCog, Edit, Check, X, User, Shield } from 'lucide-react'
import { useAdmin } from '@/lib/hooks/useAdmin'
import toast from 'react-hot-toast'

export default function UsuariosPage() {
  const router = useRouter()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', is_admin: false, newPassword: '' })
  const [newUserData, setNewUserData] = useState({ nombre: '', email: '', password: '', is_admin: false })
  const supabase = createClient()

  // Protección: redirigir si no es admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('No tienes permisos para ver esta página')
      router.push('/cotizaciones')
    }
  }, [isAdmin, adminLoading, router])

  useEffect(() => { 
    if (isAdmin) fetchUsuarios() 
  }, [isAdmin])

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('usuarios').select('*').order('nombre')
      if (error) throw error
      setUsuarios(data || [])
    } catch (e) {
      toast.error('Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (u: any) => {
    setEditingUsuario(u)
    setFormData({ 
      nombre: u.nombre, 
      email: u.email, 
      telefono: u.telefono || '', 
      is_admin: u.is_admin || false,
      newPassword: ''
    })
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingUsuario(null)
    setFormData({ nombre: '', email: '', telefono: '', is_admin: false, newPassword: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUsuario || !formData.nombre) return
    setSaving(true)
    try {
      // Actualizar datos en tabla usuarios
      const { error } = await supabase
        .from('usuarios')
        .update({ 
          nombre: formData.nombre, 
          telefono: formData.telefono,
          is_admin: formData.is_admin
        })
        .eq('id', editingUsuario.id)
      if (error) throw error

      // Si hay nueva contraseña, actualizarla via API
      if (formData.newPassword && formData.newPassword.length >= 6) {
        const res = await fetch('/api/usuarios/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: editingUsuario.auth_id, 
            newPassword: formData.newPassword 
          })
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error al cambiar contraseña')
        }
      }

      toast.success('Actualizado')
      handleCloseModal()
      fetchUsuarios()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserData.email || !newUserData.password || !newUserData.nombre) {
      toast.error('Todos los campos son requeridos')
      return
    }
    if (newUserData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      // Si es admin, actualizar el campo is_admin
      if (newUserData.is_admin && data.user) {
        await supabase
          .from('usuarios')
          .update({ is_admin: true })
          .eq('auth_id', data.user.id)
      }
      
      toast.success('Usuario creado')
      setCreateModalOpen(false)
      setNewUserData({ nombre: '', email: '', password: '', is_admin: false })
      fetchUsuarios()
    } catch (e: any) {
      toast.error(e.message || 'Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActivo = async (u: any) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: !u.activo })
        .eq('id', u.id)
      if (error) throw error
      toast.success(u.activo ? 'Desactivado' : 'Activado')
      fetchUsuarios()
    } catch (e) {
      toast.error('Error')
    }
  }

  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Mostrar loading mientras verifica permisos
  if (adminLoading || !isAdmin) return <Loading text="Verificando permisos..." />
  if (loading) return <Loading text="Cargando usuarios..." />

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl italic text-cva-green mb-2">Usuarios</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button variant="outline" onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Crear Usuario
        </Button>
        <div className="flex-1 flex justify-end">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cva-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cva-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cva-green"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <UserCog className="w-12 h-12 text-cva-gray-300 mx-auto mb-4" />
          <p className="text-cva-gray-500">No hay usuarios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <Card key={u.id} className="relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {u.is_admin && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                    <Shield className="w-3 h-3" />Admin
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${u.is_admin ? 'bg-yellow-500' : 'bg-cva-green'}`}>
                  {u.is_admin ? <Shield className="w-7 h-7 text-white" /> : <User className="w-7 h-7 text-white" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{u.nombre}</h3>
                  <p className="text-sm text-cva-gray-500 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleOpenModal(u)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleToggleActivo(u)} className={u.activo ? 'text-red-600' : 'text-green-600'}>
                  {u.activo ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Editar */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Editar Usuario">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nombre" 
            value={formData.nombre} 
            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            value={formData.email} 
            disabled 
            helperText="No se puede cambiar" 
          />
          <Input 
            label="Teléfono" 
            value={formData.telefono} 
            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} 
          />
          <Input 
            label="Nueva Contraseña" 
            type="password" 
            value={formData.newPassword} 
            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))} 
            placeholder="Dejar vacío para no cambiar"
            helperText="Mínimo 6 caracteres"
          />
          
          {/* Checkbox Admin */}
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <input
              type="checkbox"
              id="is_admin"
              checked={formData.is_admin}
              onChange={(e) => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
              className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
            />
            <label htmlFor="is_admin" className="flex items-center gap-2 cursor-pointer">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Administrador</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={saving}>Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Crear Usuario */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Crear Usuario">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nombre"
            value={newUserData.nombre}
            onChange={(e) => setNewUserData(prev => ({ ...prev, nombre: e.target.value }))}
            placeholder="Nombre completo"
            required
          />
          <Input
            label="Email"
            type="email"
            value={newUserData.email}
            onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="correo@ejemplo.com"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={newUserData.password}
            onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
            required
          />
          
          {/* Checkbox Admin */}
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <input
              type="checkbox"
              id="new_is_admin"
              checked={newUserData.is_admin}
              onChange={(e) => setNewUserData(prev => ({ ...prev, is_admin: e.target.checked }))}
              className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
            />
            <label htmlFor="new_is_admin" className="flex items-center gap-2 cursor-pointer">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Administrador</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear Usuario</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, Loading } from '@/components/ui'
import { User, Save, Lock } from 'lucide-react'
import type { Usuario } from '@/types'
import toast from 'react-hot-toast'
export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', telefono: '' })
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' })
  const supabase = createClient()
  useEffect(() => { fetchUsuario() }, [])
  const fetchUsuario = async () => { try { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; const { data } = await supabase.from('usuarios').select('*').eq('auth_id', user.id).single(); setUsuario(data); setFormData({ nombre: data.nombre, telefono: data.telefono || '' }) } catch (e) { toast.error('Error al cargar') } finally { setLoading(false) } }
  const handleSaveProfile = async (e: React.FormEvent) => { e.preventDefault(); if (!usuario || !formData.nombre) { toast.error('Nombre requerido'); return }; setSaving(true); try { await supabase.from('usuarios').update({ nombre: formData.nombre, telefono: formData.telefono }).eq('id', usuario.id); toast.success('Actualizado'); fetchUsuario() } catch (e) { toast.error('Error al guardar') } finally { setSaving(false) } }
  const handleChangePassword = async (e: React.FormEvent) => { e.preventDefault(); if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('No coinciden'); return }; if (passwordData.newPassword.length < 6) { toast.error('Mínimo 6 caracteres'); return }; setChangingPassword(true); try { await supabase.auth.updateUser({ password: passwordData.newPassword }); toast.success('Contraseña actualizada'); setPasswordData({ newPassword: '', confirmPassword: '' }) } catch (e: any) { toast.error(e.message || 'Error') } finally { setChangingPassword(false) } }
  if (loading) return <Loading text="Cargando perfil..." />
  if (!usuario) return <div>Error al cargar</div>
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8"><h1 className="font-display text-4xl italic text-cva-green mb-2">Mi Perfil</h1></div>
      <Card className="mb-6"><div className="flex items-center gap-4"><div className="w-20 h-20 bg-cva-green rounded-full flex items-center justify-center"><User className="w-10 h-10 text-white" /></div><div><h2 className="text-xl font-semibold">{usuario.nombre}</h2><p className="text-cva-gray-500">{usuario.email}</p></div></div></Card>
      <Card className="mb-6"><h3 className="text-lg font-semibold mb-4">Información Personal</h3><form onSubmit={handleSaveProfile} className="space-y-4"><Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} required /><Input label="Email" value={usuario.email} disabled helperText="No se puede cambiar" /><Input label="Teléfono" value={formData.telefono} onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} /><div className="flex justify-end"><Button type="submit" loading={saving}><Save className="w-4 h-4 mr-2" />Guardar</Button></div></form></Card>
      <Card className="mb-6"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Lock className="w-5 h-5" />Cambiar Contraseña</h3><form onSubmit={handleChangePassword} className="space-y-4"><Input type="password" label="Nueva Contraseña" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Mínimo 6 caracteres" /><Input type="password" label="Confirmar" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} /><div className="flex justify-end"><Button type="submit" variant="secondary" loading={changingPassword} disabled={!passwordData.newPassword || !passwordData.confirmPassword}>Cambiar</Button></div></form></Card>
      <Card><h3 className="text-lg font-semibold mb-4">Mis Permisos</h3><div className="space-y-3">{(['cotizaciones', 'clientes', 'usuarios'] as const).map((m) => (<div key={m} className="flex items-center justify-between py-2 border-b last:border-0"><span className="capitalize font-medium">{m}</span><div className="flex gap-3">{(['crear', 'editar', 'borrar'] as const).map((a) => (<span key={a} className={`px-2 py-1 rounded text-xs font-medium ${usuario.permisos?.[m]?.[a] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{a}</span>))}</div></div>))}</div><p className="text-sm text-cva-gray-500 mt-4">Contacta a un admin para cambiar permisos.</p></Card>
    </div>
  )
}

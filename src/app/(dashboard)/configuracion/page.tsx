'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, Loading } from '@/components/ui'
import { Upload, Trash2, Save, Building2 } from 'lucide-react'
import { useAdmin } from '@/lib/hooks/useAdmin'
import toast from 'react-hot-toast'

interface ConfigItem {
  clave: string
  valor: string | null
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('No tienes permisos para ver esta página')
      router.push('/cotizaciones')
    }
  }, [isAdmin, adminLoading, router])

  useEffect(() => {
    if (isAdmin) fetchConfiguracion()
  }, [isAdmin])

  const fetchConfiguracion = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
      
      if (error) throw error
      
      data?.forEach((item: ConfigItem) => {
        if (item.clave === 'nombre_empresa') setNombreEmpresa(item.valor || '')
        if (item.clave === 'logo_url') setLogoUrl(item.valor)
      })
    } catch (e) {
      toast.error('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNombre = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('configuracion')
        .update({ valor: nombreEmpresa, updated_at: new Date().toISOString() })
        .eq('clave', 'nombre_empresa')
      
      if (error) throw error
      toast.success('Nombre guardado')
    } catch (e) {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB')
      return
    }

    setUploading(true)
    try {
      if (logoUrl) {
        const oldPath = logoUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('logos').remove([oldPath])
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      const newLogoUrl = urlData.publicUrl

      const { error: dbError } = await supabase
        .from('configuracion')
        .update({ valor: newLogoUrl, updated_at: new Date().toISOString() })
        .eq('clave', 'logo_url')

      if (dbError) throw dbError

      setLogoUrl(newLogoUrl)
      toast.success('Logo subido correctamente')
    } catch (e) {
      console.error(e)
      toast.error('Error al subir logo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteLogo = async () => {
    if (!logoUrl) return
    if (!confirm('¿Eliminar el logo?')) return

    setUploading(true)
    try {
      const fileName = logoUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('logos').remove([fileName])
      }

      const { error } = await supabase
        .from('configuracion')
        .update({ valor: null, updated_at: new Date().toISOString() })
        .eq('clave', 'logo_url')

      if (error) throw error

      setLogoUrl(null)
      toast.success('Logo eliminado')
    } catch (e) {
      toast.error('Error al eliminar')
    } finally {
      setUploading(false)
    }
  }

  if (adminLoading || !isAdmin) return <Loading text="Verificando permisos..." />
  if (loading) return <Loading text="Cargando configuración..." />

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-cva-green mb-2">Configuración</h1>
        <p className="text-cva-gray-500">Personaliza la apariencia de tu sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Logo de la Empresa
          </h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-cva-gray-300 rounded-lg p-6 text-center">
              {logoUrl ? (
                <div className="space-y-4">
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="max-h-24 mx-auto object-contain"
                  />
                  <p className="text-sm text-cva-gray-500">Logo actual</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-cva-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-cva-gray-400" />
                  </div>
                  <p className="text-sm text-cva-gray-500">No hay logo configurado</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadLogo}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {logoUrl ? 'Cambiar logo' : 'Subir logo'}
              </Button>
              {logoUrl && (
                <Button
                  variant="ghost"
                  onClick={handleDeleteLogo}
                  disabled={uploading}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <p className="text-xs text-cva-gray-500">
              Formatos: PNG, JPG, WEBP. Tamaño máximo: 2MB. Recomendado: 200x60px
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Nombre de la Empresa
          </h2>
          
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              placeholder="Ej: CVA Systems"
            />
            
            <Button onClick={handleSaveNombre} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Guardar nombre
            </Button>

            <p className="text-xs text-cva-gray-500">
              Este nombre aparecerá en el header si no hay logo configurado
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
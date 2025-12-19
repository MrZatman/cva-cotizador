'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, Modal, Loading, Card } from '@/components/ui'
import { Plus, Search, Package, Edit, Trash2, Check, X } from 'lucide-react'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Producto } from '@/types'
import toast from 'react-hot-toast'

const CATEGORIAS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Cámaras', label: 'Cámaras' },
  { value: 'DVR/NVR', label: 'DVR / NVR' },
  { value: 'Accesorios', label: 'Accesorios' },
  { value: 'Cableado', label: 'Cableado' },
  { value: 'Instalación', label: 'Instalación' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Soporte', label: 'Soporte' },
  { value: 'Otros', label: 'Otros' },
]

const emptyForm = { codigo: '', nombre: '', descripcion: '', precio: 0, categoria: '', activo: true }

export default function ProductosPage() {
  const router = useRouter()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Protección: redirigir si no es admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('No tienes permisos para ver esta página')
      router.push('/cotizaciones')
    }
  }, [isAdmin, adminLoading, router])

  useEffect(() => {
    if (isAdmin) fetchProductos()
  }, [isAdmin])

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('categoria')
        .order('nombre')
      if (error) throw error
      setProductos(data || [])
    } catch (e) {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto)
      setFormData({
        codigo: producto.codigo || '',
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        categoria: producto.categoria || '',
        activo: producto.activo,
      })
    } else {
      setEditingProducto(null)
      setFormData(emptyForm)
    }
    setErrors({})
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingProducto(null)
    setFormData(emptyForm)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (formData.precio < 0) newErrors.precio = 'El precio no puede ser negativo'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      const dataToSave = {
        codigo: formData.codigo.trim() || null,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio: formData.precio,
        categoria: formData.categoria || null,
        activo: formData.activo,
      }

      if (editingProducto) {
        const { error } = await supabase
          .from('productos')
          .update(dataToSave)
          .eq('id', editingProducto.id)
        if (error) throw error
        toast.success('Producto actualizado')
      } else {
        const { error } = await supabase
          .from('productos')
          .insert(dataToSave)
        if (error) {
          if (error.code === '23505') {
            setErrors({ codigo: 'Este código ya existe' })
            return
          }
          throw error
        }
        toast.success('Producto creado')
      }
      handleCloseModal()
      fetchProductos()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      toast.success('Producto eliminado')
      fetchProductos()
    } catch (e) {
      toast.error('Error al eliminar')
    }
  }

  const handleToggleActivo = async (producto: Producto) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: !producto.activo })
        .eq('id', producto.id)
      if (error) throw error
      toast.success(producto.activo ? 'Producto desactivado' : 'Producto activado')
      fetchProductos()
    } catch (e) {
      toast.error('Error al actualizar')
    }
  }

  const filtered = productos.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !categoriaFiltro || p.categoria === categoriaFiltro
    return matchSearch && matchCategoria
  })

  if (adminLoading || !isAdmin) return <Loading text="Verificando permisos..." />
  if (loading) return <Loading text="Cargando productos..." />

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl italic text-cva-green mb-2">Productos y Servicios</h1>
        <p className="text-cva-gray-500">Catálogo de productos para cotizaciones</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button variant="outline" onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Producto
        </Button>
        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:justify-end">
          <div className="w-full sm:w-48">
            <Select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              options={CATEGORIAS}
            />
          </div>
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
          <Package className="w-12 h-12 text-cva-gray-300 mx-auto mb-4" />
          <p className="text-cva-gray-500">
            {searchTerm || categoriaFiltro ? 'No se encontraron productos' : 'No hay productos registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {p.categoria && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-cva-gray-100 text-cva-gray-600">
                    {p.categoria}
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-cva-green rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {p.codigo && <p className="text-xs text-cva-gray-500 font-mono">{p.codigo}</p>}
                    <h3 className="font-semibold truncate">{p.nombre}</h3>
                  </div>
                </div>
                {p.descripcion && (
                  <p className="text-sm text-cva-gray-500 line-clamp-2 mt-2">{p.descripcion}</p>
                )}
                <p className="text-lg font-bold text-cva-green mt-3">{formatCurrency(p.precio)}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="secondary" size="sm" onClick={() => handleOpenModal(p)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActivo(p)}
                  className={p.activo ? 'text-red-600' : 'text-green-600'}
                >
                  {p.activo ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Código"
              value={formData.codigo}
              onChange={(e) => setFormData((prev) => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
              placeholder="CAM-IP-4MP"
              error={errors.codigo}
              helperText="Opcional. Se convertirá a mayúsculas"
            />
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Cámara IP 4MP Hikvision"
              error={errors.nombre}
              required
            />
            <Input
              label="Precio"
              type="number"
              step="0.01"
              min="0"
              value={formData.precio}
              onChange={(e) => setFormData((prev) => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
              error={errors.precio}
            />
            <Select
              label="Categoría"
              value={formData.categoria}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))}
              options={[{ value: '', label: 'Sin categoría' }, ...CATEGORIAS.slice(1)]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cva-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción detallada del producto o servicio..."
              rows={3}
              className="w-full px-4 py-2.5 border border-cva-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cva-green resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-cva-gray-100 rounded-lg">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
              className="w-5 h-5 text-cva-green rounded focus:ring-cva-green"
            />
            <label htmlFor="activo" className="cursor-pointer">
              <span className="font-medium">Producto activo</span>
              <p className="text-sm text-cva-gray-500">Los productos inactivos no aparecen en el selector</p>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingProducto ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
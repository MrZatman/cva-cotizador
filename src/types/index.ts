export interface Usuario {
  id: string; auth_id: string; email: string; nombre: string; telefono?: string;
  foto_url?: string; permisos: Permisos; activo: boolean; created_at: string; updated_at: string;
}
export interface Permisos {
  cotizaciones: { crear: boolean; editar: boolean; borrar: boolean };
  clientes: { crear: boolean; editar: boolean; borrar: boolean };
  usuarios: { crear: boolean; editar: boolean; borrar: boolean };
}
export interface Cliente {
  id: string; nombre: string; razon_social?: string; rfc?: string; domicilio_fiscal?: string;
  email?: string; telefono?: string; regimen_fiscal?: string; created_by?: string;
  created_at: string; updated_at: string;
}
export interface Folder { id: string; nombre: string; cliente_id: string; created_at: string; updated_at: string; }
export interface Cotizacion {
  id: string; numero_cotizacion: number; titulo: string; cliente_id: string; folder_id?: string;
  created_by?: string; realizado_por?: string; fecha_emision: string; fecha_vigencia?: string;
  subtotal: number; iva: number; total: number; alcance_trabajo?: string; exclusiones?: string;
  observaciones?: string; condiciones_pago?: string; capacitacion?: string; status: CotizacionStatus;
  created_at: string; updated_at: string; cliente?: Cliente; cliente_nombre?: string;
  cliente_razon_social?: string; creado_por_nombre?: string; folder_nombre?: string; partidas?: CotizacionPartida[];
}
export type CotizacionStatus = 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
export interface CotizacionPartida {
  id: string; cotizacion_id: string; numero_partida: number; modelo?: string; descripcion?: string;
  precio_unitario: number; cantidad: number; subtotal: number; orden: number;
  created_at: string; updated_at: string; imagenes?: PartidaImagen[];
}
export interface PartidaImagen { id: string; partida_id: string; imagen_url: string; orden: number; created_at: string; }
export interface ClienteFormData { nombre: string; razon_social?: string; rfc?: string; domicilio_fiscal?: string; email?: string; telefono?: string; regimen_fiscal?: string; }
export interface CotizacionFormData { titulo: string; cliente_id: string; folder_id?: string; realizado_por?: string; fecha_vigencia?: string; alcance_trabajo?: string; exclusiones?: string; observaciones?: string; condiciones_pago?: string; capacitacion?: string; }
export interface PartidaFormData { numero_partida: number; modelo?: string; descripcion?: string; precio_unitario: number; cantidad: number; }

export interface Producto {
  id: string
  codigo: string | null
  nombre: string
  descripcion: string | null
  precio: number
  categoria: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nombre: string
  orden: number
  activo: boolean
  created_at: string
}
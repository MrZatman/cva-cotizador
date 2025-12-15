export const REGIMENES_FISCALES = [
  { value: '601', label: 'General de Ley Personas Morales' },
  { value: '603', label: 'Personas Morales con Fines no Lucrativos' },
  { value: '612', label: 'Personas Físicas con Actividades Empresariales' },
  { value: '616', label: 'Sin obligaciones fiscales' },
  { value: '621', label: 'Incorporación Fiscal' },
  { value: '626', label: 'Régimen Simplificado de Confianza' },
];
export const COTIZACION_STATUS = {
  borrador: { label: 'Borrador', color: 'bg-gray-500' },
  enviada: { label: 'Enviada', color: 'bg-blue-500' },
  aprobada: { label: 'Aprobada', color: 'bg-green-500' },
  rechazada: { label: 'Rechazada', color: 'bg-red-500' },
  vencida: { label: 'Vencida', color: 'bg-yellow-500' },
} as const;
export const EMPRESA_CONFIG = { nombre: 'CVA Systems', iva: 0.16 };

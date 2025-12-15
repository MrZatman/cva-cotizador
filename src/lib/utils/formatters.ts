import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}
export function formatRFC(rfc: string): string {
  return rfc.toUpperCase().replace(/\s/g, '').slice(0, 13)
}
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    borrador: 'bg-gray-100 text-gray-800', enviada: 'bg-blue-100 text-blue-800',
    aprobada: 'bg-green-100 text-green-800', rechazada: 'bg-red-100 text-red-800', vencida: 'bg-yellow-100 text-yellow-800',
  }
  return colors[status] || colors.borrador
}
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = { borrador: 'Borrador', enviada: 'Enviada', aprobada: 'Aprobada', rechazada: 'Rechazada', vencida: 'Vencida' }
  return labels[status] || 'Desconocido'
}

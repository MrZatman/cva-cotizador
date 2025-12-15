export function validateRFC(rfc: string): { valid: boolean; message?: string } {
  if (!rfc) return { valid: true }
  const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/
  if (!rfcPattern.test(rfc.toUpperCase().replace(/\s/g, ''))) {
    return { valid: false, message: 'RFC inválido' }
  }
  return { valid: true }
}
export function validateClienteForm(data: { nombre: string; rfc?: string; email?: string; telefono?: string }): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  if (!data.nombre) errors.nombre = 'Nombre es requerido'
  if (data.rfc) { const r = validateRFC(data.rfc); if (!r.valid) errors.rfc = r.message! }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Email inválido'
  return { valid: Object.keys(errors).length === 0, errors }
}

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  logo: { width: 80, height: 80, backgroundColor: '#2D5A3D', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerRight: { textAlign: 'right' },
  title: { fontSize: 20, color: '#2D5A3D', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#666' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#2D5A3D', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#2D5A3D', paddingBottom: 5 },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 120, color: '#666' },
  value: { flex: 1 },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#2D5A3D', color: 'white', padding: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', padding: 8 },
  colNum: { width: '8%' },
  colModelo: { width: '15%' },
  colDesc: { width: '37%' },
  colPU: { width: '15%', textAlign: 'right' },
  colCant: { width: '10%', textAlign: 'center' },
  colSubtotal: { width: '15%', textAlign: 'right' },
  totals: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 5 },
  totalLabel: { color: '#666' },
  totalValue: { fontWeight: 'bold' },
  grandTotal: { fontSize: 14, color: '#2D5A3D', fontWeight: 'bold' },
  infoSection: { marginTop: 20, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 5 },
  infoTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  infoText: { fontSize: 9, color: '#555', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999' },
  statusBadge: { padding: '4 12', borderRadius: 10, fontSize: 9, alignSelf: 'flex-start' },
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface Props {
  cotizacion: any
  partidas: any[]
  cliente: any
}

export default function CotizacionPDF({ cotizacion, partidas, cliente }: Props) {
  const subtotal = partidas.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>CVA</Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D5A3D' }}>CVA Systems</Text>
              <Text style={{ fontSize: 8, color: '#666' }}>Soluciones en Seguridad y Videovigilancia</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>COTIZACIÓN</Text>
            <Text style={styles.subtitle}>No. {cotizacion.numero_cotizacion}</Text>
            <Text style={styles.subtitle}>Fecha: {formatDate(cotizacion.fecha_emision)}</Text>
            {cotizacion.fecha_vigencia && (
              <Text style={styles.subtitle}>Vigencia: {formatDate(cotizacion.fecha_vigencia)}</Text>
            )}
          </View>
        </View>

        {/* Datos del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{cliente?.nombre || 'N/A'}</Text>
          </View>
          {cliente?.razon_social && (
            <View style={styles.row}>
              <Text style={styles.label}>Razón Social:</Text>
              <Text style={styles.value}>{cliente.razon_social}</Text>
            </View>
          )}
          {cliente?.rfc && (
            <View style={styles.row}>
              <Text style={styles.label}>RFC:</Text>
              <Text style={styles.value}>{cliente.rfc}</Text>
            </View>
          )}
          {cliente?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{cliente.email}</Text>
            </View>
          )}
        </View>

        {/* Título del Proyecto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROYECTO</Text>
          <Text style={{ fontSize: 12 }}>{cotizacion.titulo}</Text>
          {cotizacion.realizado_por && (
            <Text style={{ fontSize: 9, color: '#666', marginTop: 5 }}>Elaborado por: {cotizacion.realizado_por}</Text>
          )}
        </View>

        {/* Tabla de Partidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTIDAS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colNum}>#</Text>
              <Text style={styles.colModelo}>Modelo</Text>
              <Text style={styles.colDesc}>Descripción</Text>
              <Text style={styles.colPU}>P. Unitario</Text>
              <Text style={styles.colCant}>Cant.</Text>
              <Text style={styles.colSubtotal}>Subtotal</Text>
            </View>
            {partidas.map((p, idx) => (
              <View key={p.id} style={styles.tableRow}>
                <Text style={styles.colNum}>{idx + 1}</Text>
                <Text style={styles.colModelo}>{p.modelo || '-'}</Text>
                <Text style={styles.colDesc}>{p.descripcion || '-'}</Text>
                <Text style={styles.colPU}>{formatCurrency(p.precio_unitario)}</Text>
                <Text style={styles.colCant}>{p.cantidad}</Text>
                <Text style={styles.colSubtotal}>{formatCurrency(p.precio_unitario * p.cantidad)}</Text>
              </View>
            ))}
          </View>

          {/* Totales */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (16%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(iva)}</Text>
            </View>
            <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#2D5A3D', paddingTop: 5 }]}>
              <Text style={styles.grandTotal}>TOTAL:</Text>
              <Text style={styles.grandTotal}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Info Adicional */}
        {cotizacion.alcance_trabajo && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Alcance del Trabajo:</Text>
            <Text style={styles.infoText}>{cotizacion.alcance_trabajo}</Text>
          </View>
        )}

        {cotizacion.exclusiones && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Exclusiones:</Text>
            <Text style={styles.infoText}>{cotizacion.exclusiones}</Text>
          </View>
        )}

        {cotizacion.condiciones_pago && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Condiciones de Pago:</Text>
            <Text style={styles.infoText}>{cotizacion.condiciones_pago}</Text>
          </View>
        )}

        {cotizacion.observaciones && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Observaciones:</Text>
            <Text style={styles.infoText}>{cotizacion.observaciones}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>CVA Systems - Soluciones en Seguridad y Videovigilancia</Text>
          <Text>Este documento es una cotización y no representa un compromiso de venta.</Text>
        </View>
      </Page>
    </Document>
  )
}
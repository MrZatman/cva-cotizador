import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface GeneratePDFParams {
  cotizacion: any
  cliente: any
  partidas: any[]
}

export function generateCotizacionPDF({ cotizacion, cliente, partidas }: GeneratePDFParams) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginLeft = 15
  const marginRight = 15
  const contentWidth = pageWidth - marginLeft - marginRight

  // Calcular totales
  const subtotal = partidas.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva

  // ========== HEADER ==========
  // Logo verde
  doc.setFillColor(45, 90, 61)
  doc.rect(marginLeft, 15, 30, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CVA', marginLeft + 15, 33, { align: 'center' })

  // Nombre empresa
  doc.setTextColor(45, 90, 61)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CVA Systems', marginLeft + 35, 25)
  doc.setTextColor(120, 120, 120)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Soluciones en Seguridad y Videovigilancia', marginLeft + 35, 32)

  // Título COTIZACIÓN (derecha)
  doc.setTextColor(45, 90, 61)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('COTIZACIÓN', pageWidth - marginRight, 20, { align: 'right' })
  
  // Info de cotización (derecha, alineado)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  const infoX = pageWidth - marginRight - 50
  const valueX = pageWidth - marginRight
  
  doc.text('No.', infoX, 30)
  doc.text(String(cotizacion.numero_cotizacion), valueX, 30, { align: 'right' })
  
  doc.text('Fecha:', infoX, 37)
  doc.text(formatDate(cotizacion.fecha_emision), valueX, 37, { align: 'right' })
  
  if (cotizacion.fecha_vigencia) {
    doc.text('Vigencia:', infoX, 44)
    doc.text(formatDate(cotizacion.fecha_vigencia), valueX, 44, { align: 'right' })
  }

  // Línea separadora
  doc.setDrawColor(45, 90, 61)
  doc.setLineWidth(0.8)
  doc.line(marginLeft, 52, pageWidth - marginRight, 52)

  // ========== DATOS DEL CLIENTE ==========
  let yPos = 62
  doc.setFillColor(245, 245, 245)
  doc.rect(marginLeft, yPos - 5, contentWidth, 8, 'F')
  doc.setTextColor(45, 90, 61)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', marginLeft + 3, yPos)

  yPos += 10
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  const labelX = marginLeft + 3
  const dataX = marginLeft + 35
  
  doc.setFont('helvetica', 'bold')
  doc.text('Cliente:', labelX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(cliente?.nombre || 'N/A', dataX, yPos)
  
  if (cliente?.razon_social) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Razón Social:', labelX, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(cliente.razon_social, dataX, yPos)
  }
  if (cliente?.rfc) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('RFC:', labelX, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(cliente.rfc, dataX, yPos)
  }
  if (cliente?.email) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Email:', labelX, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(cliente.email, dataX, yPos)
  }
  if (cliente?.telefono) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Teléfono:', labelX, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(cliente.telefono, dataX, yPos)
  }

  // ========== PROYECTO ==========
  yPos += 15
  doc.setFillColor(245, 245, 245)
  doc.rect(marginLeft, yPos - 5, contentWidth, 8, 'F')
  doc.setTextColor(45, 90, 61)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PROYECTO', marginLeft + 3, yPos)

  yPos += 10
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(cotizacion.titulo, marginLeft + 3, yPos)
  
  if (cotizacion.realizado_por) {
    yPos += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Elaborado por: ${cotizacion.realizado_por}`, marginLeft + 3, yPos)
  }

  // ========== PARTIDAS ==========
  yPos += 12
  doc.setFillColor(245, 245, 245)
  doc.rect(marginLeft, yPos - 5, contentWidth, 8, 'F')
  doc.setTextColor(45, 90, 61)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PARTIDAS', marginLeft + 3, yPos)

  const tableData = partidas.map((p, idx) => [
    String(idx + 1),
    p.modelo || '-',
    p.descripcion || '-',
    formatCurrency(p.precio_unitario),
    String(p.cantidad),
    formatCurrency(p.precio_unitario * p.cantidad)
  ])

  autoTable(doc, {
    startY: yPos + 5,
    head: [['#', 'Modelo', 'Descripción', 'P. Unitario', 'Cant.', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [45, 90, 61],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 65 },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: marginLeft, right: marginRight },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  })

  // ========== TOTALES (alineados a la derecha) ==========
  const finalY = (doc as any).lastAutoTable.finalY + 8
  const totalsBoxWidth = 80
  const totalsX = pageWidth - marginRight - totalsBoxWidth
  
  // Fondo para totales
  doc.setFillColor(250, 250, 250)
  doc.rect(totalsX, finalY - 3, totalsBoxWidth, 28, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  
  // Subtotal
  doc.text('Subtotal:', totalsX + 5, finalY + 5)
  doc.text(formatCurrency(subtotal), pageWidth - marginRight - 5, finalY + 5, { align: 'right' })
  
  // IVA
  doc.text('IVA (16%):', totalsX + 5, finalY + 12)
  doc.text(formatCurrency(iva), pageWidth - marginRight - 5, finalY + 12, { align: 'right' })
  
  // Línea antes del total
  doc.setDrawColor(45, 90, 61)
  doc.setLineWidth(0.5)
  doc.line(totalsX + 5, finalY + 16, pageWidth - marginRight - 5, finalY + 16)
  
  // Total
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(45, 90, 61)
  doc.text('TOTAL:', totalsX + 5, finalY + 23)
  doc.text(formatCurrency(total), pageWidth - marginRight - 5, finalY + 23, { align: 'right' })

  // ========== INFO ADICIONAL ==========
  let infoY = finalY + 40
  
  const addSection = (title: string, content: string) => {
    if (!content) return
    
    // Check if we need a new page
    if (infoY > 250) {
      doc.addPage()
      infoY = 20
    }
    
    // Section header
    doc.setFillColor(245, 245, 245)
    doc.rect(marginLeft, infoY - 5, contentWidth, 8, 'F')
    doc.setTextColor(45, 90, 61)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(title, marginLeft + 3, infoY)
    
    // Content
    infoY += 8
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(content, contentWidth - 6)
    doc.text(lines, marginLeft + 3, infoY)
    infoY += (lines.length * 5) + 10
  }

  addSection('Alcance del Trabajo:', cotizacion.alcance_trabajo)
  addSection('Exclusiones:', cotizacion.exclusiones)
  addSection('Condiciones de Pago:', cotizacion.condiciones_pago)
  addSection('Observaciones:', cotizacion.observaciones)
  addSection('Capacitación:', cotizacion.capacitacion)

  // ========== FOOTER ==========
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // Línea del footer
  doc.setDrawColor(45, 90, 61)
  doc.setLineWidth(0.5)
  doc.line(marginLeft, pageHeight - 20, pageWidth - marginRight, pageHeight - 20)
  
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('CVA Systems - Soluciones en Seguridad y Videovigilancia', pageWidth / 2, pageHeight - 14, { align: 'center' })
  doc.text('Este documento es una cotización y no representa un compromiso de venta.', pageWidth / 2, pageHeight - 9, { align: 'center' })

  // Descargar
  doc.save(`Cotizacion-${cotizacion.numero_cotizacion}.pdf`)
}
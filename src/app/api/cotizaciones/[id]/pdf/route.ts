import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Obtener cotización
    const { data: cotizacion, error: cotError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (cotError || !cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Obtener cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', cotizacion.cliente_id)
      .single()

    // Obtener partidas
    const { data: partidas } = await supabase
      .from('cotizacion_partidas')
      .select('*')
      .eq('cotizacion_id', id)
      .order('orden')

    // Calcular totales
    const items = partidas || []
    const subtotal = items.reduce((sum: number, p: any) => sum + (p.precio_unitario * p.cantidad), 0)
    const iva = subtotal * 0.16
    const total = subtotal + iva

    // Crear PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header - Logo
    doc.setFillColor(45, 90, 61) // CVA Green
    doc.rect(15, 15, 25, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('CVA', 20, 30)
    
    // Header - Company name
    doc.setTextColor(45, 90, 61)
    doc.setFontSize(14)
    doc.text('CVA Systems', 45, 25)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Soluciones en Seguridad y Videovigilancia', 45, 32)

    // Header - Cotización info (right side)
    doc.setTextColor(45, 90, 61)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('COTIZACIÓN', pageWidth - 15, 20, { align: 'right' })
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`No. ${cotizacion.numero_cotizacion}`, pageWidth - 15, 28, { align: 'right' })
    doc.text(`Fecha: ${formatDate(cotizacion.fecha_emision)}`, pageWidth - 15, 35, { align: 'right' })
    if (cotizacion.fecha_vigencia) {
      doc.text(`Vigencia: ${formatDate(cotizacion.fecha_vigencia)}`, pageWidth - 15, 42, { align: 'right' })
    }

    // Línea separadora
    doc.setDrawColor(45, 90, 61)
    doc.setLineWidth(0.5)
    doc.line(15, 48, pageWidth - 15, 48)

    // Datos del cliente
    let yPos = 58
    doc.setTextColor(45, 90, 61)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL CLIENTE', 15, yPos)
    
    yPos += 8
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Cliente: ${cliente?.nombre || 'N/A'}`, 15, yPos)
    if (cliente?.razon_social) { yPos += 5; doc.text(`Razón Social: ${cliente.razon_social}`, 15, yPos) }
    if (cliente?.rfc) { yPos += 5; doc.text(`RFC: ${cliente.rfc}`, 15, yPos) }
    if (cliente?.email) { yPos += 5; doc.text(`Email: ${cliente.email}`, 15, yPos) }
    if (cliente?.telefono) { yPos += 5; doc.text(`Teléfono: ${cliente.telefono}`, 15, yPos) }

    // Proyecto
    yPos += 12
    doc.setTextColor(45, 90, 61)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PROYECTO', 15, yPos)
    yPos += 7
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(cotizacion.titulo, 15, yPos)
    if (cotizacion.realizado_por) {
      yPos += 5
      doc.setFontSize(8)
      doc.text(`Elaborado por: ${cotizacion.realizado_por}`, 15, yPos)
    }

    // Tabla de partidas
    yPos += 12
    doc.setTextColor(45, 90, 61)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PARTIDAS', 15, yPos)

    const tableData = items.map((p: any, idx: number) => [
      idx + 1,
      p.modelo || '-',
      p.descripcion || '-',
      formatCurrency(p.precio_unitario),
      p.cantidad,
      formatCurrency(p.precio_unitario * p.cantidad)
    ])

    ;(doc as any).autoTable({
      startY: yPos + 5,
      head: [['#', 'Modelo', 'Descripción', 'P. Unitario', 'Cant.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [45, 90, 61], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 70 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    })

    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', pageWidth - 60, finalY)
    doc.text(formatCurrency(subtotal), pageWidth - 15, finalY, { align: 'right' })
    doc.text('IVA (16%):', pageWidth - 60, finalY + 6)
    doc.text(formatCurrency(iva), pageWidth - 15, finalY + 6, { align: 'right' })
    doc.setDrawColor(45, 90, 61)
    doc.line(pageWidth - 60, finalY + 9, pageWidth - 15, finalY + 9)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(45, 90, 61)
    doc.text('TOTAL:', pageWidth - 60, finalY + 16)
    doc.text(formatCurrency(total), pageWidth - 15, finalY + 16, { align: 'right' })

    // Info adicional
    let infoY = finalY + 30
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')

    const addSection = (title: string, content: string) => {
      if (!content) return
      if (infoY > 250) { doc.addPage(); infoY = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(title, 15, infoY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      const lines = doc.splitTextToSize(content, pageWidth - 30)
      doc.text(lines, 15, infoY + 5)
      infoY += 10 + (lines.length * 4)
    }

    addSection('Alcance del Trabajo:', cotizacion.alcance_trabajo)
    addSection('Exclusiones:', cotizacion.exclusiones)
    addSection('Condiciones de Pago:', cotizacion.condiciones_pago)
    addSection('Observaciones:', cotizacion.observaciones)
    addSection('Capacitación:', cotizacion.capacitacion)

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text('CVA Systems - Soluciones en Seguridad y Videovigilancia', pageWidth / 2, pageHeight - 15, { align: 'center' })
    doc.text('Este documento es una cotización y no representa un compromiso de venta.', pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Generar buffer
    const pdfOutput = doc.output('arraybuffer')
    const pdfBuffer = new Uint8Array(pdfOutput)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Cotizacion-${cotizacion.numero_cotizacion}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generando PDF:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
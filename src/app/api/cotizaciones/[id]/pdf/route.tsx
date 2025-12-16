import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@supabase/supabase-js'
import CotizacionPDF from '@/components/pdf/CotizacionPDF'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Generar PDF
    const pdfBuffer = await renderToBuffer(
      <CotizacionPDF 
        cotizacion={cotizacion} 
        partidas={partidas || []} 
        cliente={cliente} 
      />
    )

    // Retornar PDF
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
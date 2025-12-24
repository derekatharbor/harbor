// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/audit/[id]/pdf/route.ts
// API endpoint to generate PDF for agency audit

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { AuditPDF } from '@/app/agencies/report/[id]/AuditPDF'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params
    const { searchParams } = new URL(request.url)
    const whiteLabel = searchParams.get('whitelabel') === 'true'
    
    const supabase = getSupabase()
    
    // Fetch audit data
    const { data: audit, error } = await supabase
      .from('agency_audits')
      .select('*')
      .eq('id', auditId)
      .single()
    
    if (error || !audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }
    
    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      AuditPDF({ audit, whiteLabel })
    )
    
    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer)
    
    // Return PDF
    const filename = `${audit.brand_name.toLowerCase().replace(/\s+/g, '-')}-ai-audit.pdf`
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
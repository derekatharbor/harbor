// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/audit/[id]/route.ts
// API endpoint to fetch an agency audit by ID

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()
  const auditId = params.id
  
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
  
  return NextResponse.json(audit)
}

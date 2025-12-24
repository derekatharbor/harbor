// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/audit/email/route.ts
// API endpoint to capture emails for full report

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { audit_id, email } = await request.json()
    
    if (!audit_id || !email) {
      return NextResponse.json(
        { error: 'Missing audit_id or email' },
        { status: 400 }
      )
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabase()
    
    // Save email capture
    const { error: saveError } = await supabase
      .from('agency_audit_emails')
      .insert({
        audit_id,
        email: email.toLowerCase().trim()
      })
    
    if (saveError) {
      console.error('Error saving email:', saveError)
      // Don't fail - still return success
    }
    
    // TODO: Send actual email with PDF report
    // For now, just capture the email
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Email capture error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

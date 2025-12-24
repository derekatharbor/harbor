// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/audit/email/route.ts
// API endpoint to capture email and send PDF via Resend

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { renderToBuffer } from '@react-pdf/renderer'
import { AuditPDF } from '@/app/agencies/report/[id]/AuditPDF'

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
    
    // Fetch the audit data
    const { data: audit, error: auditError } = await supabase
      .from('agency_audits')
      .select('*')
      .eq('id', audit_id)
      .single()
    
    if (auditError || !audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }
    
    // Save email capture
    await supabase
      .from('agency_audit_emails')
      .insert({
        audit_id,
        email: email.toLowerCase().trim()
      })
    
    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      AuditPDF({ audit, whiteLabel: false })
    )
    
    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const filename = `${audit.brand_name.toLowerCase().replace(/\s+/g, '-')}-ai-audit.pdf`
    
    await resend.emails.send({
      from: 'Harbor <audits@useharbor.io>',
      to: email,
      subject: `AI Visibility Audit: ${audit.brand_name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 600; color: #1C1C1E; margin-bottom: 16px;">
            Your AI Visibility Audit is Ready
          </h1>
          
          <p style="font-size: 16px; color: #6B6B6F; line-height: 1.6; margin-bottom: 24px;">
            Attached is the AI visibility audit for <strong>${audit.brand_name}</strong>. 
            Use this report to show your prospect how they're performing across ChatGPT, Claude, and Perplexity.
          </p>
          
          <div style="background: #F7F7F8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6B6B6F; font-size: 14px;">AI Visibility Score</span>
              <span style="color: #1C1C1E; font-weight: 600; font-size: 14px;">${audit.visibility_score}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6B6B6F; font-size: 14px;">Share of Answer</span>
              <span style="color: #1C1C1E; font-weight: 600; font-size: 14px;">${audit.share_of_voice}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6B6B6F; font-size: 14px;">Competitors Found</span>
              <span style="color: #1C1C1E; font-weight: 600; font-size: 14px;">${audit.competitors?.length || 0}</span>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6B6B6F; line-height: 1.6; margin-bottom: 24px;">
            Ready to help your clients improve their AI visibility? Start managing brands with Harbor.
          </p>
          
          <a href="https://useharbor.io/agencies/signup" style="display: inline-block; background: #1C1C1E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
            Start Agency Account
          </a>
          
          <hr style="border: none; border-top: 1px solid #E6E6E7; margin: 32px 0;" />
          
          <p style="font-size: 12px; color: #8E8E93;">
            Harbor · AI Visibility Intelligence<br />
            <a href="https://useharbor.io" style="color: #8E8E93;">useharbor.io</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
// apps/web/app/api/brands/[slug]/history/route.ts
// Fetches change history for a brand profile

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get change logs for this brand
    const { data: logs, error } = await supabase
      .from('brand_change_logs')
      .select('*')
      .eq('brand_slug', params.slug)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    // Format logs for display
    const formattedLogs = logs?.map(log => ({
      id: log.id,
      timestamp: log.created_at,
      description: formatChangeDescription(log),
      type: log.change_type,
      details: {
        field: log.field_name,
        oldValue: log.old_value,
        newValue: log.new_value
      }
    })) || []

    return NextResponse.json({
      history: formattedLogs,
      total: formattedLogs.length
    })

  } catch (error: any) {
    console.error('History API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format change descriptions
function formatChangeDescription(log: any): string {
  switch (log.change_type) {
    case 'description_updated':
      return 'Updated brand description'
    
    case 'product_added':
      return `Added product: ${log.new_value?.name || 'new product'}`
    
    case 'product_updated':
      return `Updated product: ${log.field_name || 'product'}`
    
    case 'product_removed':
      return `Removed product: ${log.old_value?.name || 'product'}`
    
    case 'faq_added':
      return `Added FAQ: "${truncate(log.new_value?.question, 50)}"`
    
    case 'faq_updated':
      return `Updated FAQ: "${truncate(log.field_name, 50)}"`
    
    case 'faq_removed':
      return `Removed FAQ: "${truncate(log.old_value?.question, 50)}"`
    
    case 'company_info_updated':
      return `Updated company information`
    
    case 'scan_triggered':
      return 'Ran new scan'
    
    case 'visibility_score_updated':
      const oldScore = log.old_value?.score || 0
      const newScore = log.new_value?.score || 0
      const delta = newScore - oldScore
      const direction = delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
      return `Visibility score updated ${direction} ${Math.abs(delta).toFixed(1)}% to ${newScore}%`
    
    case 'profile_claimed':
      return 'Profile claimed by brand owner'
    
    default:
      return log.description || 'Profile updated'
  }
}

function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str) return ''
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

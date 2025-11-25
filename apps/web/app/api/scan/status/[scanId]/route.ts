// app/api/scan/status/[scanId]/route.ts
// FIXED: Remove auth requirement for status polling

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(
  request: Request,
  { params }: { params: { scanId: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const { scanId } = params

    console.log('[Status] Fetching status for scan:', scanId)

    // Get scan with jobs
    const { data: scan, error } = await supabase
      .from('scans')
      .select('*, scan_jobs(*)')
      .eq('id', scanId)
      .single()

    if (error || !scan) {
      console.error('[Status] Scan not found:', error)
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    // Calculate progress based on module completion
    const jobs = scan.scan_jobs as any[]
    const totalModules = 4
    const completedModules = jobs.filter((j: any) => j.status === 'done').length
    const failedModules = jobs.filter((j: any) => j.status === 'failed').length
    const progress = Math.round((completedModules / totalModules) * 100)

    // Get module statuses
    const getModuleStatus = (module: string): 'pending' | 'running' | 'done' | 'failed' => {
      const job = jobs.find((j: any) => j.module === module)
      if (!job) return 'pending'
      
      if (job.status === 'done') return 'done'
      if (job.status === 'failed') return 'failed'
      if (job.status === 'running') return 'running'
      return 'pending'
    }

    const modules = {
      shopping: getModuleStatus('shopping'),
      brand: getModuleStatus('brand'),
      conversations: getModuleStatus('conversations'),
      website: getModuleStatus('website'),
    }

    // Find currently running module
    const currentJob = jobs.find((j: any) => j.status === 'running')
    
    // Generate descriptive message
    let message = 'Initializing scan'
    
    if (scan.status === 'done') {
      message = 'Scan complete'
    } else if (scan.status === 'failed') {
      message = 'Scan encountered errors'
    } else if (currentJob) {
      const moduleMessages: Record<string, string> = {
        shopping: 'Analyzing product visibility',
        brand: 'Gathering brand perception',
        conversations: 'Identifying conversation patterns',
        website: 'Validating website structure'
      }
      message = moduleMessages[currentJob.module] || 'Processing'
    } else if (scan.status === 'queued') {
      message = 'Starting scan'
    } else if (completedModules > 0) {
      message = `${completedModules} of ${totalModules} modules complete`
    }

    const response = {
      status: scan.status,
      progress,
      currentModule: currentJob?.module || null,
      modules,
      message,
      startedAt: scan.started_at,
      finishedAt: scan.finished_at,
    }

    console.log('[Status] Response:', { status: scan.status, progress, modules })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('[Status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan status' },
      { status: 500 }
    )
  }
}
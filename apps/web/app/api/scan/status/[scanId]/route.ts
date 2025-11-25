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
  
  // Create a completely fresh client with no caching
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-no-cache': Date.now().toString(), // Force unique request
      },
    },
  })
}

export async function GET(
  request: Request,
  { params }: { params: { scanId: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const { scanId } = params

    console.log('[Status] 🔍 Fetching status for scan:', scanId)

    // Small delay to allow database replication (Supabase issue)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Fetch scan first
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('id, status, started_at, finished_at')
      .eq('id', scanId)
      .single()

    if (scanError || !scan) {
      console.error('[Status] ❌ Scan not found:', scanError)
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    // Fetch jobs separately with explicit maybeSingle to avoid caching
    const { data: jobsRaw, error: jobsError } = await supabase
      .from('scan_jobs')
      .select('id, module, status, started_at, finished_at, error')
      .eq('scan_id', scanId)
      .order('started_at', { ascending: false, nullsFirst: false })

    if (jobsError) {
      console.error('[Status] ❌ Failed to fetch jobs:', jobsError)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    const jobs = jobsRaw || []
    
    console.log('[Status] 📊 Scan status:', scan.status)
    console.log('[Status] 📋 Raw jobs from DB:', JSON.stringify(jobs.map((j: any) => ({
      module: j.module, 
      status: j.status,
      id: j.id
    }))))

    const jobs = jobsRaw || []

    console.log('[Status] 📊 Scan status:', scan.status)
    console.log('[Status] 📋 Jobs:', jobs?.map((j: any) => `${j.module}:${j.status}`).join(', ') || 'none')

    if (!jobs || jobs.length === 0) {
      console.log('[Status] ⚠️ No jobs found for scan!')
    }
    
    const totalModules = 4
    const completedModules = jobs?.filter((j: any) => j.status === 'done').length || 0
    const failedModules = jobs?.filter((j: any) => j.status === 'failed').length || 0
    const runningModules = jobs?.filter((j: any) => j.status === 'running').length || 0
    const progress = Math.round((completedModules / totalModules) * 100)

    console.log('[Status] 📈 Progress:', {
      completed: completedModules,
      running: runningModules,
      failed: failedModules,
      progress: progress + '%'
    })

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
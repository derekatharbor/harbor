// app/api/scan/status/[scanId]/route.ts
// Real-time scan status polling for progress modal

export const runtime = 'nodejs'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { scanId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scanId } = params

    // Get scan with jobs
    const { data: scan, error } = await supabase
      .from('scans')
      .select(`
        id,
        status,
        started_at,
        finished_at,
        scan_jobs (
          id,
          module,
          status,
          started_at,
          finished_at,
          error
        )
      `)
      .eq('id', scanId)
      .single()

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    // Calculate progress based on module completion
    const jobs = scan.scan_jobs as any[]
    const totalModules = 4
    const completedModules = jobs.filter(j => j.status === 'done').length
    const failedModules = jobs.filter(j => j.status === 'failed').length
    const progress = Math.round((completedModules / totalModules) * 100)

    // FIXED: Override scan status if not all modules are done yet
    let actualStatus = scan.status
    if (progress < 100 && scan.status === 'done') {
      // Database says done, but modules aren't all complete yet
      actualStatus = 'running'
    }

    // Get module statuses
    const getModuleStatus = (module: string): 'pending' | 'running' | 'done' | 'failed' => {
      const job = jobs.find(j => j.module === module)
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
    const currentJob = jobs.find(j => j.status === 'running')
    
    // Generate descriptive message
    let message = 'Initializing scan...'
    
    if (actualStatus === 'done') {
      message = 'Scan complete!'
    } else if (actualStatus === 'failed') {
      message = 'Scan encountered errors'
    } else if (currentJob) {
      const moduleMessages: Record<string, string> = {
        shopping: 'Analyzing product visibility across AI models...',
        brand: 'Gathering brand perception data...',
        conversations: 'Identifying conversation patterns...',
        website: 'Validating website structure and schema...'
      }
      message = moduleMessages[currentJob.module] || 'Processing...'
    } else if (actualStatus === 'queued') {
      message = 'Waiting to start...'
    } else if (completedModules > 0) {
      message = `Completed ${completedModules} of ${totalModules} modules...`
    }

    return NextResponse.json({
      status: actualStatus,
      progress,
      currentModule: currentJob?.module || null,
      modules,
      message,
      startedAt: scan.started_at,
      finishedAt: scan.finished_at,
    })

  } catch (error: any) {
    console.error('Scan status fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan status' },
      { status: 500 }
    )
  }
}
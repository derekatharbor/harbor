// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/onboarding/page.tsx
// Agency onboarding - creates org and redirects to workspace

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, Check } from 'lucide-react'
import Image from 'next/image'

export default function AgencyOnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'creating' | 'complete' | 'error'>('loading')
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function setupAgency() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/auth/login?next=/agencies/onboarding')
          return
        }

        setStatus('creating')

        // Get agency info from URL params or user metadata
        const agencyName = searchParams.get('name') || user.user_metadata?.agency_name || 'My Agency'
        const agencyWebsite = searchParams.get('website') || user.user_metadata?.agency_website || ''
        const agencySize = searchParams.get('size') || user.user_metadata?.agency_size || ''

        // Check if user already has an agency org
        const { data: existingRoles } = await supabase
          .from('user_roles')
          .select('org_id, orgs(id, name, type)')
          .eq('user_id', user.id)
          .eq('orgs.type', 'agency')
          .single()

        if (existingRoles?.org_id) {
          // Already has agency, redirect to workspace
          setStatus('complete')
          setTimeout(() => router.push('/agencies/workspace'), 1000)
          return
        }

        // Create agency organization
        const { data: org, error: orgError } = await supabase
          .from('orgs')
          .insert({
            name: agencyName,
            type: 'agency',
            metadata: {
              website: agencyWebsite,
              size: agencySize,
              created_from: 'agency_signup'
            }
          })
          .select()
          .single()

        if (orgError) throw orgError

        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            org_id: org.id,
            role: 'owner'
          })

        if (roleError) throw roleError

        // Create default dashboard for the agency
        const { error: dashError } = await supabase
          .from('dashboards')
          .insert({
            org_id: org.id,
            brand_name: agencyName,
            domain: agencyWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '') || null,
            type: 'agency'
          })

        if (dashError) throw dashError

        setStatus('complete')
        setTimeout(() => router.push('/agencies/workspace'), 1500)

      } catch (err: any) {
        console.error('Onboarding error:', err)
        setError(err.message || 'Failed to set up agency')
        setStatus('error')
      }
    }

    setupAgency()
  }, [router, searchParams, supabase])

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6">
      <Image
        src="/images/Harbor_White_Logo.png"
        alt="Harbor"
        width={48}
        height={48}
        className="h-12 w-auto mb-8"
      />

      {status === 'loading' && (
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white/30 animate-spin mx-auto mb-4" />
          <p className="text-white/50 font-['Source_Code_Pro']">Loading...</p>
        </div>
      )}

      {status === 'creating' && (
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white/30 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
            Setting up your agency
          </h2>
          <p className="text-white/40 font-['Source_Code_Pro'] text-sm">
            Creating workspace...
          </p>
        </div>
      )}

      {status === 'complete' && (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
            You're all set
          </h2>
          <p className="text-white/40 font-['Source_Code_Pro'] text-sm">
            Redirecting to your workspace...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
            Something went wrong
          </h2>
          <p className="text-white/40 font-['Source_Code_Pro'] text-sm mb-6 max-w-sm">
            {error}
          </p>
          <button
            onClick={() => router.push('/agencies/signup')}
            className="px-6 py-2.5 bg-white/10 text-white rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/15 transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// app/claim/page.tsx
// Links a Shopify store to a Harbor account/dashboard

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Check, Store, Plus, ArrowRight } from 'lucide-react'

interface Dashboard {
  id: string
  brand_name: string
  domain: string | null
  logo_url: string | null
  created_at: string
}

export default function ClaimPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopDomain = searchParams.get('shop')
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClientComponentClient()

  // Check auth and fetch dashboards
  useEffect(() => {
    async function init() {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to login with return URL
        const returnUrl = `/claim?shop=${shopDomain}`
        router.push(`/auth/login?next=${encodeURIComponent(returnUrl)}`)
        return
      }

      setUser(user)

      // Fetch user's dashboards
      const { data: userDashboards, error: dashError } = await supabase
        .from('dashboards')
        .select('id, brand_name, domain, logo_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (dashError) {
        console.error('Failed to fetch dashboards:', dashError)
      } else {
        setDashboards(userDashboards || [])
        
        // Auto-select if only one dashboard
        if (userDashboards?.length === 1) {
          setSelectedDashboard(userDashboards[0].id)
        }
      }

      setLoading(false)
    }

    if (shopDomain) {
      init()
    } else {
      setError('Missing shop parameter')
      setLoading(false)
    }
  }, [shopDomain, router, supabase])

  const handleLink = async () => {
    if (!selectedDashboard || !shopDomain) return

    setLinking(true)
    setError('')

    try {
      // Get the dashboard to find associated profile
      const { data: dashboard } = await supabase
        .from('dashboards')
        .select('id, brand_name, domain')
        .eq('id', selectedDashboard)
        .single()

      if (!dashboard) {
        throw new Error('Dashboard not found')
      }

      // Find or create ai_profile for this brand
      let profileId = null
      
      // Try to find existing profile by domain
      if (dashboard.domain) {
        const { data: existingProfile } = await supabase
          .from('ai_profiles')
          .select('id')
          .eq('domain', dashboard.domain)
          .single()
        
        profileId = existingProfile?.id
      }

      // Update shopify_stores with the link
      const { error: updateError } = await supabase
        .from('shopify_stores')
        .update({
          profile_id: profileId,
          dashboard_id: selectedDashboard,
        })
        .eq('shop_domain', shopDomain)

      if (updateError) {
        throw updateError
      }

      setSuccess(true)

      // Redirect back to Shopify after a moment
      setTimeout(() => {
        // Shopify embedded apps use this URL pattern
        window.location.href = `https://admin.shopify.com/store/${shopDomain.replace('.myshopify.com', '')}/apps/harbor`
      }, 2000)

    } catch (err) {
      console.error('Failed to link store:', err)
      setError(err instanceof Error ? err.message : 'Failed to link store')
    } finally {
      setLinking(false)
    }
  }

  const storeName = shopDomain?.replace('.myshopify.com', '') || 'your store'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    )
  }

  if (!shopDomain) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Invalid Request</h1>
          <p className="text-white/60">Missing shop parameter. Please try again from your Shopify admin.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Store Connected!</h1>
          <p className="text-white/60 mb-4">Redirecting you back to Shopify...</p>
          <Loader2 className="w-5 h-5 animate-spin text-white/50 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/images/Harbor_White_Logo.png"
              alt="Harbor"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold text-white">Harbor</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-white/70" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Connect {storeName}</h1>
              <p className="text-sm text-white/50">Link your Shopify store to a Harbor dashboard</p>
            </div>
          </div>

          {/* Dashboard Selection */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Select a dashboard to connect
            </label>
            
            {dashboards.length > 0 ? (
              <>
                {dashboards.map((dashboard) => (
                  <button
                    key={dashboard.id}
                    onClick={() => setSelectedDashboard(dashboard.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      selectedDashboard === dashboard.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/8'
                    }`}
                  >
                    {dashboard.logo_url ? (
                      <img 
                        src={dashboard.logo_url} 
                        alt={dashboard.brand_name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/50 font-medium">
                        {dashboard.brand_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{dashboard.brand_name}</div>
                      {dashboard.domain && (
                        <div className="text-sm text-white/40">{dashboard.domain}</div>
                      )}
                    </div>
                    {selectedDashboard === dashboard.id && (
                      <Check className="w-5 h-5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-white/50">
                <p className="mb-4">You don't have any dashboards yet.</p>
              </div>
            )}

            {/* Create new dashboard option */}
            <Link
              href={`/onboarding?shop=${shopDomain}`}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-dashed border-white/20 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white/50" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-white/70">Create new dashboard</div>
                <div className="text-sm text-white/40">Set up a new brand profile</div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30" />
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={handleLink}
            disabled={!selectedDashboard || linking}
            className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {linking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Store'
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-white/30 text-center mt-4">
            This will sync your AI visibility data with your Shopify store
          </p>
        </div>

        {/* Back link */}
        <p className="text-center text-sm text-white/40 mt-6">
          <Link href="/dashboard" className="hover:text-white/60 transition-colors">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}

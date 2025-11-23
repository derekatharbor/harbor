// apps/web/app/brands/[slug]/manage/page.tsx
// Manage page for verified brand owners

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Save, 
  ArrowLeft, 
  ExternalLink, 
  Plus, 
  X, 
  Check,
  AlertCircle,
  Shield
} from 'lucide-react'
import FrostedNav from '@/components/landing/FrostedNav'
import { RescanButton } from '@/components/RescanButton'
import { ScoreDisplay } from '@/components/ScoreDisplay'
import CompetitorModule from '@/components/manage/CompetitorModule'
import { HarborScoreBreakdown } from '@/components/manage/HarborScoreBreakdown'
import { ProfileCompletenessBar } from '@/components/manage/ProfileCompletenessBar'
import { 
  calculateWebsiteReadiness, 
  calculateProfileCompleteness,
  calculateHarborScore,
  getImprovementSuggestions,
  calculatePotentialImprovement
} from '@/lib/scoring'

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  previous_visibility_score?: number
  score_change?: number
  harbor_score?: number
  previous_harbor_score?: number
  harbor_score_change?: number
  scan_count?: number
  rank_global: number
  rank_in_industry: number
  industry: string
  last_scan_at: string
  claimed: boolean
  claimed_at: string
  claimed_by_email: string
  feed_data: any
}

export default function ManageBrandPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false) // New: track if user is editing
  const [competitorData, setCompetitorData] = useState<any>(null)
  
  // Calculated scores
  const [websiteReadiness, setWebsiteReadiness] = useState(0)
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const [harborScore, setHarborScore] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [rescanning, setRescanning] = useState(false)
  
  // Editable fields
  const [description, setDescription] = useState('')
  const [offerings, setOfferings] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [companyInfo, setCompanyInfo] = useState<any>({})

  useEffect(() => {
    loadBrand()
  }, [params.slug])

  async function loadBrand() {
    try {
      console.log('Fetching brand:', params.slug)
      const res = await fetch(`/api/brands/${params.slug}`)
      console.log('API Response status:', res.status)
      
      if (!res.ok) {
        throw new Error('Failed to load brand')
      }

      const data = await res.json()
      console.log('Brand data:', data)
      
      // Check if claimed
      if (!data.claimed) {
        router.push(`/brands/${params.slug}`)
        return
      }
      
      setBrand(data)
      console.log('Brand set in state, ID:', data.id)
      
      // Load editable data from feed_data
      const feedData = data.feed_data || {}
      setDescription(feedData.short_description || '')
      setOfferings(feedData.offerings || [])
      setFaqs(feedData.faqs || [])
      setCompanyInfo(feedData.company_info || {})
      
      // Calculate scores
      const profileData = {
        description: feedData.short_description || '',
        offerings: feedData.offerings || [],
        faqs: feedData.faqs || [],
        companyInfo: feedData.company_info || {}
      }
      
      const readiness = calculateWebsiteReadiness(profileData)
      const completeness = calculateProfileCompleteness(profileData)
      const harbor = calculateHarborScore(data.visibility_score || 0, readiness)
      const improvementTips = getImprovementSuggestions(profileData)
      
      setWebsiteReadiness(readiness)
      setProfileCompleteness(completeness)
      setHarborScore(harbor)
      setSuggestions(improvementTips)
      
      // Load competitor data
      if (data.id) {
        console.log('Loading competitors for ID:', data.id)
        loadCompetitors(data.id)
      } else {
        console.log('ERROR: No brand ID found!')
      }
      
    } catch (error) {
      console.error('Failed to load brand:', error)
      setMessage({ type: 'error', text: 'Failed to load brand. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function loadCompetitors(brandId: string) {
    console.log('Calling competitors API with brandId:', brandId)
    try {
      const res = await fetch(`/api/brands/competitors?brandId=${brandId}`)
      console.log('Competitors API response status:', res.status)
      if (!res.ok) throw new Error('Failed to load competitors')
      const data = await res.json()
      console.log('Competitor data received:', data)
      setCompetitorData(data)
    } catch (error) {
      console.error('Failed to load competitors:', error)
      // Don't show error to user, just fail silently
      setCompetitorData(null)
    }
  }

  async function handleRescan() {
    setRescanning(true)
    try {
      const res = await fetch(`/api/brands/${params.slug}/rescan`, {
        method: 'POST'
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to rescan')
      }
      
      const newProfile = await res.json()
      
      // Update brand data
      setBrand(prev => prev ? {
        ...prev,
        visibility_score: newProfile.visibility_score,
        previous_visibility_score: newProfile.previous_visibility_score,
        score_change: newProfile.score_change,
        last_scan_at: newProfile.last_scan_at,
        scan_count: newProfile.scan_count
      } : null)
      
      // Recalculate Harbor Score with new visibility
      const newReadiness = calculateWebsiteReadiness({
        description,
        offerings,
        faqs,
        companyInfo
      })
      const newHarbor = calculateHarborScore(newProfile.visibility_score, newReadiness)
      setHarborScore(newHarbor)
      
      setMessage({ type: 'success', text: 'Score updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to rescan' })
    } finally {
      setRescanning(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    
    try {
      const res = await fetch(`/api/brands/${params.slug}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          offerings,
          faqs,
          companyInfo
        })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      
      // Success: lock editing and show notification
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Changes saved successfully!' })
      
      // Recalculate scores with new data
      const newProfileData = {
        description,
        offerings,
        faqs,
        companyInfo
      }
      
      const newReadiness = calculateWebsiteReadiness(newProfileData)
      const newCompleteness = calculateProfileCompleteness(newProfileData)
      const newHarbor = calculateHarborScore(brand?.visibility_score || 0, newReadiness)
      const newSuggestions = getImprovementSuggestions(newProfileData)
      
      setWebsiteReadiness(newReadiness)
      setProfileCompleteness(newCompleteness)
      setHarborScore(newHarbor)
      setSuggestions(newSuggestions)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save changes' })
      // Keep form editable on error
    } finally {
      setSaving(false)
    }
  }

  function addOffering() {
    setOfferings([...offerings, { 
      name: '', 
      description: '', 
      type: 'product_line' 
    }])
  }

  function removeOffering(index: number) {
    setOfferings(offerings.filter((_, i) => i !== index))
  }

  function updateOffering(index: number, field: string, value: string) {
    const newOfferings = [...offerings]
    newOfferings[index][field] = value
    setOfferings(newOfferings)
  }

  function addFaq() {
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  function removeFaq(index: number) {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  function updateFaq(index: number, field: string, value: string) {
    const newFaqs = [...faqs]
    newFaqs[index][field] = value
    setFaqs(newFaqs)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Brand not found</p>
          <Link 
            href="/brands"
            className="text-[#2979FF] hover:text-[#2979FF]/80"
          >
            ← Back to Brands
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#101A31]">
      
      {/* Use FrostedNav - same as landing page */}
      <FrostedNav />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
              <Image
                src={brand.logo_url}
                alt={brand.brand_name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {brand.brand_name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Verified Profile</span>
                <span className="text-white/30">•</span>
                <span>Claimed {new Date(brand.claimed_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <p className="text-white/60 text-sm md:text-base">
            Update your brand information. Scans reflect how AI models describe your brand.
          </p>
        </div>

        {/* Harbor Score (Horizontal with Rescan) */}
        <HarborScoreBreakdown
          harborScore={harborScore}
          visibilityScore={brand.visibility_score}
          websiteReadiness={websiteReadiness}
          previousHarborScore={brand.previous_harbor_score}
          scoreChange={brand.harbor_score_change}
          lastScanAt={brand.last_scan_at}
          onRescan={handleRescan}
          rescanning={rescanning}
          className="mb-6"
        />

        {/* Profile Progress */}
        <ProfileCompletenessBar
          completeness={profileCompleteness}
          potentialImprovement={calculatePotentialImprovement(websiteReadiness, {
            description,
            offerings,
            faqs,
            companyInfo
          })}
          suggestions={suggestions}
          className="mb-6"
        />

        {/* Competitor Analysis - Positioned prominently after score */}
        {competitorData && (
          <CompetitorModule 
            competitors={competitorData.competitors}
            userRank={competitorData.userRank}
            totalInCategory={competitorData.totalInCategory || competitorData.competitors.length}
            category={competitorData.category || brand.industry}
            isPro={false}
            onUpgrade={() => {
              alert('Harbor Pro upgrade coming soon! Get notified: derek@useharbor.io')
            }}
            className="mb-6"
          />
        )}

        {/* Edit Form - Single Column */}
        <div className="space-y-6">
          
          {/* Brand Description */}
          <div className="bg-[#0C1422] rounded-xl border border-white/5 p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Brand Description</h2>
                <p className="text-white/60 text-sm mt-1">
                  This field is used by AI models to infer your brand's purpose and category.
                </p>
              </div>
              {!description && (
                <div className="px-3 py-1 rounded bg-[#F25A5A]/10 border border-[#F25A5A]/20">
                  <span className="text-[#F25A5A] text-xs font-medium">Missing</span>
                </div>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              className={`w-full h-32 px-4 py-3 rounded-lg border text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors resize-none ${
                isEditing 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-75'
              }`}
              placeholder="e.g., We provide cloud-based project management software for teams..."
              maxLength={500}
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-white/50 text-xs">
                This description appears on your public profile and in AI responses.
              </p>
              <span className="text-white/40 text-xs">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Products & Services */}
          <div className="bg-[#0C1422] rounded-xl border border-white/5 p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white">Products & Services</h2>
                  {offerings.length === 0 && (
                    <div className="px-3 py-1 rounded bg-[#F25A5A]/10 border border-[#F25A5A]/20">
                      <span className="text-[#F25A5A] text-xs font-medium">Missing</span>
                    </div>
                  )}
                </div>
                <p className="text-white/60 text-sm">
                  Completing this field improves AI understanding of your offerings.
                </p>
              </div>
              <button
                onClick={addOffering}
                disabled={!isEditing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {offerings.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">
                No products or services added yet. Click "Add" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {offerings.map((offering, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-lg bg-white/5 border border-white/10 relative group"
                  >
                    {isEditing && (
                      <button
                        onClick={() => removeOffering(idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <input
                      type="text"
                      value={offering.name}
                      onChange={(e) => updateOffering(idx, 'name', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full mb-2 px-3 py-2 rounded border text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors ${
                        isEditing ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-75'
                      }`}
                      placeholder="Product/Service name"
                    />
                    <textarea
                      value={offering.description}
                      onChange={(e) => updateOffering(idx, 'description', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded border text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors resize-none ${
                        isEditing ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-75'
                      }`}
                      placeholder="Brief description..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs */}
          <div className="bg-[#0C1422] rounded-xl border border-white/5 p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
                  {faqs.length === 0 && (
                    <div className="px-3 py-1 rounded bg-[#F25A5A]/10 border border-[#F25A5A]/20">
                      <span className="text-[#F25A5A] text-xs font-medium">Missing</span>
                    </div>
                  )}
                </div>
                <p className="text-white/60 text-sm">
                  Completing this field improves AI understanding of common questions about your brand.
                </p>
              </div>
              <button
                onClick={addFaq}
                disabled={!isEditing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">
                No FAQs added yet. Click "Add" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-lg bg-white/5 border border-white/10 relative group"
                  >
                    {isEditing && (
                      <button
                        onClick={() => removeFaq(idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full mb-2 px-3 py-2 rounded border text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors font-medium ${
                        isEditing ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-75'
                      }`}
                      placeholder="Question?"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded border text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors resize-none ${
                        isEditing ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-75'
                      }`}
                      placeholder="Answer..."
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company Information */}
          <div className="bg-[#0C1422] rounded-xl border border-white/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-white">Company Information</h2>
              <div className="px-3 py-1 rounded bg-white/5 border border-white/10">
                <span className="text-white/60 text-xs font-medium">Optional</span>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-6">
              Optional details that help AI models provide accurate factual information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Headquarters</label>
                <input
                  type="text"
                  value={companyInfo.hq_location || ''}
                  onChange={(e) => setCompanyInfo({...companyInfo, hq_location: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 rounded border text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors ${
                    isEditing ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-75'
                  }`}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Founded Year</label>
                <input
                  type="number"
                  value={companyInfo.founded_year || ''}
                  onChange={(e) => setCompanyInfo({...companyInfo, founded_year: parseInt(e.target.value) || null})}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 rounded border text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors ${
                    isEditing ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-75'
                  }`}
                  placeholder="e.g., 2015"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Action Bar with Inline Notification */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
            <a
              href={`https://${brand.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center sm:justify-start gap-2 text-white/70 hover:text-white transition-colors text-sm"
            >
              Visit {brand.brand_name}
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-3">
              {/* Inline Status Message */}
              {message && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg animate-in fade-in duration-200 ${
                  message.type === 'success' 
                    ? 'bg-green-400/10 border border-green-400/20' 
                    : 'bg-red-400/10 border border-red-400/20'
                }`}>
                  {message.type === 'success' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* Edit/Save Button */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                >
                  <AlertCircle className="w-5 h-5" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#FF6B4A] text-white font-medium hover:bg-[#FF6B4A]/90 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
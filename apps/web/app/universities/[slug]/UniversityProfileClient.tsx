// app/universities/[slug]/UniversityProfileClient.tsx
'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, ExternalLink, MapPin, Users, Trophy, GraduationCap, DollarSign, Calendar, Share2, Swords } from 'lucide-react'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

interface University {
  id: string
  name: string
  short_name: string | null
  slug: string
  domain: string | null
  logo_url: string | null
  city: string | null
  state: string | null
  country: string | null
  institution_type: string | null
  enrollment: number | null
  acceptance_rate: number | null
  graduation_rate: number | null
  endowment_billions: number | null
  founded_year: number | null
  us_news_rank: number | null
  forbes_rank: number | null
  athletic_conference: string | null
  tags: string[] | null
  known_for: string[] | null
  visibility_score: number | null
  total_mentions: number | null
  avg_position: number | null
  sentiment_score: number | null
  last_scan_at: string | null
  rival_ids: string[] | null
}

// Mock prompt data - in production this would come from scans
const MOCK_PROMPTS = [
  { prompt: 'Best engineering schools in the US', position: 2, sentiment: 'positive', model: 'ChatGPT' },
  { prompt: 'Is [university] worth the cost?', position: 1, sentiment: 'positive', model: 'Claude' },
  { prompt: 'Top computer science programs', position: 3, sentiment: 'positive', model: 'Perplexity' },
  { prompt: 'Best universities for pre-med', position: 5, sentiment: 'neutral', model: 'ChatGPT' },
  { prompt: '[university] vs [rival] which is better', position: 1, sentiment: 'positive', model: 'Gemini' },
  { prompt: 'Most prestigious universities', position: 4, sentiment: 'positive', model: 'Claude' },
]

const MOCK_AI_SAYS = [
  "Known for its entrepreneurial culture and proximity to Silicon Valley",
  "Highly selective with a strong emphasis on interdisciplinary research", 
  "Produces more startup founders than almost any other university",
  "Beautiful campus with world-class athletic facilities",
  "Strong programs across engineering, business, and humanities",
]

interface Props {
  university: University
  rivals?: University[]
}

export default function UniversityProfileClient({ university, rivals = [] }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'prompts' | 'comparison'>('overview')

  // Get logo URL with Brandfetch fallback
  const getLogoUrl = (uni: University) => {
    if (uni.logo_url) return uni.logo_url
    if (uni.domain) return `https://cdn.brandfetch.io/${uni.domain}?c=1id1Fyz-h7an5-5KR_y`
    return null
  }

  const logoUrl = getLogoUrl(university)
  const trend = (university.visibility_score || 0) > 85 ? 'up' : 'down'
  const trendValue = trend === 'up' ? '+2.3%' : '-1.2%'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 px-6 overflow-hidden">
        {/* Background glow based on score */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(ellipse at center, ${(university.visibility_score || 0) > 85 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'} 0%, transparent 70%)`
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Back link */}
          <Link 
            href="/universities"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rankings
          </Link>

          {/* University Header */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={university.name} className="w-20 h-20 md:w-24 md:h-24 object-contain" />
              ) : (
                <span className="text-3xl font-bold text-white/40">
                  {(university.short_name || university.name).slice(0, 2)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {university.name}
                </h1>
                {university.domain && (
                  <a 
                    href={`https://${university.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white/60 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-white/50 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{university.city}, {university.state}</span>
                </div>
                {university.athletic_conference && (
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>{university.athletic_conference}</span>
                  </div>
                )}
                {university.institution_type && (
                  <span className="px-2.5 py-1 bg-white/5 rounded-full text-xs capitalize">
                    {university.institution_type}
                  </span>
                )}
              </div>

              {/* Tags */}
              {university.known_for && university.known_for.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {university.known_for.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Score Card */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 text-center min-w-[160px]">
              <div className="text-4xl font-bold text-white mb-1">
                {university.visibility_score?.toFixed(1)}%
              </div>
              <div className="text-white/50 text-sm mb-3">AI Visibility Score</div>
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm ${
                trend === 'up' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* What AI Says */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              What AI Says About {university.short_name || university.name}
            </h2>
            
            <div className="space-y-4">
              {MOCK_AI_SAYS.map((statement, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/40 text-xs">{idx + 1}</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">{statement}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-white/40 text-sm">
              Based on analysis of {university.total_mentions?.toLocaleString() || '1,000+'} AI-generated responses
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Trophy className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">US News Rank</span>
              </div>
              <div className="text-2xl font-bold text-white">#{university.us_news_rank || '—'}</div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Acceptance</span>
              </div>
              <div className="text-2xl font-bold text-white">{university.acceptance_rate || '—'}%</div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Enrollment</span>
              </div>
              <div className="text-2xl font-bold text-white">{university.enrollment?.toLocaleString() || '—'}</div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Founded</span>
              </div>
              <div className="text-2xl font-bold text-white">{university.founded_year || '—'}</div>
            </div>
          </div>

          {/* Prompt Appearances */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              Prompt Appearances
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Where {university.short_name || university.name} appears in AI responses
            </p>

            <div className="space-y-3">
              {MOCK_PROMPTS.map((prompt, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      prompt.position <= 2 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : prompt.position <= 4 
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      #{prompt.position}
                    </div>
                    <div>
                      <p className="text-white text-sm">{prompt.prompt.replace('[university]', university.short_name || university.name).replace('[rival]', 'rival')}</p>
                      <p className="text-white/40 text-xs mt-0.5">{prompt.model}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs ${
                    prompt.sentiment === 'positive' 
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : prompt.sentiment === 'neutral'
                      ? 'bg-white/10 text-white/60'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {prompt.sentiment}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rivals Section */}
          {rivals.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Swords className="w-5 h-5 text-white/50" />
                <h2 className="text-xl font-semibold text-white">Traditional Rivals</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {rivals.map(rival => (
                  <Link
                    key={rival.id}
                    href={`/universities/compare?a=${university.slug}&b=${rival.slug}`}
                    className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center">
                        {getLogoUrl(rival) ? (
                          <img src={getLogoUrl(rival)!} alt={rival.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-sm font-bold text-white/40">{(rival.short_name || rival.name).slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{rival.short_name || rival.name}</div>
                        <div className="text-white/40 text-xs">{rival.visibility_score?.toFixed(1)}% AI Score</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-white/50 mb-4">Want to improve {university.short_name || university.name}'s AI visibility?</p>
            <Link
              href={`/contact?inquiry=university&school=${university.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
            >
              Talk to Our Team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

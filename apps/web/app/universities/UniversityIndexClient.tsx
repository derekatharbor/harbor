// app/universities/UniversityIndexClient.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, ArrowRight, TrendingUp, TrendingDown, ChevronDown, X, Share2, Trophy, Swords, Sparkles, GraduationCap, Beaker, Briefcase, PartyPopper, DollarSign } from 'lucide-react'
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
  institution_type: string | null
  enrollment: number | null
  acceptance_rate: number | null
  us_news_rank: number | null
  athletic_conference: string | null
  visibility_score: number | null
  total_mentions: number | null
  sentiment_score: number | null
  known_for: string[] | null
}

// Pre-built rivalries
const CLASSIC_RIVALRIES = [
  { a: 'harvard', b: 'yale', name: 'The Game' },
  { a: 'stanford', b: 'uc-berkeley', name: 'The Big Game' },
  { a: 'michigan', b: 'ohio-state', name: 'The Game' },
  { a: 'duke', b: 'unc', name: 'Tobacco Road' },
  { a: 'usc', b: 'ucla', name: 'Crosstown Showdown' },
  { a: 'texas', b: 'texas-am', name: 'Lone Star Showdown' },
]

// Featured university domains for marquee (3 rows)
const MARQUEE_SCHOOLS = [
  // Row 1 (moves left)
  ['mit.edu', 'stanford.edu', 'harvard.edu', 'yale.edu', 'princeton.edu', 'columbia.edu', 'upenn.edu', 'brown.edu', 'dartmouth.edu', 'cornell.edu', 'duke.edu', 'northwestern.edu'],
  // Row 2 (moves right)
  ['berkeley.edu', 'ucla.edu', 'umich.edu', 'uchicago.edu', 'cmu.edu', 'nyu.edu', 'usc.edu', 'nd.edu', 'virginia.edu', 'wustl.edu', 'rice.edu', 'vanderbilt.edu'],
  // Row 3 (moves left)
  ['gatech.edu', 'utexas.edu', 'wisc.edu', 'illinois.edu', 'unc.edu', 'bu.edu', 'bc.edu', 'tufts.edu', 'rochester.edu', 'case.edu', 'lehigh.edu', 'wfu.edu'],
]

const CONFERENCES = [
  'All Conferences',
  'Ivy League',
  'Big Ten',
  'ACC',
  'SEC',
  'Big 12',
  'PAC-12',
]

const INSTITUTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

// Insight categories for the "Best For" section
const INSIGHT_CATEGORIES = [
  { key: 'engineering', label: 'Best for Engineering', icon: Beaker, keywords: ['Engineering', 'Computer Science', 'Tech'] },
  { key: 'business', label: 'Best for Business', icon: Briefcase, keywords: ['Business', 'Finance', 'MBA'] },
  { key: 'research', label: 'Best for Research', icon: Sparkles, keywords: ['Research'] },
  { key: 'premed', label: 'Best for Pre-Med', icon: GraduationCap, keywords: ['Medicine', 'Pre-Med', 'Medical'] },
]

// Marquee Row Component
function MarqueeRow({ domains, direction, speed = 30 }: { domains: string[], direction: 'left' | 'right', speed?: number }) {
  const duplicatedDomains = [...domains, ...domains, ...domains]
  
  return (
    <div className="flex overflow-hidden py-1">
      <div 
        className={`flex gap-6 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicatedDomains.map((domain, idx) => (
          <div 
            key={`${domain}-${idx}`}
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-xl flex-shrink-0 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <img 
              src={`https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`}
              alt={domain}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  universities: University[]
  totalCount: number
}

export default function UniversityIndexClient({ universities: initialUniversities, totalCount }: Props) {
  const [universities, setUniversities] = useState<University[]>(initialUniversities)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<University[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [conferenceFilter, setConferenceFilter] = useState('All Conferences')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isSearching, setIsSearching] = useState(false)
  
  // Comparison state
  const [compareA, setCompareA] = useState<University | null>(null)
  const [compareB, setCompareB] = useState<University | null>(null)
  const [compareSearchA, setCompareSearchA] = useState('')
  const [compareSearchB, setCompareSearchB] = useState('')
  const [compareResultsA, setCompareResultsA] = useState<University[]>([])
  const [compareResultsB, setCompareResultsB] = useState<University[]>([])
  const [showCompareDropdownA, setShowCompareDropdownA] = useState(false)
  const [showCompareDropdownB, setShowCompareDropdownB] = useState(false)

  // Search API function
  const searchUniversities = useCallback(async (query: string): Promise<University[]> => {
    if (!query.trim()) return []
    
    try {
      const res = await fetch(`/api/universities?search=${encodeURIComponent(query)}&limit=8`)
      if (!res.ok) return []
      return await res.json()
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }, [])

  // Handle main search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    setIsSearching(true)
    const debounce = setTimeout(async () => {
      const results = await searchUniversities(searchQuery)
      setSearchResults(results)
      setShowSearchDropdown(true)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, searchUniversities])

  // Handle compare search A
  useEffect(() => {
    if (!compareSearchA.trim() || compareA) {
      setCompareResultsA([])
      setShowCompareDropdownA(false)
      return
    }

    const debounce = setTimeout(async () => {
      const results = await searchUniversities(compareSearchA)
      setCompareResultsA(results)
      setShowCompareDropdownA(true)
    }, 300)

    return () => clearTimeout(debounce)
  }, [compareSearchA, compareA, searchUniversities])

  // Handle compare search B
  useEffect(() => {
    if (!compareSearchB.trim() || compareB) {
      setCompareResultsB([])
      setShowCompareDropdownB(false)
      return
    }

    const debounce = setTimeout(async () => {
      const results = await searchUniversities(compareSearchB)
      setCompareResultsB(results)
      setShowCompareDropdownB(true)
    }, 300)

    return () => clearTimeout(debounce)
  }, [compareSearchB, compareB, searchUniversities])

  // Filter displayed universities
  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      const matchesConference = conferenceFilter === 'All Conferences' || 
        uni.athletic_conference === conferenceFilter
      
      const matchesType = typeFilter === 'all' || 
        uni.institution_type === typeFilter

      return matchesConference && matchesType
    })
  }, [universities, conferenceFilter, typeFilter])

  // Get rank based on visibility score
  const getRank = (uni: University) => {
    const sorted = [...universities].sort((a, b) => (b.visibility_score || 0) - (a.visibility_score || 0))
    return sorted.findIndex(u => u.id === uni.id) + 1
  }

  // Get logo URL with Brandfetch fallback
  const getLogoUrl = (uni: University) => {
    if (uni.logo_url) return uni.logo_url
    if (uni.domain) return `https://cdn.brandfetch.io/${uni.domain}?c=1id1Fyz-h7an5-5KR_y`
    return null
  }

  // Get insight leaders (universities best known for each category)
  const getInsightLeaders = () => {
    return INSIGHT_CATEGORIES.map(category => {
      const leader = universities.find(uni => 
        uni.known_for?.some(kf => 
          category.keywords.some(kw => kf.toLowerCase().includes(kw.toLowerCase()))
        )
      )
      return { ...category, university: leader }
    }).filter(c => c.university)
  }

  const insightLeaders = getInsightLeaders()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Add marquee animations */}
      <style jsx global>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right linear infinite;
        }
      `}</style>

      <Nav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-8 md:pt-40 md:pb-12 px-6 overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
          }}
        />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-white/60 text-sm">University AI Rankings</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
            The AI Admissions Office
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
            How ChatGPT, Claude, and Perplexity rank {totalCount.toLocaleString()}+ universities
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                placeholder="Search universities..."
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors cursor-text"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchDropdown(false)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden z-50 shadow-2xl">
                {searchResults.map(uni => (
                  <Link
                    key={uni.id}
                    href={`/universities/${uni.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setShowSearchDropdown(false)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {getLogoUrl(uni) ? (
                        <img src={getLogoUrl(uni)!} alt={uni.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white/40">{(uni.short_name || uni.name).slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{uni.short_name || uni.name}</div>
                      <div className="text-white/40 text-sm truncate">{uni.city}, {uni.state}</div>
                    </div>
                    <div className="text-white/60 text-sm font-medium">{uni.visibility_score?.toFixed(1)}%</div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {showSearchDropdown && searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.08] rounded-xl p-6 text-center z-50">
                <p className="text-white/60 text-sm">No universities found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Perspective Logo Marquee (Profound-style) */}
      <section className="relative py-10 overflow-hidden">
        {/* Contained perspective wrapper */}
        <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden">
          {/* Center glow/highlight */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 60%)'
            }}
          />
          
          {/* Left fade mask */}
          <div 
            className="absolute left-0 top-0 w-[200px] h-full z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 100%)'
            }}
          />
          
          {/* Right fade mask */}
          <div 
            className="absolute right-0 top-0 w-[200px] h-full z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, rgba(10,10,10,1) 0%, rgba(10,10,10,0) 100%)'
            }}
          />

          {/* Perspective container */}
          <div style={{ perspective: '1200px' }}>
            {/* 3D tilted rows container */}
            <div 
              className="py-4"
              style={{
                transform: 'rotateX(8deg) translateZ(0)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Row 1 - moves left */}
              <MarqueeRow domains={MARQUEE_SCHOOLS[0]} direction="left" speed={40} />
              
              {/* Row 2 - moves right */}
              <MarqueeRow domains={MARQUEE_SCHOOLS[1]} direction="right" speed={35} />
              
              {/* Row 3 - moves left */}
              <MarqueeRow domains={MARQUEE_SCHOOLS[2]} direction="left" speed={45} />
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section - Best For Categories */}
      {insightLeaders.length > 0 && (
        <section className="pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">AI Says They're Best For</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {insightLeaders.map((insight) => {
                const Icon = insight.icon
                const uni = insight.university!
                return (
                  <Link
                    key={insight.key}
                    href={`/universities/${uni.slug}`}
                    className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-white/50" />
                      <span className="text-white/50 text-xs uppercase tracking-wider">{insight.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {getLogoUrl(uni) ? (
                          <img src={getLogoUrl(uni)!} alt={uni.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white/40">{(uni.short_name || uni.name).slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm group-hover:text-white/90">{uni.short_name || uni.name}</div>
                        <div className="text-white/40 text-xs">{uni.visibility_score?.toFixed(1)}% score</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Classic Rivalries Section */}
      <section className="pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Swords className="w-5 h-5 text-white/50" />
            <h2 className="text-lg font-semibold text-white">Classic Rivalries</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CLASSIC_RIVALRIES.map((rivalry, idx) => {
              const uniA = universities.find(u => u.slug === rivalry.a)
              const uniB = universities.find(u => u.slug === rivalry.b)
              if (!uniA || !uniB) return null

              return (
                <Link
                  key={idx}
                  href={`/universities/compare?a=${rivalry.a}&b=${rivalry.b}`}
                  className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 text-center transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                      {getLogoUrl(uniA) ? (
                        <img src={getLogoUrl(uniA)!} alt={uniA.short_name || uniA.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white/60">{(uniA.short_name || uniA.name).slice(0, 2)}</span>
                      )}
                    </div>
                    <span className="text-white/40 text-xs">vs</span>
                    <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                      {getLogoUrl(uniB) ? (
                        <img src={getLogoUrl(uniB)!} alt={uniB.short_name || uniB.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white/60">{(uniB.short_name || uniB.name).slice(0, 2)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">
                    {rivalry.name}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Build Your Own Comparison */}
      <section className="pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Build Your Own Matchup</h3>
                <p className="text-white/50 text-sm">Compare any two universities head-to-head</p>
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
              {/* University A Selector */}
              <div className="relative">
                {compareA ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {getLogoUrl(compareA) ? (
                        <img src={getLogoUrl(compareA)!} alt={compareA.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white/60">{(compareA.short_name || compareA.name).slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{compareA.short_name || compareA.name}</div>
                      <div className="text-white/40 text-xs">{compareA.visibility_score?.toFixed(1)}% AI Score</div>
                    </div>
                    <button
                      onClick={() => setCompareA(null)}
                      className="text-white/40 hover:text-white/60 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={compareSearchA}
                      onChange={(e) => setCompareSearchA(e.target.value)}
                      onFocus={() => compareSearchA && setShowCompareDropdownA(true)}
                      placeholder="Search first university..."
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                    />
                    {showCompareDropdownA && compareResultsA.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden z-10 shadow-xl">
                        {compareResultsA.map(uni => (
                          <button
                            key={uni.id}
                            onClick={() => {
                              setCompareA(uni)
                              setCompareSearchA('')
                              setShowCompareDropdownA(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                              {getLogoUrl(uni) ? (
                                <img src={getLogoUrl(uni)!} alt={uni.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-white/60">{(uni.short_name || uni.name).slice(0, 2)}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-white text-sm">{uni.short_name || uni.name}</div>
                              <div className="text-white/40 text-xs">{uni.city}, {uni.state}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* VS */}
              <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 self-center">
                <span className="text-white/60 font-bold text-sm">VS</span>
              </div>

              {/* University B Selector */}
              <div className="relative">
                {compareB ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {getLogoUrl(compareB) ? (
                        <img src={getLogoUrl(compareB)!} alt={compareB.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white/60">{(compareB.short_name || compareB.name).slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{compareB.short_name || compareB.name}</div>
                      <div className="text-white/40 text-xs">{compareB.visibility_score?.toFixed(1)}% AI Score</div>
                    </div>
                    <button
                      onClick={() => setCompareB(null)}
                      className="text-white/40 hover:text-white/60 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={compareSearchB}
                      onChange={(e) => setCompareSearchB(e.target.value)}
                      onFocus={() => compareSearchB && setShowCompareDropdownB(true)}
                      placeholder="Search second university..."
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                    />
                    {showCompareDropdownB && compareResultsB.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden z-10 shadow-xl">
                        {compareResultsB.map(uni => (
                          <button
                            key={uni.id}
                            onClick={() => {
                              setCompareB(uni)
                              setCompareSearchB('')
                              setShowCompareDropdownB(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                              {getLogoUrl(uni) ? (
                                <img src={getLogoUrl(uni)!} alt={uni.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-white/60">{(uni.short_name || uni.name).slice(0, 2)}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-white text-sm">{uni.short_name || uni.name}</div>
                              <div className="text-white/40 text-xs">{uni.city}, {uni.state}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Compare Button */}
            {compareA && compareB && (
              <div className="mt-6 flex justify-center">
                <Link
                  href={`/universities/compare?a=${compareA.slug}&b=${compareB.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Compare Universities
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            {/* Conference Filter */}
            <div className="relative">
              <select
                value={conferenceFilter}
                onChange={(e) => setConferenceFilter(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-white/20 cursor-pointer"
              >
                {CONFERENCES.map(conf => (
                  <option key={conf} value={conf} className="bg-[#141414]">{conf}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-white/20 cursor-pointer"
              >
                {INSTITUTION_TYPES.map(type => (
                  <option key={type.value} value={type.value} className="bg-[#141414]">{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            {/* Results count */}
            <span className="text-white/40 text-sm ml-auto">
              Showing {filteredUniversities.length} of {totalCount.toLocaleString()} universities
            </span>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">Rank</th>
                  <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">University</th>
                  <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4 hidden md:table-cell">Conference</th>
                  <th className="text-left text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Type</th>
                  <th className="text-right text-white/50 text-xs font-medium uppercase tracking-wider px-6 py-4">AI Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredUniversities.map((uni) => {
                  const rank = getRank(uni)
                  const trend = (uni.visibility_score || 0) > 80 ? 'up' : 'down'
                  
                  return (
                    <tr 
                      key={uni.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/universities/${uni.slug}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${rank <= 3 ? 'text-amber-400 font-bold' : 'text-white/60'}`}>
                            #{rank}
                          </span>
                          {trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {getLogoUrl(uni) ? (
                              <img src={getLogoUrl(uni)!} alt={uni.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-white/40">{(uni.short_name || uni.name).slice(0, 2)}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium">{uni.short_name || uni.name}</div>
                            <div className="text-white/40 text-sm">{uni.city}, {uni.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-white/60 text-sm">{uni.athletic_conference || '—'}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="px-2.5 py-1 bg-white/5 rounded-full text-white/60 text-xs capitalize">
                          {uni.institution_type || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-semibold">{uni.visibility_score?.toFixed(1)}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Browse More Button */}
          {filteredUniversities.length < totalCount && (
            <div className="mt-6 text-center">
              <Link
                href="/universities/all"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                Browse all {totalCount.toLocaleString()} schools
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Want to improve your university's AI visibility?
            </h3>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">
              Harbor helps universities understand how AI talks about them to prospective students and parents.
            </p>
            <Link
              href="/contact?inquiry=university"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors cursor-pointer"
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
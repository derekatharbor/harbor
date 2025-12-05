// app/universities/UniversityIndexClient.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ArrowRight, TrendingUp, TrendingDown, ChevronDown, X, Download, Share2, Trophy, Swords } from 'lucide-react'
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

// Mock data for development
const MOCK_UNIVERSITIES: University[] = [
  { id: '1', name: 'Stanford University', short_name: 'Stanford', slug: 'stanford', domain: 'stanford.edu', logo_url: null, city: 'Stanford', state: 'CA', institution_type: 'private', enrollment: 17680, acceptance_rate: 3.68, us_news_rank: 3, athletic_conference: 'ACC', visibility_score: 94.2, total_mentions: 2847, sentiment_score: 89.5, known_for: ['Computer Science', 'Engineering', 'Business'] },
  { id: '2', name: 'Massachusetts Institute of Technology', short_name: 'MIT', slug: 'mit', domain: 'mit.edu', logo_url: null, city: 'Cambridge', state: 'MA', institution_type: 'private', enrollment: 11858, acceptance_rate: 3.96, us_news_rank: 2, athletic_conference: 'NEWMAC', visibility_score: 93.8, total_mentions: 3124, sentiment_score: 91.2, known_for: ['Engineering', 'Computer Science', 'Research'] },
  { id: '3', name: 'Harvard University', short_name: 'Harvard', slug: 'harvard', domain: 'harvard.edu', logo_url: null, city: 'Cambridge', state: 'MA', institution_type: 'private', enrollment: 23731, acceptance_rate: 3.19, us_news_rank: 4, athletic_conference: 'Ivy League', visibility_score: 92.5, total_mentions: 4521, sentiment_score: 85.3, known_for: ['Law', 'Business', 'Medicine'] },
  { id: '4', name: 'Yale University', short_name: 'Yale', slug: 'yale', domain: 'yale.edu', logo_url: null, city: 'New Haven', state: 'CT', institution_type: 'private', enrollment: 14776, acceptance_rate: 4.35, us_news_rank: 5, athletic_conference: 'Ivy League', visibility_score: 89.7, total_mentions: 2156, sentiment_score: 87.8, known_for: ['Law', 'Drama', 'Liberal Arts'] },
  { id: '5', name: 'Princeton University', short_name: 'Princeton', slug: 'princeton', domain: 'princeton.edu', logo_url: null, city: 'Princeton', state: 'NJ', institution_type: 'private', enrollment: 8478, acceptance_rate: 3.98, us_news_rank: 1, athletic_conference: 'Ivy League', visibility_score: 88.4, total_mentions: 1987, sentiment_score: 90.1, known_for: ['Mathematics', 'Physics', 'Economics'] },
  { id: '6', name: 'University of California, Berkeley', short_name: 'UC Berkeley', slug: 'uc-berkeley', domain: 'berkeley.edu', logo_url: null, city: 'Berkeley', state: 'CA', institution_type: 'public', enrollment: 45307, acceptance_rate: 11.6, us_news_rank: 15, athletic_conference: 'Big Ten', visibility_score: 87.9, total_mentions: 2654, sentiment_score: 82.4, known_for: ['Computer Science', 'Engineering', 'Research'] },
  { id: '7', name: 'University of Michigan', short_name: 'Michigan', slug: 'michigan', domain: 'umich.edu', logo_url: null, city: 'Ann Arbor', state: 'MI', institution_type: 'public', enrollment: 47907, acceptance_rate: 17.7, us_news_rank: 21, athletic_conference: 'Big Ten', visibility_score: 85.2, total_mentions: 2234, sentiment_score: 84.7, known_for: ['Business', 'Engineering', 'Sports'] },
  { id: '8', name: 'Duke University', short_name: 'Duke', slug: 'duke', domain: 'duke.edu', logo_url: null, city: 'Durham', state: 'NC', institution_type: 'private', enrollment: 17620, acceptance_rate: 5.93, us_news_rank: 7, athletic_conference: 'ACC', visibility_score: 84.8, total_mentions: 1876, sentiment_score: 86.9, known_for: ['Basketball', 'Medicine', 'Business'] },
  { id: '9', name: 'University of Pennsylvania', short_name: 'Penn', slug: 'upenn', domain: 'upenn.edu', logo_url: null, city: 'Philadelphia', state: 'PA', institution_type: 'private', enrollment: 28201, acceptance_rate: 5.68, us_news_rank: 6, athletic_conference: 'Ivy League', visibility_score: 84.1, total_mentions: 1654, sentiment_score: 85.2, known_for: ['Business', 'Finance', 'Medicine'] },
  { id: '10', name: 'Columbia University', short_name: 'Columbia', slug: 'columbia', domain: 'columbia.edu', logo_url: null, city: 'New York', state: 'NY', institution_type: 'private', enrollment: 36649, acceptance_rate: 3.85, us_news_rank: 12, athletic_conference: 'Ivy League', visibility_score: 83.6, total_mentions: 2087, sentiment_score: 81.5, known_for: ['Journalism', 'Business', 'Law'] },
  { id: '11', name: 'University of Notre Dame', short_name: 'Notre Dame', slug: 'notre-dame', domain: 'nd.edu', logo_url: null, city: 'Notre Dame', state: 'IN', institution_type: 'private', enrollment: 14012, acceptance_rate: 12.9, us_news_rank: 18, athletic_conference: 'ACC', visibility_score: 82.4, total_mentions: 1543, sentiment_score: 88.7, known_for: ['Football', 'Business', 'Theology'] },
  { id: '12', name: 'Northwestern University', short_name: 'Northwestern', slug: 'northwestern', domain: 'northwestern.edu', logo_url: null, city: 'Evanston', state: 'IL', institution_type: 'private', enrollment: 23161, acceptance_rate: 7.0, us_news_rank: 9, athletic_conference: 'Big Ten', visibility_score: 81.9, total_mentions: 1432, sentiment_score: 84.3, known_for: ['Journalism', 'Business', 'Engineering'] },
  { id: '13', name: 'University of Southern California', short_name: 'USC', slug: 'usc', domain: 'usc.edu', logo_url: null, city: 'Los Angeles', state: 'CA', institution_type: 'private', enrollment: 49500, acceptance_rate: 9.2, us_news_rank: 28, athletic_conference: 'Big Ten', visibility_score: 81.2, total_mentions: 1876, sentiment_score: 79.8, known_for: ['Film', 'Business', 'Football'] },
  { id: '14', name: 'University of Texas at Austin', short_name: 'UT Austin', slug: 'ut-austin', domain: 'utexas.edu', logo_url: null, city: 'Austin', state: 'TX', institution_type: 'public', enrollment: 51991, acceptance_rate: 31.8, us_news_rank: 32, athletic_conference: 'SEC', visibility_score: 80.5, total_mentions: 1987, sentiment_score: 82.1, known_for: ['Business', 'Engineering', 'Football'] },
  { id: '15', name: 'Ohio State University', short_name: 'Ohio State', slug: 'ohio-state', domain: 'osu.edu', logo_url: null, city: 'Columbus', state: 'OH', institution_type: 'public', enrollment: 61369, acceptance_rate: 53.0, us_news_rank: 43, athletic_conference: 'Big Ten', visibility_score: 79.8, total_mentions: 1654, sentiment_score: 80.4, known_for: ['Football', 'Engineering', 'Business'] },
  { id: '16', name: 'University of North Carolina at Chapel Hill', short_name: 'UNC', slug: 'unc-chapel-hill', domain: 'unc.edu', logo_url: null, city: 'Chapel Hill', state: 'NC', institution_type: 'public', enrollment: 32385, acceptance_rate: 16.8, us_news_rank: 22, athletic_conference: 'ACC', visibility_score: 79.2, total_mentions: 1432, sentiment_score: 83.6, known_for: ['Basketball', 'Public Health', 'Business'] },
  { id: '17', name: 'University of Florida', short_name: 'UF', slug: 'uf', domain: 'ufl.edu', logo_url: null, city: 'Gainesville', state: 'FL', institution_type: 'public', enrollment: 61833, acceptance_rate: 23.3, us_news_rank: 28, athletic_conference: 'SEC', visibility_score: 78.4, total_mentions: 1321, sentiment_score: 81.2, known_for: ['Research', 'Sports', 'Business'] },
  { id: '18', name: 'Georgia Institute of Technology', short_name: 'Georgia Tech', slug: 'georgia-tech', domain: 'gatech.edu', logo_url: null, city: 'Atlanta', state: 'GA', institution_type: 'public', enrollment: 47285, acceptance_rate: 16.9, us_news_rank: 33, athletic_conference: 'ACC', visibility_score: 77.8, total_mentions: 1543, sentiment_score: 84.9, known_for: ['Engineering', 'Computer Science', 'Research'] },
  { id: '19', name: 'University of California, Los Angeles', short_name: 'UCLA', slug: 'ucla', domain: 'ucla.edu', logo_url: null, city: 'Los Angeles', state: 'CA', institution_type: 'public', enrollment: 46430, acceptance_rate: 8.76, us_news_rank: 15, athletic_conference: 'Big Ten', visibility_score: 86.3, total_mentions: 2432, sentiment_score: 83.7, known_for: ['Film', 'Medicine', 'Basketball'] },
  { id: '20', name: 'Cornell University', short_name: 'Cornell', slug: 'cornell', domain: 'cornell.edu', logo_url: null, city: 'Ithaca', state: 'NY', institution_type: 'private', enrollment: 25898, acceptance_rate: 7.26, us_news_rank: 12, athletic_conference: 'Ivy League', visibility_score: 82.7, total_mentions: 1765, sentiment_score: 85.4, known_for: ['Engineering', 'Hotel Management', 'Agriculture'] },
]

// Pre-built rivalries
const CLASSIC_RIVALRIES = [
  { a: 'harvard', b: 'yale', name: 'The Game' },
  { a: 'stanford', b: 'uc-berkeley', name: 'The Big Game' },
  { a: 'michigan', b: 'ohio-state', name: 'The Game' },
  { a: 'duke', b: 'unc-chapel-hill', name: 'Tobacco Road' },
  { a: 'usc', b: 'ucla', name: 'Crosstown Showdown' },
  { a: 'ut-austin', b: 'uf', name: 'SEC Showdown' },
]

const CONFERENCES = [
  'All Conferences',
  'Ivy League',
  'Big Ten',
  'ACC',
  'SEC',
  'Big 12',
  'PAC-12',
  'NEWMAC',
]

const INSTITUTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

interface Props {
  universities?: University[]
}

export default function UniversityIndexClient({ universities: serverUniversities }: Props) {
  const [universities, setUniversities] = useState<University[]>(serverUniversities || MOCK_UNIVERSITIES)
  const [searchQuery, setSearchQuery] = useState('')
  const [conferenceFilter, setConferenceFilter] = useState('All Conferences')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Comparison state
  const [compareA, setCompareA] = useState<University | null>(null)
  const [compareB, setCompareB] = useState<University | null>(null)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [compareSearchA, setCompareSearchA] = useState('')
  const [compareSearchB, setCompareSearchB] = useState('')

  // Sorted by visibility score
  const sortedUniversities = useMemo(() => {
    return [...universities].sort((a, b) => (b.visibility_score || 0) - (a.visibility_score || 0))
  }, [universities])

  // Filtered universities
  const filteredUniversities = useMemo(() => {
    return sortedUniversities.filter(uni => {
      const matchesSearch = searchQuery === '' || 
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (uni.short_name && uni.short_name.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesConference = conferenceFilter === 'All Conferences' || 
        uni.athletic_conference === conferenceFilter
      
      const matchesType = typeFilter === 'all' || 
        uni.institution_type === typeFilter

      return matchesSearch && matchesConference && matchesType
    })
  }, [sortedUniversities, searchQuery, conferenceFilter, typeFilter])

  // Get rank based on visibility score
  const getRank = (uni: University) => {
    return sortedUniversities.findIndex(u => u.id === uni.id) + 1
  }

  // Filter universities for comparison dropdowns
  const filterCompareResults = (query: string) => {
    if (!query) return []
    return universities.filter(uni => 
      uni.name.toLowerCase().includes(query.toLowerCase()) ||
      (uni.short_name && uni.short_name.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5)
  }

  // Handle rivalry card click
  const handleRivalryClick = (aSlug: string, bSlug: string) => {
    const uniA = universities.find(u => u.slug === aSlug)
    const uniB = universities.find(u => u.slug === bSlug)
    if (uniA && uniB) {
      setCompareA(uniA)
      setCompareB(uniB)
      setShowCompareModal(true)
    }
  }

  // Get logo URL with Brandfetch fallback
  const getLogoUrl = (uni: University) => {
    if (uni.logo_url) return uni.logo_url
    if (uni.domain) return `https://cdn.brandfetch.io/${uni.domain}?c=1id1Fyz-h7an5-5KR_y`
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 overflow-hidden">
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
            <span className="text-white/60 text-sm">University Rankings</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
            The AI Admissions Office
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
            See how ChatGPT, Claude, and Perplexity rank America's universities. 
            What AI tells millions of students matters.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search universities..."
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Classic Rivalries Section */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Swords className="w-5 h-5 text-white/50" />
            <h2 className="text-lg font-semibold text-white">Classic Rivalries</h2>
            <span className="text-white/40 text-sm">Click to compare</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CLASSIC_RIVALRIES.map((rivalry, idx) => {
              const uniA = universities.find(u => u.slug === rivalry.a)
              const uniB = universities.find(u => u.slug === rivalry.b)
              if (!uniA || !uniB) return null

              return (
                <button
                  key={idx}
                  onClick={() => handleRivalryClick(rivalry.a, rivalry.b)}
                  className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 text-left transition-all"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                      {getLogoUrl(uniA) ? (
                        <img src={getLogoUrl(uniA)!} alt={uniA.short_name || uniA.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-white/60">{(uniA.short_name || uniA.name).slice(0, 2)}</span>
                      )}
                    </div>
                    <span className="text-white/40 text-xs">vs</span>
                    <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                      {getLogoUrl(uniB) ? (
                        <img src={getLogoUrl(uniB)!} alt={uniB.short_name || uniB.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-white/60">{(uniB.short_name || uniB.name).slice(0, 2)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-white/60 text-xs text-center group-hover:text-white/80 transition-colors">
                    {rivalry.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Build Your Own Comparison */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Build Your Own Matchup</h3>
                <p className="text-white/50 text-sm">Compare any two universities head-to-head</p>
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
              {/* University A Selector */}
              <div className="relative">
                <input
                  type="text"
                  value={compareA ? (compareA.short_name || compareA.name) : compareSearchA}
                  onChange={(e) => {
                    setCompareSearchA(e.target.value)
                    setCompareA(null)
                  }}
                  placeholder="Select first university..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                />
                {compareSearchA && !compareA && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden z-10">
                    {filterCompareResults(compareSearchA).map(uni => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          setCompareA(uni)
                          setCompareSearchA('')
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                          {getLogoUrl(uni) ? (
                            <img src={getLogoUrl(uni)!} alt={uni.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-white/60">{(uni.short_name || uni.name).slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-white text-sm">{uni.name}</div>
                          <div className="text-white/40 text-xs">{uni.city}, {uni.state}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* VS */}
              <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10">
                <span className="text-white/60 font-bold text-sm">VS</span>
              </div>

              {/* University B Selector */}
              <div className="relative">
                <input
                  type="text"
                  value={compareB ? (compareB.short_name || compareB.name) : compareSearchB}
                  onChange={(e) => {
                    setCompareSearchB(e.target.value)
                    setCompareB(null)
                  }}
                  placeholder="Select second university..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                />
                {compareSearchB && !compareB && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden z-10">
                    {filterCompareResults(compareSearchB).map(uni => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          setCompareB(uni)
                          setCompareSearchB('')
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                          {getLogoUrl(uni) ? (
                            <img src={getLogoUrl(uni)!} alt={uni.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-white/60">{(uni.short_name || uni.name).slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-white text-sm">{uni.name}</div>
                          <div className="text-white/40 text-xs">{uni.city}, {uni.state}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Compare Button */}
            {compareA && compareB && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
                >
                  Compare Universities
                  <ArrowRight className="w-4 h-4" />
                </button>
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
              {filteredUniversities.length} universities
            </span>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="pb-20 px-6">
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
                {filteredUniversities.map((uni, index) => {
                  const rank = getRank(uni)
                  const trend = Math.random() > 0.5 ? 'up' : 'down' // Mock trend
                  
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
                              <img src={getLogoUrl(uni)!} alt={uni.name} className="w-8 h-8 object-contain" />
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
            >
              Talk to Our Team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Modal */}
      {showCompareModal && compareA && compareB && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCompareModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full mb-4">
                <Swords className="w-4 h-4 text-white/50" />
                <span className="text-white/60 text-sm">AI Visibility Matchup</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Head-to-Head Comparison</h3>
            </div>

            {/* Comparison Card */}
            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start">
              {/* University A */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center mx-auto mb-4">
                  {getLogoUrl(compareA) ? (
                    <img src={getLogoUrl(compareA)!} alt={compareA.name} className="w-16 h-16 object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-white/40">{(compareA.short_name || compareA.name).slice(0, 2)}</span>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{compareA.short_name || compareA.name}</h4>
                <p className="text-white/40 text-sm mb-4">{compareA.city}, {compareA.state}</p>
                
                <div className="text-4xl font-bold text-white mb-2">{compareA.visibility_score?.toFixed(1)}%</div>
                <p className="text-white/50 text-sm">AI Visibility Score</p>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">US News Rank</span>
                    <span className="text-white">#{compareA.us_news_rank}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Acceptance Rate</span>
                    <span className="text-white">{compareA.acceptance_rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Conference</span>
                    <span className="text-white">{compareA.athletic_conference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">AI Mentions</span>
                    <span className="text-white">{compareA.total_mentions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="hidden md:flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-px h-20 bg-white/10" />
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/60 font-bold text-sm">VS</span>
                </div>
                <div className="w-px h-20 bg-white/10" />
              </div>

              {/* University B */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center mx-auto mb-4">
                  {getLogoUrl(compareB) ? (
                    <img src={getLogoUrl(compareB)!} alt={compareB.name} className="w-16 h-16 object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-white/40">{(compareB.short_name || compareB.name).slice(0, 2)}</span>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{compareB.short_name || compareB.name}</h4>
                <p className="text-white/40 text-sm mb-4">{compareB.city}, {compareB.state}</p>
                
                <div className="text-4xl font-bold text-white mb-2">{compareB.visibility_score?.toFixed(1)}%</div>
                <p className="text-white/50 text-sm">AI Visibility Score</p>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">US News Rank</span>
                    <span className="text-white">#{compareB.us_news_rank}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Acceptance Rate</span>
                    <span className="text-white">{compareB.acceptance_rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Conference</span>
                    <span className="text-white">{compareB.athletic_conference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">AI Mentions</span>
                    <span className="text-white">{compareB.total_mentions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Banner */}
            {compareA.visibility_score !== compareB.visibility_score && (
              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-emerald-400 font-medium">
                  {(compareA.visibility_score || 0) > (compareB.visibility_score || 0) 
                    ? `${compareA.short_name || compareA.name} leads by ${((compareA.visibility_score || 0) - (compareB.visibility_score || 0)).toFixed(1)} points`
                    : `${compareB.short_name || compareB.name} leads by ${((compareB.visibility_score || 0) - (compareA.visibility_score || 0)).toFixed(1)} points`
                  }
                </p>
              </div>
            )}

            {/* Share Actions */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

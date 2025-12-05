// apps/web/app/(marketing)/page.tsx
// Harbor Landing Page - Linear Style
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ArrowRight, Plus, ChevronDown, Menu, X, Eye, TrendingUp, Target, Zap, BarChart3, Globe, Shield, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  rank_global: number
}

// ============================================================================
// FROSTED GLASS NAV
// ============================================================================

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dropdownItems = {
    product: [
      { label: 'Brand Visibility', desc: 'Track AI mentions', href: '/product/visibility' },
      { label: 'Competitors', desc: 'Benchmark against rivals', href: '/product/competitors' },
      { label: 'Sources', desc: 'Citation analytics', href: '/product/sources' },
      { label: 'Website Analysis', desc: 'AI readability audit', href: '/product/website' },
    ],
    resources: [
      { label: 'Documentation', desc: 'How Harbor works', href: '/docs' },
      { label: 'Blog', desc: 'GEO insights & updates', href: '/blog' },
      { label: 'API', desc: 'Build integrations', href: '/api' },
    ],
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-white font-semibold text-lg">Harbor</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Product Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('product')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'product' && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/10 p-2 min-w-[280px] shadow-2xl">
                    {dropdownItems.product.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-medium text-sm">{item.label}</span>
                        <span className="text-white/50 text-xs mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/10 p-2 min-w-[240px] shadow-2xl">
                    {dropdownItems.resources.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-medium text-sm">{item.label}</span>
                        <span className="text-white/50 text-xs mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/pricing" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/brands" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Directory
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/10">
          <div className="px-6 py-4 space-y-3">
            <Link href="/product" className="block py-2 text-white/70 hover:text-white">Product</Link>
            <Link href="/pricing" className="block py-2 text-white/70 hover:text-white">Pricing</Link>
            <Link href="/brands" className="block py-2 text-white/70 hover:text-white">Directory</Link>
            <Link href="/docs" className="block py-2 text-white/70 hover:text-white">Docs</Link>
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link href="/login" className="block py-2 text-white/70 hover:text-white">Log in</Link>
              <Link href="/signup" className="block py-3 bg-white text-black text-center font-semibold rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Brand[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    setShowDropdown(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/brands/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch (err) {
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 150)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left - Copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 text-xs font-medium">Now tracking 38,000+ brands</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                AI is the new search.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                See where you stand.
              </span>
            </h1>

            <p className="text-lg text-white/50 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Track what ChatGPT, Claude, Gemini, and Perplexity say about your brand. 
              Optimize for the AI search era.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="relative bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 focus-within:border-cyan-500/50 transition-all">
                <div className="flex items-center">
                  <Search className="w-5 h-5 ml-4 text-white/30" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Search for any brand..."
                    className="flex-1 bg-transparent text-white px-4 py-4 outline-none placeholder:text-white/30"
                  />
                  <button className="m-1.5 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                    Search
                  </button>
                </div>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                  {loading && (
                    <div className="px-4 py-3 text-white/40 text-sm text-center">Searching...</div>
                  )}
                  {!loading && searchResults.length > 0 && searchResults.slice(0, 5).map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                        {brand.logo_url ? (
                          <Image src={brand.logo_url} alt="" width={32} height={32} className="object-cover" />
                        ) : (
                          <span className="text-white/40 text-xs font-bold">{brand.brand_name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{brand.brand_name}</div>
                        <div className="text-white/40 text-xs truncate">{brand.domain}</div>
                      </div>
                      <span className="text-white/50 text-sm font-mono">{brand.visibility_score}%</span>
                    </Link>
                  ))}
                  {!loading && query.length >= 2 && searchResults.length === 0 && (
                    <div className="px-4 py-4 text-center">
                      <p className="text-white/40 text-sm mb-3">No results for "{query}"</p>
                      <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300">
                        + Add this brand
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Social proof mini */}
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-[#0a0a0a]`} />
                ))}
              </div>
              <span className="text-white/40 text-sm">Trusted by 500+ marketing teams</span>
            </div>
          </div>

          {/* Right - Dashboard Preview */}
          <div className="relative lg:pl-8">
            <div 
              className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl"
              style={{
                transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                transformOrigin: 'center center'
              }}
            >
              {/* Fake browser chrome */}
              <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1 text-white/30 text-xs">
                    app.useharbor.io/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard mockup */}
              <div className="bg-[#0f0f0f] p-6 min-h-[400px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500" />
                      <div>
                        <div className="text-white font-semibold">HubSpot</div>
                        <div className="text-white/40 text-sm">hubspot.com</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">78.4%</div>
                    <div className="text-emerald-400 text-sm flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3" />
                      +5.2% this month
                    </div>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="bg-white/[0.02] rounded-lg p-4 mb-4 border border-white/5">
                  <div className="flex items-end justify-between h-24 gap-1">
                    {[40, 45, 42, 55, 60, 58, 65, 70, 68, 75, 78, 78].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-cyan-500/50 to-cyan-400/80 rounded-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Mentions', value: '1,234', change: '+12%' },
                    { label: 'Avg Position', value: '#2.4', change: '+0.3' },
                    { label: 'Sentiment', value: '94%', change: '+2%' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                      <div className="text-white/40 text-xs mb-1">{stat.label}</div>
                      <div className="text-white font-semibold">{stat.value}</div>
                      <div className="text-emerald-400 text-xs">{stat.change}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -bottom-4 -left-4 bg-[#1a1a1a]/90 backdrop-blur-xl rounded-lg border border-white/10 p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Visibility Up</div>
                  <div className="text-white/40 text-xs">+23% vs last month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// LOGO BAR
// ============================================================================

function LogoBar() {
  const brands = [
    'HubSpot', 'Ramp', 'Notion', 'Figma', 'Linear', 'Vercel', 
    'Stripe', 'Shopify', 'Slack', 'Zoom', 'Asana', 'Monday'
  ]

  return (
    <section className="relative py-16 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-white/30 text-sm font-medium mb-8 uppercase tracking-wider">
          Tracking visibility for leading brands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((brand) => (
            <span key={brand} className="text-white/20 hover:text-white/40 text-lg font-semibold transition-colors cursor-default">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FEATURE CARDS (Linear style 3-up)
// ============================================================================

function FeatureCards() {
  const features = [
    {
      icon: Eye,
      title: 'Real-time Visibility',
      description: 'Track how often AI models mention your brand across ChatGPT, Claude, Gemini, and Perplexity.',
      visual: (
        <div className="flex items-end gap-2 h-32">
          {[30, 45, 60, 75, 85].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500/30 to-cyan-400/60" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
    {
      icon: Target,
      title: 'Competitor Intelligence',
      description: 'See how you stack up against competitors. Identify gaps and opportunities in AI recommendations.',
      visual: (
        <div className="space-y-2">
          {['Your Brand', 'Competitor A', 'Competitor B'].map((name, i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-white/40 text-xs w-24 truncate">{name}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${i === 0 ? 'bg-cyan-400' : 'bg-white/20'}`}
                  style={{ width: `${85 - i * 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: Zap,
      title: 'Actionable Insights',
      description: 'Get specific recommendations to improve your AI visibility with schema markup and content optimization.',
      visual: (
        <div className="space-y-2">
          {[
            { task: 'Add Organization schema', status: 'done' },
            { task: 'Optimize product pages', status: 'pending' },
            { task: 'Update meta descriptions', status: 'pending' },
          ].map((item) => (
            <div key={item.task} className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                item.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'
              }`}>
                {item.status === 'done' ? '✓' : '○'}
              </div>
              <span className={item.status === 'done' ? 'text-white/60 line-through' : 'text-white/60'}>
                {item.task}
              </span>
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for the AI search era
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Everything you need to monitor and optimize your brand's presence in AI-powered search.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="group relative bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
            >
              {/* Glassmorphism glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-cyan-400" />
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                
                {/* Description */}
                <p className="text-white/50 text-sm mb-6 leading-relaxed">{feature.description}</p>

                {/* Visual */}
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  {feature.visual}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// PRODUCT SHOWCASE
// ============================================================================

function ProductShowcase() {
  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="text-cyan-400 text-sm font-medium mb-4 uppercase tracking-wider">
              Deep Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              Understand exactly how AI sees your brand
            </h2>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              Go beyond surface-level metrics. See the exact prompts where you appear, 
              track sentiment over time, and understand which sources AI models cite about you.
            </p>

            <div className="space-y-4">
              {[
                { icon: BarChart3, label: 'Visibility trends across all major AI models' },
                { icon: Globe, label: 'Source citation analysis and authority signals' },
                { icon: Shield, label: 'Sentiment tracking and reputation monitoring' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-white/70 text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Start tracking
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              {/* Tab header */}
              <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                {['Visibility', 'Sentiment', 'Sources'].map((tab, i) => (
                  <button 
                    key={tab}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      i === 0 
                        ? 'text-white border-cyan-400' 
                        : 'text-white/40 border-transparent hover:text-white/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Chart area */}
              <div className="h-64 relative">
                {/* Y axis */}
                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-right">
                  {['100%', '75%', '50%', '25%', '0%'].map((label) => (
                    <span key={label} className="text-white/30 text-xs">{label}</span>
                  ))}
                </div>
                
                {/* Chart */}
                <div className="ml-14 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-white/5" />
                    ))}
                  </div>
                  
                  {/* Lines */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,180 Q50,160 100,140 T200,100 T300,80 T400,60"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* X axis */}
                <div className="ml-14 flex justify-between mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                    <span key={month} className="text-white/30 text-xs">{month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// CTA SECTION
// ============================================================================

function CTASection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-[100px] pointer-events-none" />
        
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to see where you stand?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of brands tracking their AI visibility. 
            Free to start, powerful insights from day one.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors text-lg"
            >
              Get started free
            </Link>
            <Link 
              href="/demo"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 transition-colors text-lg"
            >
              Request demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  const links = {
    Product: ['Features', 'Pricing', 'Directory', 'API'],
    Resources: ['Documentation', 'Blog', 'Changelog', 'Status'],
    Company: ['About', 'Careers', 'Contact', 'Legal'],
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-white font-semibold text-lg">Harbor</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              AI visibility intelligence for modern brands.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/10">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link href="#" className="text-white/30 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="#" className="text-white/30 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LandingPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      <HeroSection />
      <LogoBar />
      <FeatureCards />
      <ProductShowcase />
      <CTASection />
      <Footer />
    </main>
  )
}

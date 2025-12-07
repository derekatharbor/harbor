// app/product/website/page.tsx
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'
import Link from 'next/link'
import { Globe, CheckCircle2, XCircle, AlertTriangle, FileCode, Code, ArrowRight, Shield, Zap, Search, Bot } from 'lucide-react'

export const metadata = {
  title: 'Website Analysis | Harbor',
  description: 'AI readability audit for your website. Check schema markup, content structure, and technical factors that influence how AI understands your site.',
}

// Mock website audit visualization
function WebsiteAuditMock() {
  const schemaTypes = [
    { type: 'Organization', status: 'complete', icon: '✓' },
    { type: 'Product', status: 'partial', icon: '!' },
    { type: 'FAQPage', status: 'missing', icon: '✗' },
    { type: 'BreadcrumbList', status: 'complete', icon: '✓' },
    { type: 'Article', status: 'missing', icon: '✗' },
  ]

  const issues = [
    { severity: 'high', title: 'Missing FAQPage schema', pages: 12 },
    { severity: 'medium', title: 'Product schema incomplete', pages: 8 },
    { severity: 'low', title: 'Missing meta descriptions', pages: 3 },
  ]

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-20" />
      
      {/* Dashboard frame */}
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Window controls */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-white/5 rounded-lg text-xs text-white/40">harbor.app/dashboard/website</div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-white/60" />
              <span className="font-semibold text-white">Website Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40">acmecorp.com</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">42 pages scanned</span>
            </div>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-2">AI Readability Score</div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="72 100" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">72</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white font-medium">Good</div>
                  <div className="text-xs text-white/40">+8 from last scan</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-2">Schema Coverage</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">68%</span>
                <span className="text-xs text-amber-400">3 types missing</span>
              </div>
            </div>
            
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-2">Issues Found</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">23</span>
                <div className="flex gap-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">3 high</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400">8 med</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Schema types */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-4">Schema Coverage</div>
              <div className="space-y-2">
                {schemaTypes.map((schema, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                        schema.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                        schema.status === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {schema.status === 'complete' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         schema.status === 'partial' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         <XCircle className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm text-white">{schema.type}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      schema.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' :
                      schema.status === 'partial' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {schema.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-4">Top Issues</div>
              <div className="space-y-3">
                {issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      issue.severity === 'high' ? 'bg-red-500' :
                      issue.severity === 'medium' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm text-white">{issue.title}</div>
                      <div className="text-xs text-white/40">{issue.pages} pages affected</div>
                    </div>
                    <button className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/60 transition-colors">
                      Fix
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-white/70" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default function WebsiteAnalysisPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-6">
            <Globe className="w-3.5 h-3.5" />
            Website Analysis
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Make your site<br />AI-readable
          </h1>
          
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            Audit your website's technical structure for AI comprehension. 
            Check schema markup, content organization, and the factors that help AI understand your site.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Audit your site
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/pricing" 
              className="inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white font-medium transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard visualization */}
      <section className="pb-24 px-6">
        <WebsiteAuditMock />
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Technical optimization for AI visibility
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Your website's structure directly impacts how AI models understand and cite your content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Code}
              title="Schema Validation"
              description="Check if your JSON-LD markup is complete and properly structured for AI consumption."
            />
            <FeatureCard
              icon={Bot}
              title="AI Readability"
              description="Score how well AI can parse and understand your content structure and hierarchy."
            />
            <FeatureCard
              icon={Search}
              title="Content Audit"
              description="Identify pages with missing meta descriptions, thin content, or structural issues."
            />
            <FeatureCard
              icon={Zap}
              title="Fix Suggestions"
              description="Get actionable recommendations with code snippets you can implement immediately."
            />
          </div>
        </div>
      </section>

      {/* Schema types we check */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Schema types we validate
            </h2>
            <p className="text-white/50">
              We check for the structured data that matters most for AI visibility.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Organization',
              'Product',
              'FAQPage',
              'Article',
              'BreadcrumbList',
              'Review',
              'LocalBusiness',
              'Person'
            ].map((schema) => (
              <div key={schema} className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-sm text-white">{schema}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to optimize for AI?
          </h2>
          <p className="text-white/50 mb-8">
            Run your first website audit and get actionable recommendations.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
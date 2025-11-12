'use client'

import { MetricCard } from '@/components/ui/MetricCard'
import { ActionCard } from '@/components/ui/ActionCard'
import { TimeRangeFilter } from '@/components/ui/TimeRangeFilter'
import { Globe, CheckCircle, AlertTriangle, XCircle, FileCode, Link as LinkIcon, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

// Mock data
const schemaPages = [
  { url: '/products/business-card', schemas: ['Product', 'BreadcrumbList'], status: 'pass', issues: 0 },
  { url: '/about', schemas: ['Organization'], status: 'pass', issues: 0 },
  { url: '/pricing', schemas: [], status: 'warning', issues: 1 },
  { url: '/faq', schemas: ['FAQPage'], status: 'pass', issues: 0 },
  { url: '/blog/small-business-tips', schemas: ['Article', 'BreadcrumbList'], status: 'pass', issues: 0 },
  { url: '/contact', schemas: [], status: 'fail', issues: 2 },
]

const technicalIssues = [
  {
    code: 'missing_canonical',
    severity: 'high' as const,
    title: 'Missing Canonical Tags',
    description: 'Multiple pages lack canonical tags, causing potential duplicate content issues for AI crawlers',
    affectedPages: ['/pricing', '/products/compare', '/resources'],
    count: 3,
  },
  {
    code: 'missing_org_schema',
    severity: 'high' as const,
    title: 'Organization Schema Missing',
    description: 'Homepage lacks Organization JSON-LD, preventing AI from understanding company structure',
    affectedPages: ['/'],
    count: 1,
  },
  {
    code: 'missing_meta_description',
    severity: 'med' as const,
    title: 'Missing Meta Descriptions',
    description: 'Several pages missing meta descriptions, reducing AI comprehension of page purpose',
    affectedPages: ['/about/team', '/blog/archive', '/legal/terms'],
    count: 3,
  },
  {
    code: 'duplicate_h1',
    severity: 'low' as const,
    title: 'Duplicate H1 Tags',
    description: 'Some pages have multiple H1 tags, creating hierarchy confusion',
    affectedPages: ['/solutions', '/integrations'],
    count: 2,
  },
]

const readabilityMetrics = [
  { label: 'Content Structure', score: 92, color: '#00C6B7' },
  { label: 'Schema Coverage', score: 78, color: '#3C83FF' },
  { label: 'Meta Quality', score: 85, color: '#4EE4FF' },
  { label: 'Technical Health', score: 88, color: '#A9B4C5' },
]

const getSeverityColor = (severity: 'high' | 'med' | 'low') => {
  switch (severity) {
    case 'high': return { bg: 'rgba(255,107,74,0.1)', text: '#FF6B4A', border: '#FF6B4A' }
    case 'med': return { bg: 'rgba(255,193,7,0.1)', text: '#FFC107', border: '#FFC107' }
    case 'low': return { bg: 'rgba(169,180,197,0.1)', text: '#A9B4C5', border: '#A9B4C5' }
  }
}

const getSeverityIcon = (severity: 'high' | 'med' | 'low') => {
  switch (severity) {
    case 'high': return <XCircle size={16} />
    case 'med': return <AlertTriangle size={16} />
    case 'low': return <AlertTriangle size={16} />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pass': return <CheckCircle size={16} className="text-teal" />
    case 'warning': return <AlertTriangle size={16} className="text-cyan" />
    case 'fail': return <XCircle size={16} style={{ color: '#FF6B4A' }} />
    default: return null
  }
}

function IssueAccordion({ issue }: { issue: typeof technicalIssues[0] }) {
  const [isOpen, setIsOpen] = useState(false)
  const colors = getSeverityColor(issue.severity)

  return (
    <div 
      className="border border-harbor rounded-lg overflow-hidden hover:bg-[rgba(0,198,183,0.02)] transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-[rgba(0,198,183,0.05)] transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <div style={{ color: colors.text }}>
            {getSeverityIcon(issue.severity)}
          </div>
          <div className="text-left flex-1">
            <h4 className="text-white font-body text-sm font-medium">{issue.title}</h4>
            <p className="text-softgray text-xs opacity-60 mt-1">{issue.count} affected {issue.count === 1 ? 'page' : 'pages'}</p>
          </div>
          <span 
            className="px-2 py-1 text-xs rounded font-medium uppercase"
            style={{ 
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}40`
            }}
          >
            {issue.severity}
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-softgray ml-3" /> : <ChevronDown size={16} className="text-softgray ml-3" />}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 border-t border-harbor animate-in">
          <p className="text-softgray text-sm mt-3 mb-3 opacity-75">{issue.description}</p>
          <div className="space-y-1">
            <p className="text-xs text-softgray opacity-60 uppercase tracking-wide mb-2">Affected Pages:</p>
            {issue.affectedPages.map((page, index) => (
              <div key={index} className="text-sm text-cyan font-mono bg-navy-lighter px-2 py-1 rounded">
                {page}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WebsiteAnalyticsPage() {
  return (
    <div 
      className="min-h-screen bg-navy p-8 animate-in"
      style={{
        background: 'radial-gradient(ellipse at center, #0B1521 0%, rgba(0,0,0,0.4) 100%)'
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-softgray text-sm mb-2">
          <span className="opacity-60">Demo Brand</span>
          <span className="opacity-40">›</span>
          <span>Website Analytics</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          Website Analytics
        </h1>
        <p className="text-softgray opacity-75 mb-4">
          How AI crawlers read and understand your website content
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-softgray opacity-75 text-sm">
              Last scan: 2 hours ago
            </p>
            <div className="relative flex items-center gap-2 px-3 py-1 bg-teal bg-opacity-10 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-teal rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-teal rounded-full animate-sonar" />
              </div>
              <span className="text-teal text-xs font-body">Live</span>
            </div>
          </div>
          <TimeRangeFilter />
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="AI Readability Score"
          value="94%"
          delta={3}
          icon={<Globe size={18} />}
          tooltip="Overall score measuring how well AI models can understand and extract information from your site"
        />
        <MetricCard
          title="Schema Coverage"
          value="78%"
          delta={5}
          description="Pages with structured data"
          icon={<FileCode size={18} />}
          tooltip="Percentage of pages with valid JSON-LD schema markup"
        />
        <MetricCard
          title="Technical Issues"
          value="9"
          description="Requiring attention"
          icon={<AlertTriangle size={18} />}
          tooltip="Total number of technical issues affecting AI crawlability"
        />
      </div>

      {/* Readability Breakdown */}
      <div className="harbor-card mb-8 hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
        <h3 className="text-lg font-heading font-semibold text-white mb-2">
          Readability Breakdown
        </h3>
        <p className="text-softgray text-sm opacity-75 mb-6">
          Key factors contributing to your AI readability score
        </p>
        <div className="space-y-4">
          {readabilityMetrics.map((metric, index) => (
            <div key={index} className="group hover:translate-x-1 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-body text-sm">{metric.label}</span>
                <span className="text-white font-heading font-semibold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {metric.score}%
                </span>
              </div>
              <div className="h-2 bg-navy-lighter rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${metric.score}%`,
                    backgroundColor: metric.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schema Coverage Table */}
      <div className="harbor-card mb-8 hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
        <h3 className="text-lg font-heading font-semibold text-white mb-2">
          Schema Coverage Map
        </h3>
        <p className="text-softgray text-sm opacity-75 mb-6">
          Page-level schema implementation status
        </p>
        <div className="overflow-x-auto">
          <table className="harbor-table">
            <thead>
              <tr className="border-b border-harbor">
                <th className="text-left py-3">URL</th>
                <th className="text-left py-3">Schema Types</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Issues</th>
              </tr>
            </thead>
            <tbody>
              {schemaPages.map((page, index) => (
                <tr 
                  key={index}
                  className="border-b border-harbor last:border-0 hover:bg-[rgba(0,198,183,0.05)] transition-colors"
                >
                  <td className="py-4">
                    <span className="text-cyan font-mono text-sm">{page.url}</span>
                  </td>
                  <td className="py-4">
                    {page.schemas.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {page.schemas.map((schema, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-navy-lighter text-teal text-xs rounded"
                            style={{ borderRadius: '4px' }}
                          >
                            {schema}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-softgray opacity-60 text-sm">None</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(page.status)}
                      <span className="text-sm text-softgray capitalize">{page.status}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    {page.issues > 0 ? (
                      <span className="text-sm font-medium" style={{ color: '#FF6B4A' }}>
                        {page.issues}
                      </span>
                    ) : (
                      <span className="text-softgray opacity-60 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Issues */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">
          Technical Issues
        </h2>
        <p className="text-softgray opacity-75 mb-6">
          Issues affecting AI crawlability and content understanding
        </p>
        <div className="space-y-3">
          {technicalIssues.map((issue, index) => (
            <IssueAccordion key={index} issue={issue} />
          ))}
        </div>
      </div>

      {/* Optimize Actions */}
      <div>
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">
          Improve Site Clarity for AI
        </h2>
        <p className="text-softgray opacity-75 mb-6">
          Priority actions to enhance how AI crawlers understand your content
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Fix Schema Errors"
            description="Validate and correct JSON-LD implementation across all pages to ensure proper AI interpretation"
            icon={<FileCode size={20} style={{ marginTop: '8px' }} />}
            trend="+12% clarity"
            ctaText="Run Validator"
          />
          <ActionCard
            title="Canonicalize Duplicates"
            description="Add canonical tags to prevent duplicate content issues and consolidate page authority"
            icon={<LinkIcon size={20} style={{ marginTop: '8px' }} />}
            trend="+8% authority"
            ctaText="View Guide"
          />
          <ActionCard
            title="Optimize Meta Descriptions"
            description="Rewrite meta descriptions to be clear, concise, and free of marketing jargon for AI comprehension"
            icon={<FileText size={20} style={{ marginTop: '8px' }} />}
            trend="+15% context"
            ctaText="Generate Meta"
          />
        </div>
      </div>
    </div>
  )
}

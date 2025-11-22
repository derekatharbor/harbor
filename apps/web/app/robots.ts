// apps/web/app/robots.ts
// Crawler permissions with explicit AI model support
// Optimized to avoid override conflicts and maximize feed discoverability

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'

  return {
    rules: [
      // Block sensitive routes for ALL crawlers first
      {
        userAgent: '*',
        disallow: [
          '/api/scan/',
          '/api/upload/',
          '/dashboard/',
          '/onboarding/',
          '/auth/',
          '/brands/*/manage',
        ],
        allow: '/',
      },
      // Explicit allow rules for ChatGPT crawler (Feed Network)
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/brands/*/harbor.json',
          '/api/feed/',
          '/brands/',
        ],
      },
      // Explicit allow rules for Claude crawler (Feed Network)
      {
        userAgent: 'Claude-Web',
        allow: [
          '/brands/*/harbor.json',
          '/api/feed/',
          '/brands/',
        ],
      },
      // Explicit allow rules for Perplexity crawler (Feed Network)
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/brands/*/harbor.json',
          '/api/feed/',
          '/brands/',
        ],
      },
      // Explicit allow rules for Googlebot (clarity for Gemini)
      {
        userAgent: 'Googlebot',
        allow: [
          '/brands/*/harbor.json',
          '/api/feed/',
          '/brands/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
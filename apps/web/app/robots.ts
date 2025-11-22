// apps/web/app/robots.ts
// Crawler permissions with explicit AI model support

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'

  return {
    rules: [
      // Default: Allow all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/scan/*',      // Don't index scan endpoints
          '/api/upload/*',    // Don't index upload endpoints
          '/dashboard/*',     // Don't index private dashboards
          '/onboarding/*',    // Don't index onboarding
          '/auth/*',          // Don't index auth pages
        ],
      },
      // ChatGPT crawler
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/brands/*/harbor.json',  // Explicitly allow feed access
          '/api/feed/*',            // Explicitly allow feed API
          '/brands/*',              // Allow brand profiles
        ],
      },
      // Claude crawler
      {
        userAgent: 'Claude-Web',
        allow: [
          '/brands/*/harbor.json',
          '/api/feed/*',
          '/brands/*',
        ],
      },
      // Perplexity crawler
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/brands/*/harbor.json',
          '/api/feed/*',
          '/brands/*',
        ],
      },
      // Google Gemini (uses Googlebot)
      {
        userAgent: 'Googlebot',
        allow: [
          '/brands/*/harbor.json',
          '/api/feed/*',
          '/brands/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

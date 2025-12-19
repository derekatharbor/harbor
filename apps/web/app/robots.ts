// apps/web/app/robots.ts
// Crawler permissions with explicit AI model support
// Optimized for maximum AI crawler discoverability

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'

  return {
    rules: [
      // Default rules for all crawlers
      {
        userAgent: '*',
        disallow: [
          '/api/scan/',
          '/api/upload/',
          '/api/cron/',
          '/api/stripe/',
          '/dashboard/',
          '/onboarding/',
          '/auth/',
          '/brands/*/manage',
        ],
        allow: '/',
      },
      
      // === OPENAI CRAWLERS ===
      // OAI-SearchBot - Indexes for ChatGPT Search (CRITICAL for citations)
      {
        userAgent: 'OAI-SearchBot',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      // ChatGPT-User - Real-time fetching during user queries
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      // GPTBot - General OpenAI crawler for training
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      
      // === ANTHROPIC CRAWLERS ===
      {
        userAgent: 'ClaudeBot',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      {
        userAgent: 'anthropic-ai',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      
      // === PERPLEXITY ===
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      
      // === GOOGLE (for Gemini/AI Overviews) ===
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      {
        userAgent: 'Google-Extended',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      
      // === BING (ChatGPT Search uses Bing's index) ===
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
          '/alternatives/',
          '/compare/',
        ],
      },
      
      // === OTHER AI CRAWLERS ===
      {
        userAgent: 'Bytespider',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
        ],
      },
      {
        userAgent: 'CCBot',
        allow: [
          '/',
          '/brands/',
          '/brands/*/harbor.json',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
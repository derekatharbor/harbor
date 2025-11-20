// apps/web/app/api/share-card/[slug]/route.tsx
// Generates dynamic LinkedIn share card images with brand data

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response('Server configuration error', { status: 500 })
    }

    // Fetch brand data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: brand, error } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (error || !brand) {
      return new Response('Brand not found', { status: 404 })
    }

    // Calculate percentile message
    const getPercentileMessage = (rank: number) => {
      if (rank <= 10) return 'Top 1% of brands'
      if (rank <= 50) return 'Top 5% of brands'
      if (rank <= 100) return 'Top 10% of brands'
      return 'Top 25% of brands'
    }

    // Generate image using @vercel/og (ImageResponse)
    // Size: 1200x627px (LinkedIn standard)
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Brand Logo */}
          {brand.logo_url && (
            <img
              src={brand.logo_url}
              alt={brand.brand_name}
              width={100}
              height={100}
              style={{
                borderRadius: '12px',
                marginBottom: '32px'
              }}
            />
          )}

          {/* Brand Name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 400,
              color: '#111827',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            {brand.brand_name}
          </div>

          {/* Percentile */}
          <div
            style={{
              fontSize: 24,
              color: '#6B7280',
              marginBottom: '48px',
              fontFamily: 'monospace'
            }}
          >
            {getPercentileMessage(brand.rank_global)}
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '64px',
              marginBottom: '48px'
            }}
          >
            {/* Rank */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: '#9CA3AF',
                  fontFamily: 'monospace',
                  marginBottom: '8px'
                }}
              >
                RANK
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 500,
                  color: '#111827',
                  fontFamily: 'monospace'
                }}
              >
                #{brand.rank_global}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '80px',
                backgroundColor: '#E5E7EB'
              }}
            />

            {/* Score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: '#9CA3AF',
                  fontFamily: 'monospace',
                  marginBottom: '8px'
                }}
              >
                SCORE
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 500,
                  color: '#111827',
                  fontFamily: 'monospace'
                }}
              >
                {brand.visibility_score.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 16,
              color: '#9CA3AF',
              fontFamily: 'monospace'
            }}
          >
            <span>Powered by</span>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Harbor</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 627,
      }
    )
  } catch (error) {
    console.error('Share card generation error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}

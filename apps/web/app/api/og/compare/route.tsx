import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slugA = searchParams.get('a') || 'stanford'
    const slugB = searchParams.get('b') || 'uc-berkeley'

    // Use fetch instead of Supabase client for edge compatibility
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/university_profiles?slug=in.(${slugA},${slugB})&select=name,short_name,slug,domain,city,state,visibility_score`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch universities')
    }

    const universities = await response.json()

    const uniA = universities?.find((u: any) => u.slug === slugA)
    const uniB = universities?.find((u: any) => u.slug === slugB)

    if (!uniA || !uniB) {
      throw new Error('Universities not found')
    }

    const scoreA = Number(uniA.visibility_score) || 0
    const scoreB = Number(uniB.visibility_score) || 0
    const leader = scoreA > scoreB ? 'A' : 'B'
    const leadAmount = Math.abs(scoreA - scoreB).toFixed(1)

    const nameA = uniA.short_name || uniA.name
    const nameB = uniB.short_name || uniB.name
    const locationA = [uniA.city, uniA.state].filter(Boolean).join(', ')
    const locationB = [uniB.city, uniB.state].filter(Boolean).join(', ')

    return new ImageResponse(
      (
        <div
          style={{
            background: '#0a0a0a',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 60,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '8px 16px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 18,
              }}
            >
              ⚔️ AI Visibility Matchup
            </div>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', color: 'white', fontSize: 48, fontWeight: 700, marginBottom: 40 }}>
            {nameA} vs {nameB}
          </div>

          {/* Comparison Card */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: 48,
              flex: 1,
            }}
          >
            {/* University A */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', color: 'white', fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
                {nameA}
              </div>
              <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 24 }}>
                {locationA || ' '}
              </div>
              <div
                style={{
                  display: 'flex',
                  color: leader === 'A' ? '#10b981' : 'white',
                  fontSize: 72,
                  fontWeight: 700,
                }}
              >
                {scoreA.toFixed(1)}%
              </div>
              <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 18, marginTop: 8 }}>
                AI Visibility Score
              </div>
              {leader === 'A' && (
                <div
                  style={{
                    display: 'flex',
                    marginTop: 20,
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 20,
                    padding: '8px 20px',
                    color: '#10b981',
                    fontSize: 18,
                  }}
                >
                  🏆 Leader
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 40px',
              }}
            >
              <div style={{ display: 'flex', width: 1, height: 80, background: 'rgba(255,255,255,0.1)' }} />
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 999,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 20,
                  fontWeight: 600,
                  margin: '16px 0',
                }}
              >
                vs
              </div>
              <div style={{ display: 'flex', width: 1, height: 80, background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* University B */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', color: 'white', fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
                {nameB}
              </div>
              <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 24 }}>
                {locationB || ' '}
              </div>
              <div
                style={{
                  display: 'flex',
                  color: leader === 'B' ? '#10b981' : 'white',
                  fontSize: 72,
                  fontWeight: 700,
                }}
              >
                {scoreB.toFixed(1)}%
              </div>
              <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 18, marginTop: 8 }}>
                AI Visibility Score
              </div>
              {leader === 'B' && (
                <div
                  style={{
                    display: 'flex',
                    marginTop: 20,
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 20,
                    padding: '8px 20px',
                    color: '#10b981',
                    fontSize: 18,
                  }}
                >
                  🏆 Leader
                </div>
              )}
            </div>
          </div>

          {/* Lead Banner */}
          <div
            style={{
              display: 'flex',
              marginTop: 24,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 16,
              padding: '16px 24px',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', color: '#10b981', fontSize: 22 }}>
              {leader === 'A' ? nameA : nameB} leads by {leadAmount} points in AI visibility
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: 20,
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>
              useharbor.io/universities
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (error) {
    // Return a simple fallback image on error
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0a0a0a',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', color: 'white', fontSize: 48, fontWeight: 700, marginBottom: 16 }}>
            University Comparison
          </div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 24 }}>
            useharbor.io/universities
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}
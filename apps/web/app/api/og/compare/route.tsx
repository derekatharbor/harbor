import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slugA = searchParams.get('a') || 'stanford'
  const slugB = searchParams.get('b') || 'uc-berkeley'

  // Fetch university data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: universities } = await supabase
    .from('university_profiles')
    .select('name, short_name, slug, domain, city, state, visibility_score')
    .in('slug', [slugA, slugB])

  const uniA = universities?.find(u => u.slug === slugA)
  const uniB = universities?.find(u => u.slug === slugB)

  if (!uniA || !uniB) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0a0a0a',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
          }}
        >
          <div style={{ color: 'white', fontSize: 48 }}>University Comparison</div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  const scoreA = Number(uniA.visibility_score) || 0
  const scoreB = Number(uniB.visibility_score) || 0
  const leader = scoreA > scoreB ? 'A' : 'B'
  const leadAmount = Math.abs(scoreA - scoreB).toFixed(1)

  const getLogoUrl = (domain: string | null) => {
    if (!domain) return null
    return `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui',
          padding: 60,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div
            style={{
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
        <div style={{ color: 'white', fontSize: 48, fontWeight: 700, marginBottom: 40 }}>
          {uniA.short_name || uniA.name} vs {uniB.short_name || uniB.name}
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
            {uniA.domain && (
              <img
                src={getLogoUrl(uniA.domain)!}
                width={100}
                height={100}
                style={{ borderRadius: 16, marginBottom: 16, objectFit: 'contain', background: 'white' }}
              />
            )}
            <div style={{ color: 'white', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              {uniA.short_name || uniA.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 16 }}>
              {uniA.city}{uniA.state ? `, ${uniA.state}` : ''}
            </div>
            <div
              style={{
                color: leader === 'A' ? '#10b981' : 'white',
                fontSize: 64,
                fontWeight: 700,
              }}
            >
              {scoreA.toFixed(1)}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>AI Visibility Score</div>
            {leader === 'A' && (
              <div
                style={{
                  marginTop: 16,
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 20,
                  padding: '8px 16px',
                  color: '#10b981',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
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
            <div
              style={{
                width: 1,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 999,
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 18,
                fontWeight: 600,
                margin: '16px 0',
              }}
            >
              vs
            </div>
            <div
              style={{
                width: 1,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
              }}
            />
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
            {uniB.domain && (
              <img
                src={getLogoUrl(uniB.domain)!}
                width={100}
                height={100}
                style={{ borderRadius: 16, marginBottom: 16, objectFit: 'contain', background: 'white' }}
              />
            )}
            <div style={{ color: 'white', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              {uniB.short_name || uniB.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 16 }}>
              {uniB.city}{uniB.state ? `, ${uniB.state}` : ''}
            </div>
            <div
              style={{
                color: leader === 'B' ? '#10b981' : 'white',
                fontSize: 64,
                fontWeight: 700,
              }}
            >
              {scoreB.toFixed(1)}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>AI Visibility Score</div>
            {leader === 'B' && (
              <div
                style={{
                  marginTop: 16,
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 20,
                  padding: '8px 16px',
                  color: '#10b981',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
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
            marginTop: 24,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 16,
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: '#10b981', fontSize: 22 }}>
            {leader === 'A' ? uniA.short_name || uniA.name : uniB.short_name || uniB.name} leads by{' '}
            {leadAmount} points in AI visibility
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>useharbor.io/universities</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

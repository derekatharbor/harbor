import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slugA = searchParams.get('a') || 'stanford'
    const slugB = searchParams.get('b') || 'uc-berkeley'

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
    const leader = scoreA >= scoreB ? 'A' : 'B'
    const leadAmount = Math.abs(scoreA - scoreB).toFixed(1)

    const nameA = uniA.short_name || uniA.name
    const nameB = uniB.short_name || uniB.name
    
    const logoA = uniA.domain ? `https://cdn.brandfetch.io/${uniA.domain}?c=1id1Fyz-h7an5-5KR_y` : null
    const logoB = uniB.domain ? `https://cdn.brandfetch.io/${uniB.domain}?c=1id1Fyz-h7an5-5KR_y` : null

    return new ImageResponse(
      (
        <div
          style={{
            background: '#0a0a0a',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '50px 60px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', marginBottom: 30 }}>
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '10px 20px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 20,
              }}
            >
              ⚔️ AI Visibility Matchup
            </div>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', color: 'white', fontSize: 52, fontWeight: 700, marginBottom: 40 }}>
            {nameA} vs {nameB}
          </div>

          {/* Main comparison area */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 60,
            }}
          >
            {/* University A */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 400,
              }}
            >
              {logoA ? (
                <img
                  src={logoA}
                  width={120}
                  height={120}
                  style={{ borderRadius: 20, marginBottom: 20, objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    width: 120,
                    height: 120,
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    fontSize: 48,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {nameA.slice(0, 2)}
                </div>
              )}
              <div style={{ display: 'flex', color: 'white', fontSize: 28, fontWeight: 600 }}>
                {nameA}
              </div>
              <div
                style={{
                  display: 'flex',
                  color: leader === 'A' ? '#10b981' : 'white',
                  fontSize: 80,
                  fontWeight: 700,
                  marginTop: 10,
                }}
              >
                {scoreA.toFixed(1)}%
              </div>
              {leader === 'A' && (
                <div
                  style={{
                    display: 'flex',
                    marginTop: 15,
                    background: 'rgba(16,185,129,0.2)',
                    borderRadius: 30,
                    padding: '10px 24px',
                    color: '#10b981',
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  🏆 Leader
                </div>
              )}
            </div>

            {/* VS */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 999,
                width: 70,
                height: 70,
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              vs
            </div>

            {/* University B */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 400,
              }}
            >
              {logoB ? (
                <img
                  src={logoB}
                  width={120}
                  height={120}
                  style={{ borderRadius: 20, marginBottom: 20, objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    width: 120,
                    height: 120,
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    fontSize: 48,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {nameB.slice(0, 2)}
                </div>
              )}
              <div style={{ display: 'flex', color: 'white', fontSize: 28, fontWeight: 600 }}>
                {nameB}
              </div>
              <div
                style={{
                  display: 'flex',
                  color: leader === 'B' ? '#10b981' : 'white',
                  fontSize: 80,
                  fontWeight: 700,
                  marginTop: 10,
                }}
              >
                {scoreB.toFixed(1)}%
              </div>
              {leader === 'B' && (
                <div
                  style={{
                    display: 'flex',
                    marginTop: 15,
                    background: 'rgba(16,185,129,0.2)',
                    borderRadius: 30,
                    padding: '10px 24px',
                    color: '#10b981',
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  🏆 Leader
                </div>
              )}
            </div>
          </div>

          {/* Footer banner */}
          <div
            style={{
              display: 'flex',
              marginTop: 30,
              background: 'rgba(16,185,129,0.15)',
              borderRadius: 16,
              padding: '18px 30px',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', color: '#10b981', fontSize: 24 }}>
              {leader === 'A' ? nameA : nameB} leads by {leadAmount} points in AI visibility
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (error) {
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
          <div style={{ display: 'flex', color: 'white', fontSize: 48, fontWeight: 700 }}>
            University Comparison
          </div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 24, marginTop: 16 }}>
            useharbor.io/universities
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}
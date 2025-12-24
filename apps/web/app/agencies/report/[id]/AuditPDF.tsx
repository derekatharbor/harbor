// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/report/[id]/AuditPDF.tsx
// PDF document for agency audit report - white-label ready

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

// ============================================================================
// STYLES - LIGHT MODE FOR PRINT
// ============================================================================

const colors = {
  bg: '#FFFFFF',
  surface: '#F7F7F8',
  border: 'rgba(0,0,0,0.08)',
  text: '#1C1C1E',
  textMuted: '#6B6B6F',
  textLight: '#8E8E93',
  emerald: '#059669',
  emeraldBg: 'rgba(5,150,105,0.1)',
  yellow: '#D97706',
  yellowBg: 'rgba(217,119,6,0.1)',
  red: '#DC2626',
  redBg: 'rgba(220,38,38,0.1)',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    padding: 40,
    fontFamily: 'Helvetica',
    color: colors.text,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  brandMeta: {
    fontSize: 10,
    color: colors.textLight,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  badgeText: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Score Section
  scoresContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 140,
  },
  // Section
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 16,
  },
  // Competitors
  competitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  competitorRank: {
    width: 20,
    fontSize: 10,
    color: colors.textLight,
  },
  competitorName: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
  },
  competitorBar: {
    flex: 2,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  competitorBarFill: {
    height: 6,
    borderRadius: 3,
  },
  competitorShare: {
    width: 35,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
  },
  // Model Results
  modelGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modelCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  modelCardMentioned: {
    backgroundColor: colors.emeraldBg,
    borderColor: 'rgba(5,150,105,0.2)',
  },
  modelCardNotMentioned: {
    backgroundColor: colors.redBg,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  modelName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  modelStatus: {
    fontSize: 9,
    marginBottom: 8,
  },
  modelStatusMentioned: {
    color: colors.emerald,
  },
  modelStatusNotMentioned: {
    color: colors.red,
  },
  modelMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modelMetricLabel: {
    fontSize: 8,
    color: colors.textLight,
  },
  modelMetricValue: {
    fontSize: 8,
    color: colors.text,
  },
  // Hallucinations
  hallucinationItem: {
    backgroundColor: colors.redBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  hallucinationBadge: {
    fontSize: 7,
    color: colors.red,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  hallucinationClaim: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 4,
  },
  hallucinationSource: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Schema
  schemaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  schemaCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  schemaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  schemaStatusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  schemaStatusText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  schemaDetail: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: colors.textLight,
  },
  footerBrand: {
    fontSize: 8,
    color: colors.textMuted,
  },
})

// ============================================================================
// TYPES
// ============================================================================

interface ModelResult {
  model: string
  mentioned: boolean
  share_of_voice: number
  position: number | null
  sentiment: string
}

interface Competitor {
  name: string
  count: number
  avgPosition: number
}

interface Hallucination {
  claim: string
  model: string
  severity: string
  category: string
}

interface SchemaHealth {
  hasSchema: boolean
  schemaTypes: string[]
  issues: string[]
}

interface AuditData {
  id: string
  brand_name: string
  domain: string
  category: string
  logo_url: string | null
  visibility_score: number
  share_of_voice: number
  model_results: ModelResult[]
  competitors: Competitor[]
  hallucinations: Hallucination[]
  schema_health: SchemaHealth
  created_at: string
}

interface AuditPDFProps {
  audit: AuditData
  whiteLabel?: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const MODEL_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity'
}

function getScoreColor(score: number): string {
  if (score >= 60) return colors.emerald
  if (score >= 30) return colors.yellow
  return colors.red
}

// ============================================================================
// PDF DOCUMENT
// ============================================================================

export function AuditPDF({ audit, whiteLabel = false }: AuditPDFProps) {
  const totalMentions = audit.competitors.reduce((sum, c) => sum + c.count, 0) + (audit.visibility_score > 0 ? 3 : 0)
  const brandShare = totalMentions > 0 ? Math.round(((audit.visibility_score > 0 ? 3 : 0) / totalMentions) * 100) : 0
  const topCompetitorShare = audit.competitors[0] 
    ? Math.round((audit.competitors[0].count / totalMentions) * 100)
    : 0
  const competitorGap = topCompetitorShare - brandShare

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} wrap={false}>
          <View style={styles.logoPlaceholder}>
            <Text style={{ fontSize: 20, color: colors.textLight }}>
              {audit.brand_name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.brandName}>{audit.brand_name}</Text>
            <Text style={styles.brandMeta}>{audit.domain} · {audit.category}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI Visibility Audit</Text>
          </View>
        </View>

        {/* Score Cards */}
        <View style={styles.scoresContainer} wrap={false}>
          {/* Share of Voice */}
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: getScoreColor(audit.share_of_voice) }]}>
              {audit.share_of_voice}%
            </Text>
            <Text style={styles.scoreLabel}>Share of Answer</Text>
            <Text style={styles.scoreDescription}>
              {audit.share_of_voice > 0 
                ? `Appears in ${audit.share_of_voice}% of recommendations`
                : 'Not appearing in recommendations'
              }
            </Text>
          </View>

          {/* AI Visibility */}
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: getScoreColor(audit.visibility_score) }]}>
              {audit.visibility_score}%
            </Text>
            <Text style={styles.scoreLabel}>AI Visibility</Text>
            <Text style={styles.scoreDescription}>
              Mentioned by {audit.model_results.filter(r => r.mentioned).length} of 3 models
            </Text>
          </View>

          {/* Competitor Gap */}
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: competitorGap > 0 ? colors.red : colors.emerald }]}>
              {competitorGap > 0 ? '+' : ''}{competitorGap}%
            </Text>
            <Text style={styles.scoreLabel}>Competitor Gap</Text>
            <Text style={styles.scoreDescription}>
              {audit.competitors[0] 
                ? competitorGap > 0
                  ? `${audit.competitors[0].name} leads by ${competitorGap}pts`
                  : `You lead by ${Math.abs(competitorGap)}pts`
                : 'No competitors detected'
              }
            </Text>
          </View>
        </View>

        {/* Competitors */}
        {audit.competitors.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Who's Winning in AI Results</Text>
            
            {/* Your brand */}
            <View style={styles.competitorRow}>
              <Text style={[styles.competitorRank, { color: colors.emerald }]}>★</Text>
              <Text style={[styles.competitorName, { color: colors.emerald }]}>{audit.brand_name}</Text>
              <View style={styles.competitorBar}>
                <View style={[styles.competitorBarFill, { width: `${brandShare}%`, backgroundColor: colors.emerald }]} />
              </View>
              <Text style={[styles.competitorShare, { color: colors.emerald }]}>{brandShare}%</Text>
            </View>

            {/* Competitors */}
            {audit.competitors.slice(0, 5).map((comp, i) => {
              const share = Math.round((comp.count / totalMentions) * 100)
              return (
                <View key={i} style={styles.competitorRow}>
                  <Text style={styles.competitorRank}>{i + 1}</Text>
                  <Text style={styles.competitorName}>{comp.name}</Text>
                  <View style={styles.competitorBar}>
                    <View style={[styles.competitorBarFill, { width: `${share}%`, backgroundColor: colors.textLight }]} />
                  </View>
                  <Text style={styles.competitorShare}>{share}%</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Model Results */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Performance by Model</Text>
          <View style={styles.modelGrid}>
            {audit.model_results.map((result) => (
              <View 
                key={result.model} 
                style={[
                  styles.modelCard,
                  result.mentioned ? styles.modelCardMentioned : styles.modelCardNotMentioned
                ]}
              >
                <Text style={styles.modelName}>{MODEL_NAMES[result.model] || result.model}</Text>
                <Text style={[
                  styles.modelStatus,
                  result.mentioned ? styles.modelStatusMentioned : styles.modelStatusNotMentioned
                ]}>
                  {result.mentioned ? 'Mentioned' : 'Not Found'}
                </Text>
                <View style={styles.modelMetric}>
                  <Text style={styles.modelMetricLabel}>Position</Text>
                  <Text style={styles.modelMetricValue}>{result.position ? `#${result.position}` : '—'}</Text>
                </View>
                <View style={styles.modelMetric}>
                  <Text style={styles.modelMetricLabel}>Sentiment</Text>
                  <Text style={styles.modelMetricValue}>{result.sentiment}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hallucinations */}
        {audit.hallucinations.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>⚠ Potential Hallucinations Detected</Text>
            {audit.hallucinations.slice(0, 3).map((h, i) => (
              <View key={i} style={styles.hallucinationItem}>
                <Text style={styles.hallucinationBadge}>{h.severity} · {h.category}</Text>
                <Text style={styles.hallucinationClaim}>"{h.claim}"</Text>
                <Text style={styles.hallucinationSource}>Source: {MODEL_NAMES[h.model] || h.model}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Schema Health */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Technical AI Health</Text>
          <View style={styles.schemaGrid}>
            <View style={styles.schemaCard}>
              <View style={styles.schemaStatus}>
                <View style={[
                  styles.schemaStatusIcon, 
                  { backgroundColor: audit.schema_health.hasSchema ? colors.emerald : colors.red }
                ]} />
                <Text style={styles.schemaStatusText}>Structured Data</Text>
              </View>
              <Text style={styles.schemaDetail}>
                {audit.schema_health.hasSchema 
                  ? `Found: ${audit.schema_health.schemaTypes.join(', ')}`
                  : 'No JSON-LD detected'
                }
              </Text>
            </View>
            <View style={styles.schemaCard}>
              <View style={styles.schemaStatus}>
                <View style={[
                  styles.schemaStatusIcon, 
                  { backgroundColor: audit.schema_health.issues.length > 0 ? colors.yellow : colors.emerald }
                ]} />
                <Text style={styles.schemaStatusText}>Issues Found</Text>
              </View>
              <Text style={styles.schemaDetail}>
                {audit.schema_health.issues.length > 0 
                  ? audit.schema_health.issues[0]
                  : 'No critical issues'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        {!whiteLabel && (
          <View style={styles.footer} wrap={false}>
            <Text style={styles.footerText}>
              Generated {new Date(audit.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.footerBrand}>
              Powered by Harbor · useharbor.io
            </Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
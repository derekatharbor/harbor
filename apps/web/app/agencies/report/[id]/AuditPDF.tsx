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
// STYLES - LINEAR-INSPIRED LIGHT MODE
// ============================================================================

const colors = {
  bg: '#FFFFFF',
  surface: '#FAFAFA',
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  text: '#171717',
  textMuted: '#525252',
  textLight: '#A3A3A3',
  emerald: '#10B981',
  emeraldBg: '#F0FDF4',
  yellow: '#F59E0B',
  yellowBg: '#FFFBEB',
  red: '#EF4444',
  redBg: '#FEF2F2',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    padding: 48,
    fontFamily: 'Helvetica',
    color: colors.text,
  },
  // Header
  header: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  brandMeta: {
    fontSize: 11,
    color: colors.textLight,
  },
  // Score Section
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 16,
  },
  // Competitors
  competitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  competitorRank: {
    width: 24,
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
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    marginHorizontal: 16,
  },
  competitorBarFill: {
    height: 4,
    borderRadius: 2,
  },
  competitorShare: {
    width: 40,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
  },
  // Model Results
  modelGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  modelCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  modelCardMentioned: {
    backgroundColor: colors.bg,
    borderColor: colors.emerald,
  },
  modelCardNotMentioned: {
    backgroundColor: colors.bg,
    borderColor: colors.red,
  },
  modelName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 2,
  },
  modelStatus: {
    fontSize: 10,
    marginBottom: 12,
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
    fontSize: 9,
    color: colors.textLight,
  },
  modelMetricValue: {
    fontSize: 9,
    color: colors.text,
  },
  // Hallucinations
  hallucinationItem: {
    padding: 14,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
    backgroundColor: colors.surface,
  },
  hallucinationBadge: {
    fontSize: 8,
    color: colors.red,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  hallucinationClaim: {
    fontSize: 11,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  hallucinationSource: {
    fontSize: 9,
    color: colors.textLight,
  },
  // Schema
  schemaGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  schemaCard: {
    flex: 1,
    padding: 14,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  schemaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  schemaStatusIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  schemaStatusText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  schemaDetail: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: colors.textLight,
  },
  footerBrand: {
    fontSize: 9,
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
          <Text style={styles.brandName}>{audit.brand_name}</Text>
          <Text style={styles.brandMeta}>AI Visibility Audit · {audit.domain} · {audit.category}</Text>
        </View>

        {/* Score Cards */}
        <View style={styles.scoresContainer} wrap={false}>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: getScoreColor(audit.share_of_voice) }]}>
              {audit.share_of_voice}%
            </Text>
            <Text style={styles.scoreLabel}>Share of Answer</Text>
            <Text style={styles.scoreDescription}>
              {audit.share_of_voice > 0 
                ? `Appears in ${audit.share_of_voice}% of recommendations`
                : 'Not in recommendations'
              }
            </Text>
          </View>

          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: getScoreColor(audit.visibility_score) }]}>
              {audit.visibility_score}%
            </Text>
            <Text style={styles.scoreLabel}>AI Visibility</Text>
            <Text style={styles.scoreDescription}>
              Mentioned by {audit.model_results.filter(r => r.mentioned).length} of 3 models
            </Text>
          </View>

          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: competitorGap > 0 ? colors.red : colors.emerald }]}>
              {competitorGap > 0 ? '+' : ''}{competitorGap}%
            </Text>
            <Text style={styles.scoreLabel}>Competitor Gap</Text>
            <Text style={styles.scoreDescription}>
              {audit.competitors[0] 
                ? competitorGap > 0
                  ? `${audit.competitors[0].name} leads`
                  : 'You lead'
                : 'No competitors'
              }
            </Text>
          </View>
        </View>

        {/* Competitors */}
        {audit.competitors.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Competitive Landscape</Text>
            
            <View style={styles.competitorRow}>
              <Text style={[styles.competitorRank, { color: colors.emerald }]}>●</Text>
              <Text style={[styles.competitorName, { fontFamily: 'Helvetica-Bold' }]}>{audit.brand_name}</Text>
              <View style={styles.competitorBar}>
                <View style={[styles.competitorBarFill, { width: `${brandShare}%`, backgroundColor: colors.emerald }]} />
              </View>
              <Text style={[styles.competitorShare, { color: colors.emerald }]}>{brandShare}%</Text>
            </View>

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
            <Text style={styles.sectionTitle}>Potential Inaccuracies Detected</Text>
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
          <Text style={styles.sectionTitle}>Technical Health</Text>
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
                <Text style={styles.schemaStatusText}>Issues</Text>
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
              Harbor · useharbor.io
            </Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
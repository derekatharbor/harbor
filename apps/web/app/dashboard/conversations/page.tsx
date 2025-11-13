// app/dashboard/conversations/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MessageSquare, TrendingUp, HelpCircle, AlertCircle, Zap } from 'lucide-react'

interface Question {
  question: string
  intent: string
  score: number
  emerging: boolean
  mentionsBrand: boolean
  competitorName?: string
}

interface IntentStats {
  intent: string
  count: number
  percentage: number
}

export default function ConversationsPage() {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [conversationScore, setConversationScore] = useState<number>(0)
  const [brandName, setBrandName] = useState('')
  const [intentStats, setIntentStats] = useState<IntentStats[]>([])

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadConversationsData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: userRole } = await supabase
          .from('user_roles')
          .select('org_id')
          .eq('user_id', session.user.id)
          .single()

        if (!userRole) return

        const { data: dashboard } = await supabase
          .from('dashboards')
          .select('id, brand_name')
          .eq('org_id', userRole.org_id)
          .single()

        if (!dashboard) return

        setBrandName(dashboard.brand_name)

        const { data: latestScan } = await supabase
          .from('scans')
          .select('id')
          .eq('dashboard_id', dashboard.id)
          .eq('status', 'done')
          .order('finished_at', { ascending: false })
          .limit(1)
          .single()

        if (!latestScan) {
          setLoading(false)
          return
        }

        // Get conversation score
        const { data: scoreData } = await supabase
          .from('visibility_scores')
          .select('conversation_score')
          .eq('scan_id', latestScan.id)
          .single()

        if (scoreData) {
          setConversationScore(scoreData.conversation_score || 0)
        }

        // Get questions
        const { data: questionData } = await supabase
          .from('results_conversations')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('score', { ascending: false })

        if (questionData) {
          const processedQuestions: Question[] = questionData.map(q => ({
            question: q.question,
            intent: q.intent,
            score: q.score || 0,
            emerging: q.emerging || false,
            mentionsBrand: q.mentions_brand || false,
            competitorName: q.competitor_name,
          }))

          setQuestions(processedQuestions)

          // Calculate intent stats
          const intentCounts = new Map<string, number>()
          processedQuestions.forEach(q => {
            intentCounts.set(q.intent, (intentCounts.get(q.intent) || 0) + 1)
          })

          const stats: IntentStats[] = Array.from(intentCounts.entries()).map(([intent, count]) => ({
            intent,
            count,
            percentage: (count / processedQuestions.length) * 100,
          }))

          setIntentStats(stats.sort((a, b) => b.count - a.count))
        }

      } catch (error) {
        console.error('Error loading conversations data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConversationsData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white font-mono">Loading conversation data...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#101A31] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-coral mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-white mb-2">
              No conversation data yet
            </h2>
            <p className="text-softgray font-body">
              Run a scan to see what users ask AI about your brand
            </p>
          </div>
        </div>
      </div>
    )
  }

  const brandSpecificQuestions = questions.filter(q => q.mentionsBrand)
  const comparisonQuestions = questions.filter(q => q.intent === 'vs')
  const emergingQuestions = questions.filter(q => q.emerging)

  const intentIcons: Record<string, JSX.Element> = {
    how_to: <HelpCircle className="w-4 h-4" />,
    vs: <TrendingUp className="w-4 h-4" />,
    price: <span className="text-xs font-bold">$</span>,
    trust: <span className="text-xs font-bold">✓</span>,
    features: <MessageSquare className="w-4 h-4" />,
  }

  const intentColors: Record<string, string> = {
    how_to: 'bg-cerulean/20 text-cerulean border-cerulean/30',
    vs: 'bg-coral/20 text-coral border-coral/30',
    price: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    trust: 'bg-green-500/20 text-green-500 border-green-500/30',
    features: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  }

  return (
    <div className="min-h-screen bg-[#101A31]">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-8 h-8 text-coral" />
            <h1 className="text-3xl font-heading font-bold text-white">
              Conversation Volumes
            </h1>
          </div>
          <p className="text-softgray font-body text-lg">
            What users ask AI about your brand and category
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Conversation Score</span>
              <MessageSquare className="w-4 h-4 text-coral" />
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {conversationScore.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-cerulean text-sm font-body">
              <TrendingUp className="w-3 h-3" />
              <span>+3.1% vs last scan</span>
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Total Questions</span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {questions.length}
            </div>
            <div className="text-softgray text-sm font-body">
              Identified
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Brand-Specific</span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {brandSpecificQuestions.length}
            </div>
            <div className="text-softgray text-sm font-body">
              {((brandSpecificQuestions.length / questions.length) * 100).toFixed(0)}% of total
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Emerging Topics</span>
              <Zap className="w-4 h-4 text-coral" />
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {emergingQuestions.length}
            </div>
            <div className="text-softgray text-sm font-body">
              New this week
            </div>
          </div>
        </div>

        {/* Intent Breakdown */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 mb-8">
          <h3 className="text-xl font-heading font-semibold text-white mb-6">
            Question Intents
          </h3>

          <div className="grid md:grid-cols-5 gap-4">
            {intentStats.map(stat => (
              <div
                key={stat.intent}
                className="bg-[#101A31] rounded-lg p-4 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded ${intentColors[stat.intent] || 'bg-softgray/20'}`}>
                    {intentIcons[stat.intent] || <HelpCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-xs text-softgray font-body uppercase tracking-wide">
                    {stat.intent.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-2xl font-heading font-bold text-white mb-1">
                  {stat.count}
                </div>
                <div className="text-xs text-softgray font-body">
                  {stat.percentage.toFixed(0)}% of questions
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Brand-Specific Questions */}
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-6">
              Brand-Specific Questions
            </h3>

            <div className="space-y-3">
              {brandSpecificQuestions.slice(0, 10).map((q, idx) => (
                <div
                  key={idx}
                  className="bg-[#101A31] rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-coral text-sm font-heading">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-body mb-2">
                        {q.question}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-body border ${
                            intentColors[q.intent] || 'bg-softgray/20 text-softgray border-softgray/30'
                          }`}
                        >
                          {q.intent.replace('_', ' ')}
                        </span>
                        {q.emerging && (
                          <span className="px-2 py-1 rounded text-xs font-body bg-coral/20 text-coral border border-coral/30">
                            <Zap className="w-3 h-3 inline mr-1" />
                            Emerging
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Questions */}
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-6">
              Competitor Comparisons
            </h3>

            {comparisonQuestions.length > 0 ? (
              <div className="space-y-3">
                {comparisonQuestions.slice(0, 10).map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-[#101A31] rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cerulean/20 flex items-center justify-center text-cerulean text-sm font-heading">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-body mb-2">
                          {q.question}
                        </p>
                        {q.competitorName && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-softgray font-body">
                              vs {q.competitorName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-softgray/30 mx-auto mb-4" />
                <p className="text-softgray font-body text-sm">
                  No comparison questions found yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* All Questions Table */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 mt-8">
          <h3 className="text-xl font-heading font-semibold text-white mb-6">
            All Questions ({questions.length})
          </h3>

          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[#101A31]/50 hover:bg-[#101A31] transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm text-white font-body">{q.question}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-body border ${
                      intentColors[q.intent] || 'bg-softgray/20 text-softgray border-softgray/30'
                    }`}
                  >
                    {q.intent.replace('_', ' ')}
                  </span>
                  {q.mentionsBrand && (
                    <span className="px-2 py-1 rounded text-xs font-body bg-coral/20 text-coral border border-coral/30">
                      Brand
                    </span>
                  )}
                  {q.emerging && (
                    <span className="px-2 py-1 rounded text-xs font-body bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                      <Zap className="w-3 h-3 inline" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
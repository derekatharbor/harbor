#!/usr/bin/env tsx

/**
 * Harbor Hallucination Tracker
 * 
 * Queries ChatGPT, Claude, and Gemini with factual questions about brands
 * then compares their answers to our verified feed_data.
 * 
 * Usage:
 *   npx tsx scripts/hallucination-tracker.ts
 *   npx tsx scripts/hallucination-tracker.ts --limit 10
 *   npx tsx scripts/hallucination-tracker.ts --brand "nike"
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'

// Setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../../.env') })

// ============================================================================
// TYPES
// ============================================================================

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  feed_data: any
  visibility_score: number
}

interface HallucinationResult {
  brand_name: string
  domain: string
  question_type: string
  question: string
  verified_answer: string | null
  chatgpt_answer: string | null
  claude_answer: string | null
  gemini_answer: string | null
  chatgpt_accurate: boolean | null
  claude_accurate: boolean | null
  gemini_accurate: boolean | null
  notes: string
}

type AIModel = 'chatgpt' | 'claude' | 'gemini'

// ============================================================================
// AI CLIENTS
// ============================================================================

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const gemini = process.env.GOOGLE_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  : null

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// API CALLERS
// ============================================================================

async function askChatGPT(question: string): Promise<string | null> {
  if (!openai) {
    console.log('  ⚠️  OpenAI API key not configured')
    return null
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: question }],
      max_tokens: 300,
      temperature: 0
    })
    return response.choices[0]?.message?.content?.trim() || null
  } catch (error: any) {
    console.log(`  ❌ ChatGPT error: ${error.message}`)
    return null
  }
}

async function askClaude(question: string): Promise<string | null> {
  if (!anthropic) {
    console.log('  ⚠️  Anthropic API key not configured')
    return null
  }
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: question }]
    })
    const textBlock = response.content.find((block: any) => block.type === 'text')
    return textBlock?.type === 'text' ? textBlock.text.trim() : null
  } catch (error: any) {
    console.log(`  ❌ Claude error: ${error.message}`)
    return null
  }
}

async function askGemini(question: string): Promise<string | null> {
  if (!gemini) {
    console.log('  ⚠️  Google API key not configured')
    return null
  }
  
  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(question)
    const response = await result.response
    return response.text().trim()
  } catch (error: any) {
    console.log(`  ❌ Gemini error: ${error.message}`)
    return null
  }
}

// ============================================================================
// QUESTION GENERATORS
// ============================================================================

interface QuestionSet {
  type: string
  question: string
  getVerifiedAnswer: (feedData: any) => string | null
}

function generateQuestions(brandName: string, domain: string): QuestionSet[] {
  return [
    {
      type: 'what_they_do',
      question: `What does ${brandName} (${domain}) do? Give a brief 1-2 sentence answer.`,
      getVerifiedAnswer: (fd) => fd?.one_line_summary || fd?.short_description || null
    },
    {
      type: 'competitors',
      question: `Who are ${brandName}'s main competitors? List the top 3-5.`,
      getVerifiedAnswer: (fd) => {
        if (!fd?.competitor_context?.competitors) return null
        return fd.competitor_context.competitors.slice(0, 5).join(', ')
      }
    },
    {
      type: 'pricing',
      question: `How much does ${brandName} cost? What's their pricing model?`,
      getVerifiedAnswer: (fd) => {
        if (!fd?.pricing) return null
        const p = fd.pricing
        let answer = ''
        if (p.has_free_tier) answer += 'Has free tier. '
        if (p.starting_price) answer += `Starting at ${p.starting_price}. `
        if (p.model) answer += `${p.model}`
        return answer.trim() || null
      }
    },
    {
      type: 'target_audience',
      question: `Who is ${brandName} for? What type of customers or businesses use it?`,
      getVerifiedAnswer: (fd) => {
        if (!fd?.use_cases || fd.use_cases.length === 0) return null
        return fd.use_cases.slice(0, 3).join(', ')
      }
    },
    {
      type: 'downsides',
      question: `What are the main drawbacks, limitations, or criticisms of ${brandName}?`,
      getVerifiedAnswer: (fd) => null // We don't verify this - just capture what AI says
    },
    {
      type: 'recommendation',
      question: `Would you recommend ${brandName}? Why or why not?`,
      getVerifiedAnswer: (fd) => null // We don't verify this - just capture what AI says
    }
  ]
}

// ============================================================================
// ACCURACY CHECKER
// ============================================================================

function checkAccuracy(aiAnswer: string | null, verifiedAnswer: string | null): boolean | null {
  if (!aiAnswer || !verifiedAnswer) return null
  
  const aiLower = aiAnswer.toLowerCase().trim()
  const verifiedLower = verifiedAnswer.toLowerCase().trim()
  
  // Exact match
  if (aiLower === verifiedLower) return true
  
  // AI answer is contained in verified (e.g., "Cambridge" in "314 Main Street, Cambridge, MA")
  if (verifiedLower.includes(aiLower) && aiLower.length > 3) return true
  
  // Verified is contained in AI answer
  if (aiLower.includes(verifiedLower)) return true
  
  // For years, just check if the year appears
  const yearMatch = verifiedLower.match(/\b(19|20)\d{2}\b/)
  if (yearMatch && aiLower.includes(yearMatch[0])) return true
  
  // For locations, check city/state match
  const locationParts = verifiedLower.split(/[,\s]+/).filter(p => p.length > 2)
  const cityOrState = locationParts.filter(p => 
    !p.match(/^\d+$/) && // not a number
    !['street', 'st', 'ave', 'avenue', 'road', 'rd', 'suite', 'floor'].includes(p)
  )
  const locationMatches = cityOrState.filter(part => aiLower.includes(part)).length
  if (cityOrState.length > 0 && locationMatches >= 1) return true
  
  // Check if key parts of verified answer appear in AI answer
  const verifiedParts = verifiedLower.split(/[,\s]+/).filter(p => p.length > 3)
  const matchCount = verifiedParts.filter(part => aiLower.includes(part)).length
  
  // Consider accurate if at least 40% of key parts match
  if (verifiedParts.length > 0 && matchCount >= verifiedParts.length * 0.4) return true
  
  return false
}

// ============================================================================
// MAIN TRACKER
// ============================================================================

async function trackHallucinations(options: { limit?: number; brandSlug?: string; withGemini?: boolean } = {}) {
  const { limit = 20, brandSlug, withGemini = false } = options
  
  console.log('\n🔍 Harbor Hallucination Tracker')
  console.log('================================\n')
  
  // Check API keys
  console.log('API Status:')
  console.log(`  OpenAI:    ${openai ? '✓ Ready' : '✗ Missing OPENAI_API_KEY'}`)
  console.log(`  Anthropic: ${anthropic ? '✓ Ready' : '✗ Missing ANTHROPIC_API_KEY'}`)
  console.log(`  Google:    ${withGemini ? (gemini ? '✓ Ready' : '✗ Missing GOOGLE_API_KEY') : '⏭️  Skipped (use --with-gemini)'}`)
  console.log('')
  
  if (!openai && !anthropic && !gemini) {
    console.error('❌ No API keys configured. Cannot proceed.')
    process.exit(1)
  }
  
  // Fetch brands with feed_data
  let query = supabase
    .from('ai_profiles')
    .select('id, brand_name, slug, domain, feed_data, visibility_score')
    .not('feed_data', 'is', null)
    .order('visibility_score', { ascending: false })
  
  if (brandSlug) {
    query = query.eq('slug', brandSlug)
  } else {
    query = query.limit(limit)
  }
  
  const { data: brands, error } = await query
  
  if (error || !brands) {
    console.error('Failed to fetch brands:', error)
    process.exit(1)
  }
  
  console.log(`📊 Testing ${brands.length} brands\n`)
  
  const results: HallucinationResult[] = []
  const stats = {
    total_questions: 0,
    chatgpt_accurate: 0,
    chatgpt_inaccurate: 0,
    claude_accurate: 0,
    claude_inaccurate: 0,
    gemini_accurate: 0,
    gemini_inaccurate: 0,
  }
  
  for (const brand of brands) {
    console.log(`\n🏢 ${brand.brand_name} (${brand.domain})`)
    console.log('─'.repeat(50))
    
    const feedData = typeof brand.feed_data === 'string' 
      ? JSON.parse(brand.feed_data) 
      : brand.feed_data
    
    const questions = generateQuestions(brand.brand_name, brand.domain)
    
    for (const q of questions) {
      const verifiedAnswer = q.getVerifiedAnswer(feedData)
      const isUnverified = q.type === 'downsides' || q.type === 'recommendation'
      
      // Skip verified questions where we don't have data (but always run unverified ones)
      if (!verifiedAnswer && !isUnverified) {
        console.log(`  ⏭️  ${q.type}: No verified data, skipping`)
        continue
      }
      
      console.log(`  📝 ${q.type}${isUnverified ? ' (capturing AI sentiment)' : ''}`)
      if (verifiedAnswer) {
        console.log(`     Verified: ${verifiedAnswer.substring(0, 60)}${verifiedAnswer.length > 60 ? '...' : ''}`)
      }
      
      // Query models (skip Gemini by default - use --with-gemini to include)
      const [chatgptAnswer, claudeAnswer, geminiAnswer] = await Promise.all([
        askChatGPT(q.question),
        askClaude(q.question),
        withGemini ? askGemini(q.question) : Promise.resolve(null)
      ])
      
      // Check accuracy (null for unverified questions)
      const chatgptAccurate = isUnverified ? null : checkAccuracy(chatgptAnswer, verifiedAnswer)
      const claudeAccurate = isUnverified ? null : checkAccuracy(claudeAnswer, verifiedAnswer)
      const geminiAccurate = isUnverified ? null : checkAccuracy(geminiAnswer, verifiedAnswer)
      
      // Log results
      if (chatgptAnswer) {
        const icon = isUnverified ? '💬' : (chatgptAccurate ? '✓' : '✗')
        console.log(`     ChatGPT ${icon}: ${chatgptAnswer.substring(0, 70)}${chatgptAnswer.length > 70 ? '...' : ''}`)
      }
      if (claudeAnswer) {
        const icon = isUnverified ? '💬' : (claudeAccurate ? '✓' : '✗')
        console.log(`     Claude ${icon}:  ${claudeAnswer.substring(0, 70)}${claudeAnswer.length > 70 ? '...' : ''}`)
      }
      if (geminiAnswer) {
        const icon = isUnverified ? '💬' : (geminiAccurate ? '✓' : '✗')
        console.log(`     Gemini ${icon}:  ${geminiAnswer.substring(0, 70)}${geminiAnswer.length > 70 ? '...' : ''}`)
      }
      
      // Update stats (only for verified questions)
      if (!isUnverified) {
        stats.total_questions++
        if (chatgptAccurate === true) stats.chatgpt_accurate++
        if (chatgptAccurate === false) stats.chatgpt_inaccurate++
        if (claudeAccurate === true) stats.claude_accurate++
        if (claudeAccurate === false) stats.claude_inaccurate++
        if (geminiAccurate === true) stats.gemini_accurate++
        if (geminiAccurate === false) stats.gemini_inaccurate++
      }
      
      // Store result
      results.push({
        brand_name: brand.brand_name,
        domain: brand.domain,
        question_type: q.type,
        question: q.question,
        verified_answer: verifiedAnswer,
        chatgpt_answer: chatgptAnswer,
        claude_answer: claudeAnswer,
        gemini_answer: geminiAnswer,
        chatgpt_accurate: chatgptAccurate,
        claude_accurate: claudeAccurate,
        gemini_accurate: geminiAccurate,
        notes: isUnverified ? 'sentiment_capture' : ''
      })
      
      // Rate limiting - small delay between questions
      await new Promise(r => setTimeout(r, 300))
    }
  }
  
  // Print summary
  console.log('\n\n📈 SUMMARY')
  console.log('═'.repeat(50))
  console.log(`Total questions tested: ${stats.total_questions}`)
  console.log('')
  console.log('Accuracy by model:')
  
  const chatgptTotal = stats.chatgpt_accurate + stats.chatgpt_inaccurate
  const claudeTotal = stats.claude_accurate + stats.claude_inaccurate
  const geminiTotal = stats.gemini_accurate + stats.gemini_inaccurate
  
  if (chatgptTotal > 0) {
    const pct = ((stats.chatgpt_accurate / chatgptTotal) * 100).toFixed(1)
    console.log(`  ChatGPT: ${stats.chatgpt_accurate}/${chatgptTotal} accurate (${pct}%)`)
    console.log(`           ${stats.chatgpt_inaccurate} hallucinations`)
  }
  
  if (claudeTotal > 0) {
    const pct = ((stats.claude_accurate / claudeTotal) * 100).toFixed(1)
    console.log(`  Claude:  ${stats.claude_accurate}/${claudeTotal} accurate (${pct}%)`)
    console.log(`           ${stats.claude_inaccurate} hallucinations`)
  }
  
  if (geminiTotal > 0) {
    const pct = ((stats.gemini_accurate / geminiTotal) * 100).toFixed(1)
    console.log(`  Gemini:  ${stats.gemini_accurate}/${geminiTotal} accurate (${pct}%)`)
    console.log(`           ${stats.gemini_inaccurate} hallucinations`)
  }
  
  // Save results to file
  const timestamp = new Date().toISOString().split('T')[0]
  const outputPath = resolve(__dirname, `../../../hallucination-report-${timestamp}.json`)
  
  const report = {
    generated_at: new Date().toISOString(),
    stats,
    results
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Full report saved to: ${outputPath}`)
  
  // Find the juiciest hallucinations for LinkedIn
  const hallucinations = results.filter(r => 
    r.chatgpt_accurate === false || 
    r.claude_accurate === false || 
    r.gemini_accurate === false
  )
  
  if (hallucinations.length > 0) {
    console.log('\n\n🔥 TOP HALLUCINATIONS FOR LINKEDIN:')
    console.log('─'.repeat(50))
    
    hallucinations.slice(0, 10).forEach((h, i) => {
      console.log(`\n${i + 1}. ${h.brand_name} - ${h.question_type}`)
      console.log(`   Question: ${h.question}`)
      console.log(`   Truth: ${h.verified_answer}`)
      
      if (h.chatgpt_accurate === false && h.chatgpt_answer) {
        console.log(`   ❌ ChatGPT said: ${h.chatgpt_answer}`)
      }
      if (h.claude_accurate === false && h.claude_answer) {
        console.log(`   ❌ Claude said: ${h.claude_answer}`)
      }
      if (h.gemini_accurate === false && h.gemini_answer) {
        console.log(`   ❌ Gemini said: ${h.gemini_answer}`)
      }
    })
  }
  
  // Show spicy AI sentiment (downsides, recommendations)
  const sentimentResults = results.filter(r => r.notes === 'sentiment_capture')
  
  if (sentimentResults.length > 0) {
    console.log('\n\n🌶️  WHAT AI SAYS ABOUT YOUR BRAND (Downsides & Recommendations):')
    console.log('═'.repeat(60))
    
    // Group by brand
    const byBrand: Record<string, typeof sentimentResults> = {}
    sentimentResults.forEach(r => {
      if (!byBrand[r.brand_name]) byBrand[r.brand_name] = []
      byBrand[r.brand_name].push(r)
    })
    
    Object.entries(byBrand).slice(0, 10).forEach(([brand, items]) => {
      console.log(`\n🏢 ${brand}`)
      
      const downsides = items.find(i => i.question_type === 'downsides')
      const recommendation = items.find(i => i.question_type === 'recommendation')
      
      if (downsides) {
        console.log(`\n   ⚠️  DOWNSIDES:`)
        if (downsides.chatgpt_answer) {
          console.log(`   ChatGPT: ${downsides.chatgpt_answer.substring(0, 200)}${downsides.chatgpt_answer.length > 200 ? '...' : ''}`)
        }
        if (downsides.claude_answer) {
          console.log(`   Claude:  ${downsides.claude_answer.substring(0, 200)}${downsides.claude_answer.length > 200 ? '...' : ''}`)
        }
      }
      
      if (recommendation) {
        console.log(`\n   👍 RECOMMENDATION:`)
        if (recommendation.chatgpt_answer) {
          console.log(`   ChatGPT: ${recommendation.chatgpt_answer.substring(0, 200)}${recommendation.chatgpt_answer.length > 200 ? '...' : ''}`)
        }
        if (recommendation.claude_answer) {
          console.log(`   Claude:  ${recommendation.claude_answer.substring(0, 200)}${recommendation.claude_answer.length > 200 ? '...' : ''}`)
        }
      }
    })
  }
  
  console.log('\n✅ Done!\n')
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2)
const limitArg = args.find(a => a.startsWith('--limit'))
const brandArg = args.find(a => a.startsWith('--brand'))
const withGemini = args.includes('--with-gemini')

const limit = limitArg ? parseInt(limitArg.split('=')[1] || '20') : 20
const brandSlug = brandArg ? brandArg.split('=')[1] : undefined

trackHallucinations({ limit, brandSlug, withGemini })
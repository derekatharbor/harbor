// apps/web/lib/scoring.ts
// Scoring logic for Harbor Score calculation

export interface ProfileData {
  description?: string
  offerings?: any[]
  faqs?: any[]
  companyInfo?: {
    hq_location?: string
    founded_year?: number
  }
}

/**
 * Calculate website readiness score (0-100)
 * Based on profile completion and technical factors
 */
export function calculateWebsiteReadiness(profileData: ProfileData): number {
  let score = 0
  const maxScore = 100

  // Description (20 points)
  if (profileData.description && profileData.description.length >= 50) {
    score += 20
  } else if (profileData.description && profileData.description.length >= 20) {
    score += 10
  }

  // Offerings (30 points)
  if (profileData.offerings && profileData.offerings.length > 0) {
    const offeringScore = Math.min(profileData.offerings.length * 10, 30)
    score += offeringScore
  }

  // FAQs (30 points)
  if (profileData.faqs && profileData.faqs.length > 0) {
    const faqScore = Math.min(profileData.faqs.length * 6, 30)
    score += faqScore
  }

  // Company Info (20 points)
  if (profileData.companyInfo) {
    if (profileData.companyInfo.hq_location) score += 10
    if (profileData.companyInfo.founded_year) score += 10
  }

  return Math.min(score, maxScore)
}

/**
 * Calculate profile completeness percentage (0-100)
 * For display purposes - shows how much of profile is filled
 */
export function calculateProfileCompleteness(profileData: ProfileData): number {
  let completed = 0
  const totalFields = 4

  if (profileData.description && profileData.description.length >= 20) completed++
  if (profileData.offerings && profileData.offerings.length > 0) completed++
  if (profileData.faqs && profileData.faqs.length > 0) completed++
  if (profileData.companyInfo?.hq_location || profileData.companyInfo?.founded_year) completed++

  return Math.round((completed / totalFields) * 100)
}

/**
 * Calculate Harbor Score (0-100)
 * Formula: (visibility * 0.4) + (websiteReadiness * 0.6)
 */
export function calculateHarborScore(
  visibilityScore: number,
  websiteReadiness: number
): number {
  return (visibilityScore * 0.4) + (websiteReadiness * 0.6)
}

/**
 * Get improvement suggestions based on current profile
 */
export function getImprovementSuggestions(profileData: ProfileData): string[] {
  const suggestions: string[] = []

  if (!profileData.description || profileData.description.length < 50) {
    suggestions.push('Add a detailed brand description (50+ characters)')
  }

  if (!profileData.offerings || profileData.offerings.length === 0) {
    suggestions.push('List your products and services')
  } else if (profileData.offerings.length < 3) {
    suggestions.push('Add more product offerings (aim for 3+)')
  }

  if (!profileData.faqs || profileData.faqs.length === 0) {
    suggestions.push('Add frequently asked questions')
  } else if (profileData.faqs.length < 5) {
    suggestions.push('Add more FAQs (aim for 5+)')
  }

  if (!profileData.companyInfo?.hq_location) {
    suggestions.push('Add your headquarters location')
  }

  if (!profileData.companyInfo?.founded_year) {
    suggestions.push('Add your founding year')
  }

  return suggestions
}

/**
 * Calculate potential score improvement
 */
export function calculatePotentialImprovement(
  currentWebsiteReadiness: number,
  profileData: ProfileData
): number {
  // Calculate what their readiness COULD be if they complete everything
  const potentialReadiness = 100 // Maximum possible
  const improvement = potentialReadiness - currentWebsiteReadiness
  
  // Convert to Harbor Score improvement (60% weighting)
  return improvement * 0.6
}

// app/universities/compare/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CompareClient from './CompareClient'

// Mock data - same as other pages
const MOCK_UNIVERSITIES = [
  { id: '1', name: 'Stanford University', short_name: 'Stanford', slug: 'stanford', domain: 'stanford.edu', logo_url: null, city: 'Stanford', state: 'CA', institution_type: 'private', enrollment: 17680, acceptance_rate: 3.68, graduation_rate: 96, us_news_rank: 3, athletic_conference: 'ACC', visibility_score: 94.2, total_mentions: 2847, sentiment_score: 89.5, known_for: ['Computer Science', 'Engineering', 'Business'] },
  { id: '2', name: 'Massachusetts Institute of Technology', short_name: 'MIT', slug: 'mit', domain: 'mit.edu', logo_url: null, city: 'Cambridge', state: 'MA', institution_type: 'private', enrollment: 11858, acceptance_rate: 3.96, graduation_rate: 97, us_news_rank: 2, athletic_conference: 'NEWMAC', visibility_score: 93.8, total_mentions: 3124, sentiment_score: 91.2, known_for: ['Engineering', 'Computer Science', 'Research'] },
  { id: '3', name: 'Harvard University', short_name: 'Harvard', slug: 'harvard', domain: 'harvard.edu', logo_url: null, city: 'Cambridge', state: 'MA', institution_type: 'private', enrollment: 23731, acceptance_rate: 3.19, graduation_rate: 98, us_news_rank: 4, athletic_conference: 'Ivy League', visibility_score: 92.5, total_mentions: 4521, sentiment_score: 85.3, known_for: ['Law', 'Business', 'Medicine'] },
  { id: '4', name: 'Yale University', short_name: 'Yale', slug: 'yale', domain: 'yale.edu', logo_url: null, city: 'New Haven', state: 'CT', institution_type: 'private', enrollment: 14776, acceptance_rate: 4.35, graduation_rate: 97, us_news_rank: 5, athletic_conference: 'Ivy League', visibility_score: 89.7, total_mentions: 2156, sentiment_score: 87.8, known_for: ['Law', 'Drama', 'Liberal Arts'] },
  { id: '5', name: 'Princeton University', short_name: 'Princeton', slug: 'princeton', domain: 'princeton.edu', logo_url: null, city: 'Princeton', state: 'NJ', institution_type: 'private', enrollment: 8478, acceptance_rate: 3.98, graduation_rate: 98, us_news_rank: 1, athletic_conference: 'Ivy League', visibility_score: 88.4, total_mentions: 1987, sentiment_score: 90.1, known_for: ['Mathematics', 'Physics', 'Economics'] },
  { id: '6', name: 'University of California, Berkeley', short_name: 'UC Berkeley', slug: 'uc-berkeley', domain: 'berkeley.edu', logo_url: null, city: 'Berkeley', state: 'CA', institution_type: 'public', enrollment: 45307, acceptance_rate: 11.6, graduation_rate: 93, us_news_rank: 15, athletic_conference: 'Big Ten', visibility_score: 87.9, total_mentions: 2654, sentiment_score: 82.4, known_for: ['Computer Science', 'Engineering', 'Research'] },
  { id: '7', name: 'University of Michigan', short_name: 'Michigan', slug: 'michigan', domain: 'umich.edu', logo_url: null, city: 'Ann Arbor', state: 'MI', institution_type: 'public', enrollment: 47907, acceptance_rate: 17.7, graduation_rate: 93, us_news_rank: 21, athletic_conference: 'Big Ten', visibility_score: 85.2, total_mentions: 2234, sentiment_score: 84.7, known_for: ['Business', 'Engineering', 'Sports'] },
  { id: '8', name: 'Duke University', short_name: 'Duke', slug: 'duke', domain: 'duke.edu', logo_url: null, city: 'Durham', state: 'NC', institution_type: 'private', enrollment: 17620, acceptance_rate: 5.93, graduation_rate: 96, us_news_rank: 7, athletic_conference: 'ACC', visibility_score: 84.8, total_mentions: 1876, sentiment_score: 86.9, known_for: ['Basketball', 'Medicine', 'Business'] },
  { id: '9', name: 'University of Pennsylvania', short_name: 'Penn', slug: 'upenn', domain: 'upenn.edu', logo_url: null, city: 'Philadelphia', state: 'PA', institution_type: 'private', enrollment: 28201, acceptance_rate: 5.68, graduation_rate: 96, us_news_rank: 6, athletic_conference: 'Ivy League', visibility_score: 84.1, total_mentions: 1654, sentiment_score: 85.2, known_for: ['Business', 'Finance', 'Medicine'] },
  { id: '10', name: 'Columbia University', short_name: 'Columbia', slug: 'columbia', domain: 'columbia.edu', logo_url: null, city: 'New York', state: 'NY', institution_type: 'private', enrollment: 36649, acceptance_rate: 3.85, graduation_rate: 96, us_news_rank: 12, athletic_conference: 'Ivy League', visibility_score: 83.6, total_mentions: 2087, sentiment_score: 81.5, known_for: ['Journalism', 'Business', 'Law'] },
  { id: '11', name: 'University of Notre Dame', short_name: 'Notre Dame', slug: 'notre-dame', domain: 'nd.edu', logo_url: null, city: 'Notre Dame', state: 'IN', institution_type: 'private', enrollment: 14012, acceptance_rate: 12.9, graduation_rate: 97, us_news_rank: 18, athletic_conference: 'ACC', visibility_score: 82.4, total_mentions: 1543, sentiment_score: 88.7, known_for: ['Football', 'Business', 'Theology'] },
  { id: '12', name: 'Northwestern University', short_name: 'Northwestern', slug: 'northwestern', domain: 'northwestern.edu', logo_url: null, city: 'Evanston', state: 'IL', institution_type: 'private', enrollment: 23161, acceptance_rate: 7.0, graduation_rate: 95, us_news_rank: 9, athletic_conference: 'Big Ten', visibility_score: 81.9, total_mentions: 1432, sentiment_score: 84.3, known_for: ['Journalism', 'Business', 'Engineering'] },
  { id: '13', name: 'University of Southern California', short_name: 'USC', slug: 'usc', domain: 'usc.edu', logo_url: null, city: 'Los Angeles', state: 'CA', institution_type: 'private', enrollment: 49500, acceptance_rate: 9.2, graduation_rate: 92, us_news_rank: 28, athletic_conference: 'Big Ten', visibility_score: 81.2, total_mentions: 1876, sentiment_score: 79.8, known_for: ['Film', 'Business', 'Football'] },
  { id: '14', name: 'University of Texas at Austin', short_name: 'UT Austin', slug: 'ut-austin', domain: 'utexas.edu', logo_url: null, city: 'Austin', state: 'TX', institution_type: 'public', enrollment: 51991, acceptance_rate: 31.8, graduation_rate: 88, us_news_rank: 32, athletic_conference: 'SEC', visibility_score: 80.5, total_mentions: 1987, sentiment_score: 82.1, known_for: ['Business', 'Engineering', 'Football'] },
  { id: '15', name: 'Ohio State University', short_name: 'Ohio State', slug: 'ohio-state', domain: 'osu.edu', logo_url: null, city: 'Columbus', state: 'OH', institution_type: 'public', enrollment: 61369, acceptance_rate: 53.0, graduation_rate: 88, us_news_rank: 43, athletic_conference: 'Big Ten', visibility_score: 79.8, total_mentions: 1654, sentiment_score: 80.4, known_for: ['Football', 'Engineering', 'Business'] },
  { id: '16', name: 'University of North Carolina at Chapel Hill', short_name: 'UNC', slug: 'unc-chapel-hill', domain: 'unc.edu', logo_url: null, city: 'Chapel Hill', state: 'NC', institution_type: 'public', enrollment: 32385, acceptance_rate: 16.8, graduation_rate: 91, us_news_rank: 22, athletic_conference: 'ACC', visibility_score: 79.2, total_mentions: 1432, sentiment_score: 83.6, known_for: ['Basketball', 'Public Health', 'Business'] },
  { id: '17', name: 'University of Florida', short_name: 'UF', slug: 'uf', domain: 'ufl.edu', logo_url: null, city: 'Gainesville', state: 'FL', institution_type: 'public', enrollment: 61833, acceptance_rate: 23.3, graduation_rate: 90, us_news_rank: 28, athletic_conference: 'SEC', visibility_score: 78.4, total_mentions: 1321, sentiment_score: 81.2, known_for: ['Research', 'Sports', 'Business'] },
  { id: '18', name: 'Georgia Institute of Technology', short_name: 'Georgia Tech', slug: 'georgia-tech', domain: 'gatech.edu', logo_url: null, city: 'Atlanta', state: 'GA', institution_type: 'public', enrollment: 47285, acceptance_rate: 16.9, graduation_rate: 92, us_news_rank: 33, athletic_conference: 'ACC', visibility_score: 77.8, total_mentions: 1543, sentiment_score: 84.9, known_for: ['Engineering', 'Computer Science', 'Research'] },
  { id: '19', name: 'University of California, Los Angeles', short_name: 'UCLA', slug: 'ucla', domain: 'ucla.edu', logo_url: null, city: 'Los Angeles', state: 'CA', institution_type: 'public', enrollment: 46430, acceptance_rate: 8.76, graduation_rate: 92, us_news_rank: 15, athletic_conference: 'Big Ten', visibility_score: 86.3, total_mentions: 2432, sentiment_score: 83.7, known_for: ['Film', 'Medicine', 'Basketball'] },
  { id: '20', name: 'Cornell University', short_name: 'Cornell', slug: 'cornell', domain: 'cornell.edu', logo_url: null, city: 'Ithaca', state: 'NY', institution_type: 'private', enrollment: 25898, acceptance_rate: 7.26, graduation_rate: 95, us_news_rank: 12, athletic_conference: 'Ivy League', visibility_score: 82.7, total_mentions: 1765, sentiment_score: 85.4, known_for: ['Engineering', 'Hotel Management', 'Agriculture'] },
]

interface Props {
  searchParams: { a?: string; b?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  if (!searchParams.a || !searchParams.b) {
    return {
      title: 'Compare Universities - Harbor',
    }
  }

  const uniA = MOCK_UNIVERSITIES.find(u => u.slug === searchParams.a)
  const uniB = MOCK_UNIVERSITIES.find(u => u.slug === searchParams.b)

  if (!uniA || !uniB) {
    return {
      title: 'Compare Universities - Harbor',
    }
  }

  const nameA = uniA.short_name || uniA.name
  const nameB = uniB.short_name || uniB.name

  return {
    title: `${nameA} vs ${nameB} - AI Visibility Comparison - Harbor`,
    description: `Compare how AI models talk about ${nameA} and ${nameB}. Head-to-head visibility scores, rankings, and sentiment analysis.`,
    openGraph: {
      title: `${nameA} vs ${nameB} - AI Visibility Matchup`,
      description: `Which university wins in AI visibility? Compare ${nameA} and ${nameB} head-to-head.`,
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ComparePage({ searchParams }: Props) {
  if (!searchParams.a || !searchParams.b) {
    redirect('/universities')
  }

  const uniA = MOCK_UNIVERSITIES.find(u => u.slug === searchParams.a)
  const uniB = MOCK_UNIVERSITIES.find(u => u.slug === searchParams.b)

  if (!uniA || !uniB) {
    redirect('/universities')
  }

  return <CompareClient universityA={uniA} universityB={uniB} />
}
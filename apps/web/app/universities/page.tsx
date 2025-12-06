// app/universities/page.tsx
import { Metadata } from 'next'
import UniversityIndexClient from './UniversityIndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University AI Rankings - The AI Admissions Office | Harbor',
  description: 'See how AI models rank America\'s top universities. Compare schools, track visibility scores, and understand how ChatGPT and Claude talk about higher education.',
  openGraph: {
    title: 'University AI Rankings - Harbor',
    description: 'See how AI models rank America\'s top universities. Compare schools head-to-head.',
  },
}

export default function UniversitiesPage() {
  return <UniversityIndexClient />
}

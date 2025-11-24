// apps/web/app/about/page.tsx
import { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Harbor - The AI Visibility Standard',
  description: 'Harbor is building the standard for how brands are represented across AI. See your Harbor Score and take control of your AI presence.',
  openGraph: {
    title: 'About Harbor - The AI Visibility Standard',
    description: 'Harbor is building the standard for how brands are represented across AI.',
  },
}

export default function AboutPage() {
  return <AboutClient />
}

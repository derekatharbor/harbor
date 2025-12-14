// Path: apps/web/app/pricing/page.tsx

import { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing - Harbor',
  description: 'Simple, transparent pricing for AI visibility monitoring. Start free with 50 prompts across 4 AI platforms.',
  openGraph: {
    title: 'Pricing - Harbor',
    description: 'Simple, transparent pricing for AI visibility monitoring. Start free with 50 prompts across 4 AI platforms.',
  },
}

export default function PricingPage() {
  return <PricingClient />
}
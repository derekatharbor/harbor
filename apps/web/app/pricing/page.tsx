// apps/web/app/pricing/page.tsx
import { Metadata } from 'next'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing - Harbor',
  description: 'Simple, transparent pricing for AI visibility. Start free, upgrade when you need more.',
  openGraph: {
    title: 'Pricing - Harbor',
    description: 'Simple, transparent pricing for AI visibility. Start free, upgrade when you need more.',
  },
}

export default function PricingPage() {
  return <PricingClient />
}

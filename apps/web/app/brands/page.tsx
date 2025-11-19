// apps/web/app/brands/page.tsx
// Fully dynamic - no build-time data fetching

import HarborIndexClient from './HarborIndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Empty - will fetch on client side or at runtime
export default function BrandsPage() {
  // Pass empty array for now - client will fetch via API
  return <HarborIndexClient brands={[]} />
}
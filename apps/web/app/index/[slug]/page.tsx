// Server component wrapper for /index/[slug] page
// This file should be: apps/web/app/index/[slug]/page.tsx

import BrandProfileClient from './BrandProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function BrandProfilePage({ params }: { params: { slug: string } }) {
  return <BrandProfileClient params={params} />
}
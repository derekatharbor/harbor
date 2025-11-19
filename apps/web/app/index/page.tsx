// Server component wrapper for /index page
// This file should be: apps/web/app/index/page.tsx

import IndexClient from './IndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function IndexPage() {
  return <IndexClient />
}
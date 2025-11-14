// apps/web/app/dashboard/layout.tsx

'use client'

import { BrandProvider } from '@/contexts/BrandContext'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BrandProvider>
      <div className="flex min-h-screen bg-navy">
        <Sidebar />
        <main className="flex-1 ml-60 p-8">
          {children}
        </main>
      </div>
    </BrandProvider>
  )
}
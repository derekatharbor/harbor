import '../styles/globals.css'
import { Metadata } from 'next'

// Force dynamic rendering for all routes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Harbor - AI Visibility Intelligence',
  description: 'See how AI sees your brand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
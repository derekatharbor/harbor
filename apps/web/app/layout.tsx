import '../styles/globals.css'
import { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'

// Force dynamic rendering for all routes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Harbor - AI Visibility Intelligence',
  description: 'See how AI sees your brand',
}

// This enables full-screen content on iOS (extends into notch/Dynamic Island area)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#F6F5F3]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
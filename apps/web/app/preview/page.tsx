// apps/web/app/preview/page.tsx
import FrostedNav from '@/components/landing/FrostedNav'
import NewHeroSection from '@/components/landing/NewHeroSection'
import TheShiftSection from '@/components/landing/TheShiftSection'
import HarborIndexSection from '@/components/landing/HarborIndexSection'
import HowHarborWorksSection from '@/components/landing/HowHarborWorksSection'
import Footer from '@/components/landing/Footer'

export default function PreviewPage() {
  return (
    <div className="relative min-h-screen bg-[#101A31]">
      <FrostedNav />
      
      <main>
        <NewHeroSection />
        <TheShiftSection />
        <HarborIndexSection />
        <HowHarborWorksSection />
        {/* Add more sections here as we build them */}
      </main>
      
      <Footer />
    </div>
  )
}
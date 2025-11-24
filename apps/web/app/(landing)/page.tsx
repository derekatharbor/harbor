import FrostedNav from '@/components/landing/FrostedNav'
import NewHeroSection from '@/components/landing/NewHeroSection'
import TheShiftSection from '@/components/landing/TheShiftSection'
import HarborIndexSection from '@/components/landing/HarborIndexSection'
import HowHarborWorksSection from '@/components/landing/HowHarborWorksSection'
import FinalCTASection from '@/components/landing/FinalCTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#101A31]">
      <FrostedNav />
      
      <main>
        <NewHeroSection />
        <TheShiftSection />
        <HarborIndexSection />
        <HowHarborWorksSection />
        <FinalCTASection />
      </main>
      
      <Footer />
    </div>
  )
}
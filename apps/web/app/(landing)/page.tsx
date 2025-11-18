import FrostedNav from '@/components/landing/FrostedNav'
import WireframeBackground from '@/components/landing/WireframeBackground'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#1A2332] overflow-hidden">
      
      <div className="relative z-10">
        <FrostedNav />
        
        <main>
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <HowItWorksSection />
          <CTASection />
        </main>
        
        <Footer />
      </div>
    </div>
  )
}
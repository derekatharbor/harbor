import Nav from '@/components/landing-new/Nav'
import HeroSection from '@/components/landing-new/HeroSection'
import FeatureCards from '@/components/landing-new/FeatureCards'
import ProductShowcase from '@/components/landing-new/ProductShowcase'
import PromptTrackingSection from '@/components/landing-new/PromptTrackingSection'
import IndexShowcase from '@/components/landing-new/IndexShowcase'
import PromptsMarqueeSection from '@/components/landing-new/PromptsMarqueeSection'
import CTASection from '@/components/landing-new/CTASection'
import Footer from '@/components/landing-new/Footer'

export default function LandingPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      <HeroSection />
      <FeatureCards />
      <ProductShowcase />
      <PromptTrackingSection />
      <IndexShowcase />
      <PromptsMarqueeSection />
      <CTASection />
      <Footer />
    </main>
  )
}
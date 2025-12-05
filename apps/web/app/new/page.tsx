// app/new/page.tsx
import Nav from '@/components/landing-new/Nav'
import HeroSection from '@/components/landing-new/HeroSection'
import LogoBar from '@/components/landing-new/LogoBar'
import FeatureCards from '@/components/landing-new/FeatureCards'
import ProductShowcase from '@/components/landing-new/ProductShowcase'
import CTASection from '@/components/landing-new/CTASection'
import Footer from '@/components/landing-new/Footer'

export default function NewLandingPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      <HeroSection />
      <LogoBar />
      <FeatureCards />
      <ProductShowcase />
      <CTASection />
      <Footer />
    </main>
  )
}
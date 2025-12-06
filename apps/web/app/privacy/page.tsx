// app/privacy/page.tsx
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

export const metadata = {
  title: 'Privacy Policy | Harbor',
  description: 'Harbor privacy policy - how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      
      <div className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          
          <p className="text-white/40 mb-12">
            Last updated: December 2024
          </p>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Harbor collects information you provide directly to us, including:
              </p>
              <ul className="text-white/60 space-y-2 list-disc list-inside ml-4">
                <li>Account information (email, name, company)</li>
                <li>Brand and website data you submit for analysis</li>
                <li>Usage data and analytics</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="text-white/60 space-y-2 list-disc list-inside ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Analyze how AI models perceive your brand</li>
                <li>Send you updates and marketing communications (with your consent)</li>
                <li>Respond to your requests and support needs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Data Security</h2>
              <p className="text-white/60 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your 
                personal data against unauthorized access, alteration, disclosure, or destruction. 
                Your data is encrypted in transit and at rest.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Data Retention</h2>
              <p className="text-white/60 leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide 
                services. You can request deletion of your data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="text-white/60 space-y-2 list-disc list-inside ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Cookies</h2>
              <p className="text-white/60 leading-relaxed">
                We use essential cookies to maintain your session and preferences. We do not use 
                third-party tracking cookies without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Third-Party Services</h2>
              <p className="text-white/60 leading-relaxed">
                We use trusted third-party services for authentication (Supabase), payments (Stripe), 
                and analytics. These services have their own privacy policies and handle data in 
                accordance with their terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Contact Us</h2>
              <p className="text-white/60 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:hello@useharbor.io" className="text-white hover:underline">
                  hello@useharbor.io
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

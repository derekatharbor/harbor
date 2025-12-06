// app/terms/page.tsx
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

export const metadata = {
  title: 'Terms of Service | Harbor',
  description: 'Harbor terms of service - the rules and guidelines for using our platform.',
}

export default function TermsPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      
      <div className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          
          <p className="text-white/40 mb-12">
            Last updated: December 2024
          </p>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-white/60 leading-relaxed">
                By accessing or using Harbor ("Service"), you agree to be bound by these Terms of 
                Service. If you do not agree to these terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-white/60 leading-relaxed">
                Harbor provides AI visibility intelligence tools that help brands understand how they 
                appear in AI-generated responses. This includes analytics, monitoring, and optimization 
                recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Account Registration</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="text-white/60 space-y-2 list-disc list-inside ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="text-white/60 space-y-2 list-disc list-inside ml-4">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Intellectual Property</h2>
              <p className="text-white/60 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Harbor 
                and are protected by international copyright, trademark, patent, trade secret, and 
                other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Payment Terms</h2>
              <p className="text-white/60 leading-relaxed">
                Paid subscriptions are billed in advance on a monthly or annual basis. Refunds are 
                provided at our discretion. You may cancel your subscription at any time, and access 
                will continue until the end of the billing period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Data and Privacy</h2>
              <p className="text-white/60 leading-relaxed">
                Your use of the Service is also governed by our{' '}
                <a href="/privacy" className="text-white hover:underline">Privacy Policy</a>. 
                By using the Service, you consent to the collection and use of information as 
                described in that policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-white/60 leading-relaxed">
                The Service is provided "as is" without warranties of any kind. We do not guarantee 
                that the Service will be uninterrupted, secure, or error-free. AI visibility data 
                is provided for informational purposes and should not be the sole basis for 
                business decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-white/60 leading-relaxed">
                Harbor shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use of the Service. Our total liability shall 
                not exceed the amount paid by you in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Termination</h2>
              <p className="text-white/60 leading-relaxed">
                We may terminate or suspend your account at any time for violations of these terms. 
                Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p className="text-white/60 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of 
                material changes via email or through the Service. Continued use after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Governing Law</h2>
              <p className="text-white/60 leading-relaxed">
                These terms shall be governed by the laws of the State of Delaware, without regard 
                to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Contact</h2>
              <p className="text-white/60 leading-relaxed">
                Questions about these Terms should be sent to{' '}
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

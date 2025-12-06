// components/landing-new/Footer.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  const links = {
    Product: ['Features', 'Pricing', 'Directory', 'API'],
    Resources: ['Documentation', 'Blog', 'Changelog', 'Status'],
    Company: ['About', 'Careers', 'Contact', 'Legal'],
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/harbor-logo-white.svg"
                alt="Harbor"
                width={120}
                height={32}
                className="h-7 w-auto"
              />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              AI visibility intelligence for modern brands.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/10">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-white/30 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-white/30 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
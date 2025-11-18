import { Linkedin } from 'lucide-react'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="relative bg-[#1A2332] border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image 
                src="/logo-icon.png" 
                alt="Harbor" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-white font-heading">Harbor</span>
            </div>
            <p className="text-[#A4B1C3] text-sm leading-relaxed">
              The first platform for AI search visibility. 
              See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#how-it-works" 
                  className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#early-access" 
                  className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                >
                  Request Access
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4">Company</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <a 
                  href="/about" 
                  className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="/blog" 
                  className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <a
                href="https://linkedin.com/company/harbor"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[#A4B1C3] hover:text-white transition-colors" />
              </a>
              <a
                href="https://x.com/harbor"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="X"
              >
                <svg 
                  className="w-5 h-5 text-[#A4B1C3] hover:text-white transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#A4B1C3]">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </div>

          <div className="flex items-center space-x-6 text-sm text-[#A4B1C3]">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
import { Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg" />
              <span className="text-xl font-bold text-white font-display">Harbor</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              The first platform for AI search visibility. 
              See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#how-it-works" 
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#early-access" 
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Request Access
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4">Company</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <a 
                  href="/about" 
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="/blog" 
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-white/60 hover:text-white transition-colors text-sm"
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
                <Linkedin className="w-5 h-5 text-white/75 hover:text-white transition-colors" />
              </a>
              <a
                href="https://x.com/harbor"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5 text-white/75 hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </div>

          <div className="flex items-center space-x-6 text-sm text-white/50">
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

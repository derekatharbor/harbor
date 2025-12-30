// app/not-found.tsx

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      {/* 404 Illustration */}
      <img 
        src="/images/404-illustration.png" 
        alt="404" 
        className="w-full max-w-[600px] h-auto mb-8"
      />
      
      {/* Message */}
      <p className="text-white/60 text-lg font-source-code mb-8">
        Even AI can't find this page
      </p>
      
      {/* Return Home Button */}
      <Link
        href="/"
        className="h-12 px-8 rounded-[10px] bg-white text-black text-[15px] font-semibold font-source-sans flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        Return home
      </Link>
    </div>
  )
}

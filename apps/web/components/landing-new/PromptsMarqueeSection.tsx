// components/landing-new/PromptsMarqueeSection.tsx
'use client'

// AI Model logos via Brandfetch
const AI_MODELS = [
  { name: 'ChatGPT', logo: 'https://cdn.brandfetch.io/openai.com?c=1id1Fyz-h7an5-5KR_y' },
  { name: 'Claude', logo: 'https://cdn.brandfetch.io/anthropic.com?c=1id1Fyz-h7an5-5KR_y' },
  { name: 'Gemini', logo: 'https://cdn.brandfetch.io/google.com?c=1id1Fyz-h7an5-5KR_y' },
  { name: 'Perplexity', logo: 'https://cdn.brandfetch.io/perplexity.ai?c=1id1Fyz-h7an5-5KR_y' },
]

// Prompt data for each row
const PROMPT_ROWS = [
  [
    { model: 0, text: 'How does HubSpot usability differ on desktop versus mobile?' },
    { model: 1, text: 'How easy is it to set up a CRM for the first time?' },
    { model: 3, text: 'What training or tutorials are included with Attio?' },
    { model: 2, text: 'How do CRMs handle multi-currency transactions?' },
    { model: 0, text: 'What reporting dashboards come built-in?' },
    { model: 1, text: 'Which CRM has the best mobile app experience?' },
  ],
  [
    { model: 2, text: 'Best CRM for sales pipeline tracking?' },
    { model: 0, text: 'What core features should a CRM include?' },
    { model: 1, text: 'How do CRMs handle customer service or support workflows?' },
    { model: 3, text: 'What integrations are available with popular tools?' },
    { model: 2, text: 'Which CRM offers the best automation features?' },
    { model: 0, text: 'How does Salesforce compare to HubSpot?' },
  ],
  [
    { model: 3, text: 'Do CRMs provide API access for custom integrations?' },
    { model: 1, text: 'How easy is CRM data migration from another system?' },
    { model: 0, text: 'What security certifications do CRMs typically have?' },
    { model: 2, text: 'How do CRMs handle GDPR compliance?' },
    { model: 3, text: 'What is the best CRM for startups?' },
    { model: 1, text: 'Which CRM has the best lead scoring?' },
  ],
]

function PromptPill({ model, text }: { model: number; text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] backdrop-blur-sm rounded-full border border-white/[0.08] whitespace-nowrap">
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img
          src={AI_MODELS[model].logo}
          alt={AI_MODELS[model].name}
          className="w-5 h-5 object-contain"
        />
      </div>
      <span className="text-white/70 text-sm">{text}</span>
    </div>
  )
}

function MarqueeRow({ prompts, direction = 'left', speed = 30 }: { 
  prompts: typeof PROMPT_ROWS[0]
  direction?: 'left' | 'right'
  speed?: number 
}) {
  // Double the prompts for seamless loop
  const doubledPrompts = [...prompts, ...prompts]
  
  return (
    <div className="relative overflow-hidden py-2">
      <div 
        className={`flex gap-4 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ 
          animationDuration: `${speed}s`,
        }}
      >
        {doubledPrompts.map((prompt, idx) => (
          <PromptPill key={idx} model={prompt.model} text={prompt.text} />
        ))}
      </div>
    </div>
  )
}

export default function PromptsMarqueeSection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Headline */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Every day, millions ask AI for recommendations.{' '}
          <span className="text-white/50">Make sure they hear about you.</span>
        </h2>
      </div>

      {/* Marquee rows */}
      <div className="relative">
        {/* Left fade */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #0a0a0a 0%, transparent 100%)'
          }}
        />
        
        {/* Right fade */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, #0a0a0a 0%, transparent 100%)'
          }}
        />

        {/* Rows with alternating directions */}
        <div className="space-y-3">
          <MarqueeRow prompts={PROMPT_ROWS[0]} direction="left" speed={35} />
          <MarqueeRow prompts={PROMPT_ROWS[1]} direction="right" speed={40} />
          <MarqueeRow prompts={PROMPT_ROWS[2]} direction="left" speed={32} />
        </div>
      </div>

      {/* CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes marquee-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        :global(.animate-marquee-left) {
          animation: marquee-left linear infinite;
        }
        
        :global(.animate-marquee-right) {
          animation: marquee-right linear infinite;
        }
      `}</style>
    </section>
  )
}
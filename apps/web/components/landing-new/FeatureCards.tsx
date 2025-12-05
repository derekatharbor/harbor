// components/landing-new/FeatureCards.tsx
import { Eye, Target, Zap } from 'lucide-react'

export default function FeatureCards() {
  const features = [
    {
      icon: Eye,
      title: 'Real-time Visibility',
      description: 'Track how often AI models mention your brand across ChatGPT, Claude, Gemini, and Perplexity.',
      visual: (
        <div className="flex items-end gap-2 h-32">
          {[30, 45, 60, 75, 85].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500/30 to-cyan-400/60" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
    {
      icon: Target,
      title: 'Competitor Intelligence',
      description: 'See how you stack up against competitors. Identify gaps and opportunities in AI recommendations.',
      visual: (
        <div className="space-y-2">
          {['Your Brand', 'Competitor A', 'Competitor B'].map((name, i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-white/40 text-xs w-24 truncate">{name}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${i === 0 ? 'bg-cyan-400' : 'bg-white/20'}`}
                  style={{ width: `${85 - i * 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      icon: Zap,
      title: 'Actionable Insights',
      description: 'Get specific recommendations to improve your AI visibility with schema markup and content optimization.',
      visual: (
        <div className="space-y-2">
          {[
            { task: 'Add Organization schema', status: 'done' },
            { task: 'Optimize product pages', status: 'pending' },
            { task: 'Update meta descriptions', status: 'pending' },
          ].map((item) => (
            <div key={item.task} className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                item.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'
              }`}>
                {item.status === 'done' ? '✓' : '○'}
              </div>
              <span className={item.status === 'done' ? 'text-white/60 line-through' : 'text-white/60'}>
                {item.task}
              </span>
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for the AI search era
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Everything you need to monitor and optimize your brand's presence in AI-powered search.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="group relative bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
            >
              {/* Glassmorphism glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-cyan-400" />
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                
                {/* Description */}
                <p className="text-white/50 text-sm mb-6 leading-relaxed">{feature.description}</p>

                {/* Visual */}
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  {feature.visual}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

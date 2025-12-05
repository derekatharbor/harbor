// components/landing-new/LogoBar.tsx

export default function LogoBar() {
  const brands = [
    'HubSpot', 'Ramp', 'Notion', 'Figma', 'Linear', 'Vercel', 
    'Stripe', 'Shopify', 'Slack', 'Zoom', 'Asana', 'Monday'
  ]

  return (
    <section className="relative py-16 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-white/30 text-sm font-medium mb-8 uppercase tracking-wider">
          Tracking visibility for leading brands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((brand) => (
            <span key={brand} className="text-white/20 hover:text-white/40 text-lg font-semibold transition-colors cursor-default">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

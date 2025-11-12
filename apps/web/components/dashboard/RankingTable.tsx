import { TrendingUp, TrendingDown } from 'lucide-react'

interface RankingItem {
  rank: number
  name: string
  logo?: string
  score: number
  delta: number
}

interface RankingTableProps {
  data: RankingItem[]
  title?: string
}

export function RankingTable({ data, title = 'Brand Industry Ranking' }: RankingTableProps) {
  return (
    <div className="harbor-card">
      <h3 className="text-sm font-body text-softgray opacity-75 uppercase tracking-wide mb-6">
        {title}
      </h3>

      <div className="space-y-4">
        {data.map((item) => (
          <div 
            key={item.rank}
            className="flex items-center justify-between py-3 border-b border-harbor last:border-0"
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-softgray opacity-60 font-body text-sm w-6">
                {item.rank}
              </span>
              
              {item.logo && (
                <div className="w-6 h-6 rounded bg-navy-lighter flex items-center justify-center text-xs font-heading">
                  {item.logo}
                </div>
              )}
              
              <span className="text-white font-body text-sm">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {item.delta !== 0 && (
                <div className={`flex items-center gap-1 ${item.delta > 0 ? 'text-cerulean' : 'text-coral'}`}>
                  {item.delta > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-xs font-body font-medium">
                    {item.delta > 0 ? '+' : ''}{item.delta}%
                  </span>
                </div>
              )}
              
              <span className="text-white font-heading font-semibold text-sm w-16 text-right">
                {item.score}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

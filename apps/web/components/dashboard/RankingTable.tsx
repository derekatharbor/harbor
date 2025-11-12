import { TrendingUp, TrendingDown } from 'lucide-react'

interface RankingItem {
  rank: number
  name: string
  logo?: string
  score: number
  delta: number
  isCurrentUser?: boolean
}

interface RankingTableProps {
  data: RankingItem[]
  title?: string
}

export function RankingTable({ data, title = 'Brand Industry Ranking' }: RankingTableProps) {
  const maxScore = Math.max(...data.map(item => item.score))

  return (
    <div className="harbor-card">
      <h3 className="text-sm font-body text-softgray opacity-75 uppercase tracking-wide mb-6">
        {title}
      </h3>

      <div className="space-y-4">
        {data.map((item) => (
          <div 
            key={item.rank}
            className={`
              relative py-3 border-b border-harbor last:border-0 
              transition-all duration-200 hover:translate-x-1
              ${item.isCurrentUser ? 'ring-1 ring-coral rounded-lg px-2 -mx-2' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-softgray opacity-60 font-body text-sm w-6">
                  {item.rank}
                </span>
                
                {item.logo && (
                  <div className={`
                    w-6 h-6 rounded bg-navy-lighter flex items-center justify-center text-xs font-heading
                    ${item.isCurrentUser ? 'ring-2 ring-coral' : ''}
                  `}>
                    {item.logo}
                  </div>
                )}
                
                <span className={`
                  font-body text-sm flex-1
                  ${item.isCurrentUser ? 'text-white font-semibold' : 'text-white'}
                `}>
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {item.delta !== 0 && (
                  <div className={`flex items-center gap-1 ${item.delta > 0 ? 'text-sm' : 'text-coral'}`} style={{ color: item.delta > 0 ? '#4DA3FF' : undefined }}>
                    {item.delta > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-body font-medium">
                      {item.delta > 0 ? '+' : ''}{item.delta}%
                    </span>
                  </div>
                )}
                
                <span className={`
                  font-heading font-semibold text-sm w-16 text-right
                  ${item.isCurrentUser ? 'text-coral' : 'text-white'}
                `}>
                  {item.score}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="ml-10 h-1 bg-navy-lighter rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  item.isCurrentUser ? 'bg-coral' : 'bg-cerulean'
                }`}
                style={{ width: `${(item.score / maxScore) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
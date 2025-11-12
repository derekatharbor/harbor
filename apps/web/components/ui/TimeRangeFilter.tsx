'use client'

import { useState } from 'react'

const timeRanges = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom range', value: 'custom' },
]

interface TimeRangeFilterProps {
  onChange?: (range: string) => void
}

export function TimeRangeFilter({ onChange }: TimeRangeFilterProps) {
  const [selected, setSelected] = useState('7d')

  const handleChange = (value: string) => {
    setSelected(value)
    onChange?.(value)
  }

  return (
    <div className="flex items-center gap-2">
      {timeRanges.map((range) => (
        <button
          key={range.value}
          onClick={() => handleChange(range.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 cursor-pointer
            ${selected === range.value
              ? 'bg-cerulean text-white shadow-lg'
              : 'bg-navy-light text-softgray hover:bg-navy-lighter hover:text-white'
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
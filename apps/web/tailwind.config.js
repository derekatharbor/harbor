/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        navy: {
          DEFAULT: '#0B1521',
          light: '#1A1F26',
          lighter: '#242B33',
        },
        // Keep teal for backwards compat, but we're moving away from it
        teal: {
          DEFAULT: '#10B981',
        },
        // Semantic colors
        positive: '#22C55E',
        negative: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        // Chart colors
        chart: {
          1: '#3B82F6',
          2: '#10B981',
          3: '#F59E0B',
          4: '#EC4899',
          5: '#8B5CF6',
        },
        // Legacy colors for backwards compat
        coral: '#EF4444', // Mapped to negative
        cerulean: '#3B82F6',
        softgray: '#9CA3AF',
        cyan: '#06B6D4',
        'harbor-navy': '#0B1521',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        card: '8px',
        'card-lg': '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-dark-hover': '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
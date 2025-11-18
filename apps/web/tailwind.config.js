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
        navy: {
          DEFAULT: '#0B1521',
          light: '#101C2C',
          lighter: '#183B64',
        },
        teal: {
          DEFAULT: '#00C6B7',
        },
        cyan: {
          DEFAULT: '#4EE4FF',
        },
        cerulean: {
          DEFAULT: '#2979FF',
        },
        softgray: {
          DEFAULT: '#A9B4C5',
        },
        coral: '#FF6B4A',
        // Landing page specific
        'harbor-navy': '#0A1628',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        'card-lg': '10px',
      },
      boxShadow: {
        card: '0px 4px 16px rgba(0,0,0,0.25)',
        'teal-glow': '0 4px 10px rgba(0,198,183,0.08)',
      },
      // ADD THIS - Enable cursor utilities
      cursor: {
        pointer: 'pointer',
        default: 'default',
        'not-allowed': 'not-allowed',
      },
    },
  },
  plugins: [],
}
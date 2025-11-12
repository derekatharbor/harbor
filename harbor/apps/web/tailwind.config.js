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
          DEFAULT: '#101A31',
          light: '#141E38',
          lighter: '#16203B',
        },
        coral: {
          DEFAULT: '#FF6B4A',
        },
        cerulean: {
          DEFAULT: '#2979FF',
        },
        softgray: {
          DEFAULT: '#F4F6F8',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Source Code Pro', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        'card-lg': '12px',
      },
      boxShadow: {
        card: '0px 4px 16px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}

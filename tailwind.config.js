/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E7FD1',
          navy: '#0B1220',
          cardDark: '#111C30',
          orange: '#F5871F',
          green: '#1E9E5A',
          red: '#D93B3B',
          bgLight: '#F7F9FC',
          slate: '#64748B',
          dark: '#1A202C'
        }
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(30, 127, 209, 0.35)',
        'glow-orange': '0 0 25px -5px rgba(245, 135, 31, 0.35)',
        'card-soft': '0 10px 30px -5px rgba(11, 18, 32, 0.06)'
      }
    },
  },
  plugins: [],
}

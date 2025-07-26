/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        bakery: {
          cream: '#fef7ed',
          peach: '#fed7aa',
          brown: '#92400e',
          chocolate: '#451a03',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'display': ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/hero-bg.jpg')",
        'bakery-texture': "url('/bakery-texture.jpg')",
      }
    },
  },
  plugins: [],
}

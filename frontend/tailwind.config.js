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
          50: '#faf6f0',
          100: '#f4eae1',
          200: '#e8d5c4',
          300: '#d9b89f',
          400: '#c59473',
          500: '#ab734f',
          600: '#8f5538',
          700: '#703c24',
          800: '#452312',
          900: '#1d0e06',
        },
        navy: {
          50: '#fdfbfa',
          100: '#f7f4f2',
          200: '#ebdcd3',
          300: '#dfc0af',
          400: '#c38b6d',
          500: '#a36342',
          600: '#834b2f',
          750: '#5c2d1b',
          800: '#381609',
          900: '#1d0c04',
          950: '#0e0501',
        },
        success: '#c2410c', // Warm Terracotta / Burnt Orange
        warning: '#d97706',
        danger: '#be123c',
        info: '#8f5538',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

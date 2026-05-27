/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          500: '#06b6d4',
          600: '#0891b2',
        },
        page: {
          DEFAULT: '#f4f6fb',
          subtle: '#eef2ff',
        },
      },
      borderRadius: {
        card: '0.875rem',
        panel: '1rem',
      },
      boxShadow: {
        soft: '0 8px 24px -12px rgba(15, 23, 42, 0.18)',
        ring: '0 0 0 3px rgba(79, 70, 229, 0.18)',
      },
    },
  },
  plugins: [
    typography,
  ],
}
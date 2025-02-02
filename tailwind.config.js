/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'solo-purple': '#7442d6',
        'solo-purple-light': '#9b75ff',
        'bg-primary': '#1e2638',
        'bg-card': '#4A5D79',
        'bg-kpi-card': '#2A3A54',
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255, 255, 255, 0.6)',
        'text-muted': '#CBD5E1',
        'border-default': 'rgba(255, 255, 255, 0.1)',
        'border-active': 'rgba(255, 255, 255, 0.2)',
      },
      fontFamily: {
        'lexend': ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
      spacing: {
        'navbar': 'var(--navbar-height)',
      },
      borderRadius: {
        'card': '8px',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },
    },
    fontFamily: {
      sans: ['Lexend', 'sans-serif'],
    },
  },
  plugins: [],
}
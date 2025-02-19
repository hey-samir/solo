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
        'bg-kpi': '#434D68',
        'bg-kpi-card': '#434D68',
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255, 255, 255, 0.6)',
        'text-muted': '#CBD5E1',
        'border-default': 'rgba(255, 255, 255, 0.1)',
        'border-active': 'rgba(255, 255, 255, 0.2)',
      },
      maxWidth: {
        'app': '430px', // Updated to match iPhone 14 Pro Max width
      },
      width: {
        'app': '430px',
      },
      fontFamily: {
        'lexend': ['Lexend', 'sans-serif'],
      },
      fontSize: {
        // Mobile-first font sizes
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      },
      screens: {
        'xs': '320px',  // Small phones
        'sm': '375px',  // Medium phones
        'md': '430px',  // Large phones (iPhone 14 Pro Max)
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
    },
    fontFamily: {
      sans: ['Lexend', 'sans-serif'],
    },
  },
  plugins: [],
}
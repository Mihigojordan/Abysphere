/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware primary colors using CSS variables
        primary: {
          50: 'var(--color-primary-50, #eff6ff)',
          100: 'var(--color-primary-100, #dbeafe)',
          200: 'var(--color-primary-200, #bfdbfe)',
          300: 'var(--color-primary-300, #93c5fd)',
          400: 'var(--color-primary-400, #60a5fa)',
          500: 'var(--color-primary-500, #3b82f6)',
          600: 'var(--color-primary-600, #2563eb)',
          700: 'var(--color-primary-700, #1d4ed8)',
          800: 'var(--color-primary-800, #1e40af)',
          900: 'var(--color-primary-900, #1e3a8a)',
          950: 'var(--color-primary-950, #172554)',
        },
        // Theme-aware secondary colors using CSS variables
        secondary: {
          50: 'var(--color-secondary-50, #fff9eb)',
          100: 'var(--color-secondary-100, #fff2cf)',
          200: 'var(--color-secondary-200, #ffe19c)',
          300: 'var(--color-secondary-300, #f9d67b)',
          400: 'var(--color-secondary-400, #eec25b)',
          500: 'var(--color-secondary-500, #daa13c)',
          600: 'var(--color-secondary-600, #b7812d)',
          700: 'var(--color-secondary-700, #946221)',
          800: 'var(--color-secondary-800, #704717)',
          900: 'var(--color-secondary-900, #4a2f0e)',
          950: 'var(--color-secondary-950, #261706)',
        },
        // Theme-aware background colors
        'theme-bg': {
          primary: 'var(--color-bg-primary, #ffffff)',
          secondary: 'var(--color-bg-secondary, #f8fafc)',
          tertiary: 'var(--color-bg-tertiary, #f1f5f9)',
        },
        // Theme-aware text colors
        'theme-text': {
          primary: 'var(--color-text-primary, #1e293b)',
          secondary: 'var(--color-text-secondary, #64748b)',
        },
        // Theme-aware border color
        'theme-border': 'var(--color-border, #e2e8f0)',
        // Sidebar specific
        'sidebar-bg': 'var(--color-sidebar-bg, #ffffff)',
        'sidebar-text': 'var(--color-sidebar-text, #1e293b)',
        // Header specific
        'header-bg': 'var(--color-header-bg, #ffffff)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-lg': '0 0 40px rgba(239, 68, 68, 0.4)',
      }
    },
  },
  plugins: [],
}

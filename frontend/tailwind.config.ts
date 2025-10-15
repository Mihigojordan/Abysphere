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
primary: {
  50:  '#e6f8f6',  // very light teal
  100: '#c2ede8',  // lighter tint
  200: '#8edcd3',  // light
  300: '#5bcbbc',  // mid-light
  400: '#31b2a1',  // light-medium
  500: '#0f766e',  // base color
  600: '#0d6861',  // slightly darker
  700: '#0b5953',  // medium-dark
  800: '#094a45',  // dark
  900: '#06332f',  // very dark
  950: '#031d1b',  // deepest shade
},
secondary: {
  50:  '#fff9eb',  // very light cream
  100: '#fff2cf',  // light pastel yellow
  200: '#ffe19c',  // soft yellow
  300: '#f9d67b',  // base color
  400: '#eec25b',  // warm gold
  500: '#daa13c',  // golden brown
  600: '#b7812d',  // medium-dark amber
  700: '#946221',  // deep golden-brown
  800: '#704717',  // darker accent
  900: '#4a2f0e',  // very dark golden brown
  950: '#261706',  // deepest shade
},


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

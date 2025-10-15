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
  50:  '#e6f9f7',
  100: '#bff0ea',
  200: '#80e0d3',
  300: '#4dd1bf',
  400: '#1ac2aa',
  500: '#00b39a', // main secondary
  600: '#009c86',
  700: '#008673',
  800: '#006f60',
  900: '#004b3f',
  950: '#002620',
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

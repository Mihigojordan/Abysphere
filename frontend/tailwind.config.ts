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
  50:  '#e9f5fb',  // very light blue
  100: '#cfeaf7',  // lighter tint
  200: '#a5d5ee',  // light
  300: '#7abfe5',  // mid-light
  400: '#52a8d7',  // light-medium
  500: '#388fba',  // base color
  600: '#2f7ca3',  // slightly darker
  700: '#256789',  // medium-dark
  800: '#1c526e',  // dark
  900: '#143a4d',  // very dark
  950: '#0b212e',  // deepest shade
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

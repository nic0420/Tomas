/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#2c3726', // Dark olive camo green
          gold: '#c29b62', // Tan/Gold from the rifles
          chrome: '#f0f0f0', // Silver/Chrome accent
          dark: '#161a14', // Very dark green/black
          light: '#f4f5f3', // Off-white with green tint
        }
      }
    },
  },
  plugins: [],
}

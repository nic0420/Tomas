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
          blue: '#005699', // Classic retail blue
          dark: '#1a1a1a',
          orange: '#ff6b00', // Accent orange
          light: '#f5f5f5',
        }
      }
    },
  },
  plugins: [],
}

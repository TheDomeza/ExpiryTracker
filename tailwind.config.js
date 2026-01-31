/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#1f5f3e',
        'card-red': '#ffadad',
        'card-yellow': '#fff59d',
        'card-green': '#a5d6a7',
      }
    },
  },
  plugins: [],
}
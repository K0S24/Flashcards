/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1a1a1a',
          secondary: '#242424',
          card: '#2a2a2a',
          hover: '#333333',
          border: '#3a3a3a',
        }
      }
    },
  },
  plugins: [],
}
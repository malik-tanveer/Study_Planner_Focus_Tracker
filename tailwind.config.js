/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors for light mode
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          'text-secondary': '#64748b',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',      // Slate 900 primary button / dark accent
          light: '#F8FAFC',     // Slate 50 wireframe light background
          border: '#E2E8F0',    // Slate 200 clean borders
          accent: '#2563EB',    // Royal Blue secondary accent
          emerald: '#10B981',   // Success
          amber: '#F59E0B',     // Warning / Stars
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NEXORA Color System - Premium, Trustworthy, Clean, Modern
        brand: {
          // Primary Brand Color (Blue)
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          'primary-active': '#1E40AF',
          
          // Neutral Colors
          background: '#FAFAFA',
          surface: '#FFFFFF',
          text: '#171717',
          'text-secondary': '#6B7280',
          'text-disabled': '#9CA3AF',
          border: '#E5E7EB',
          
          // Semantic Colors
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          
          // For backward compatibility (admin layout still uses these)
          slate: '#6B7280',
          blue: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(15, 23, 42, 0.12)',
        card: '0 1px 0 rgba(15, 23, 42, 0.04), 0 10px 20px -18px rgba(15, 23, 42, 0.18)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}

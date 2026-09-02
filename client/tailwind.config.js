/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#111827',
          'primary-hover': '#1F2937',
          'primary-active': '#030712',
          accent: '#2563EB',
          'accent-hover': '#1D4ED8',
          'accent-light': '#EFF6FF',
          background: '#F9FAFB',
          surface: '#FFFFFF',
          text: '#0F172A',
          'text-secondary': '#64748B',
          'text-muted': '#94A3B8',
          border: '#E2E8F0',
          'border-light': '#F1F5F9',
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
          slate: '#6B7280',
          blue: '#2563EB',
        },
        ink: {
          900: '#0F172A',
          700: '#334155',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Inter', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.04)',
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        elevated: '0 8px 32px -8px rgba(15, 23, 42, 0.12), 0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        subtle: '0 1px 2px rgba(15, 23, 42, 0.05)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      keyframes: {
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#dde1e9',
          300: '#c3c9d6',
          400: '#9aa3b5',
          500: '#717c93',
          600: '#535d75',
          700: '#3d445a',
          800: '#262b3d',
          900: '#161a28',
          950: '#0a0c14',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(10 12 20 / 0.04), 0 2px 8px -2px rgb(10 12 20 / 0.06)',
        card: '0 1px 3px 0 rgb(10 12 20 / 0.06), 0 8px 24px -8px rgb(10 12 20 / 0.08)',
        lift: '0 4px 12px -2px rgb(10 12 20 / 0.08), 0 16px 40px -12px rgb(10 12 20 / 0.12)',
        glow: '0 0 0 1px rgb(20 184 166 / 0.1), 0 8px 24px -8px rgb(20 184 166 / 0.25)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgb(10 12 20 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(10 12 20 / 0.04) 1px, transparent 1px)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pulse-ring': { '0%': { transform: 'scale(0.95)', opacity: '0.8' }, '70%': { transform: 'scale(1.4)', opacity: '0' }, '100%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
};

export default config;

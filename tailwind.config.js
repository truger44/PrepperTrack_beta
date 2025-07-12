/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom dark mode colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      spacing: {
        // Custom spacing for density
        'density-xs': 'var(--spacing-xs)',
        'density-sm': 'var(--spacing-sm)',
        'density-md': 'var(--spacing-md)',
        'density-lg': 'var(--spacing-lg)',
        'density-xl': 'var(--spacing-xl)',
        'density-2xl': 'var(--spacing-2xl)',
        'density-3xl': 'var(--spacing-3xl)',
      },
      fontSize: {
        // Custom font sizes for density
        'density-xs': 'var(--text-xs)',
        'density-sm': 'var(--text-sm)',
        'density-base': 'var(--text-base)',
        'density-lg': 'var(--text-lg)',
        'density-xl': 'var(--text-xl)',
        'density-2xl': 'var(--text-2xl)',
        'density-3xl': 'var(--text-3xl)',
      }
    },
  },
  plugins: [],
};
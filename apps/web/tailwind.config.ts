import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sanchay: {
          navy: {
            50: '#F0F5FA',
            100: '#D9E6F2',
            500: '#1E568A',
            700: '#0F365C',
            900: '#0A2540',
          },
          gold: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#D97706',
            600: '#B45309',
            700: '#92400E',
          },
          emerald: {
            50: '#ECFDF5',
            500: '#10B981',
            700: '#047857',
          },
          slate: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

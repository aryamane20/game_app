/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF9',
        primary: '#EF4444',
        'text-primary': '#1C1917',
        'text-muted': '#78716C',
        'crossing-highlight': '#FBBF24',
      },
      fontFamily: {
        nunito: ['Nunito_400Regular'],
        'nunito-bold': ['Nunito_700Bold'],
        'nunito-semibold': ['Nunito_600SemiBold'],
      },
    },
  },
  plugins: [],
};

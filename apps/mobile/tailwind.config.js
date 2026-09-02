/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121217',
        'surface-elevated': '#18181f',
        'surface-highlight': '#22222b',
        border: '#27272a',
        'border-focus': '#3f3f46',
        primary: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#34d399',
          muted: 'rgba(16, 185, 129, 0.15)',
        },
        accent: {
          lime: '#84cc16',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          rose: '#f43f5e',
        },
        muted: {
          DEFAULT: '#71717a',
          foreground: '#a1a1aa',
        }
      },
    },
  },
  plugins: [],
};

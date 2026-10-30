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
        navy: {
          950: '#070C18',
          900: '#0B132B',
          800: '#152238',
          700: '#1C2541',
          600: '#2A3B5C',
          500: '#3A506B',
        },
        cyber: {
          blue: '#00B4D8',
          cyan: '#5BC0BE',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          muted: '#8D99AE'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}

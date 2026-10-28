/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        smart: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9ddfd',
          300: '#7cc2fb',
          400: '#36a2f7',
          500: '#0c84e8',
          600: '#0166c6',
          700: '#0252a1',
          800: '#064585',
          900: '#0b3b6e',
          950: '#072549',
        },
        hazard: {
          high: '#ef4444',
          medium: '#f97316',
          low: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px -5px rgba(12, 132, 232, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)'
      }
    },
  },
  plugins: [],
}

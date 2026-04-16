/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        felt: '0 18px 45px rgba(8, 23, 19, 0.28)',
      },
      colors: {
        felt: {
          950: '#081713',
          900: '#0f241e',
          800: '#17362c',
          700: '#23513f',
          200: '#cae7d5',
        },
        brass: {
          500: '#c89a4b',
          300: '#e1c48d',
        },
        ivory: {
          50: '#f8f4eb',
          100: '#efe6d2',
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#5dcafc',
          secondary: '#cd51d6',
          accent: '#d1e539',
          neutral: '#1f252e',
          'base-100': '#414858',
          info: '#7894f7',
          success: '#21ca6a',
          warning: '#8b510e',
          error: '#e95444',
        },
      },
    ],
  },
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};

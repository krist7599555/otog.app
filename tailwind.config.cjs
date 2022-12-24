/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{svelte,ts,html}'],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#fecc76',
          DEFAULT: '#ff851d'
        }
      }
    }
  },
  plugins: []
};

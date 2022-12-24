/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{svelte,ts,html}'],
  theme: {
    screens: {
      'sm': '640px', // => @media (min-width: 640px) { ... }
      'md': '768px', // => @media (min-width: 768px) { ... }
      // 'lg': '1024px', // => @media (min-width: 1024px) { ... }
      // 'xl': '1280px', // => @media (min-width: 1280px) { ... }
      // '2xl': '1536px', // => @media (min-width: 1536px) { ... }
    },
    extend: {
      container: {
        padding: '1.25rem',
        center: true
      },
      colors: {
        primary: {
          300: '#fecc76',
          DEFAULT: '#ff851d'
        }
      }
    }
  },
  plugins: [
    /** @type {import("tailwindcss/types/config").PluginCreator} */
    ({ addComponents, theme }) => {
      addComponents({
        '.input': {
          paddingLeft: theme("spacing.4"),
          paddingRight: theme("spacing.4"),
          paddingTop: theme("spacing.2"),
          paddingBottom: theme("spacing.2"),
          borderRadius: theme("borderRadius.lg"),
          borderWidth: '1px',
        },
        '.button': {
          backgroundColor: theme('colors.primary.DEFAULT'),
          color: theme('colors.white'),
          paddingLeft: theme("spacing.4"),
          paddingRight: theme("spacing.4"),
          paddingTop: theme("spacing.2"),
          paddingBottom: theme("spacing.2"),
          borderRadius: theme("borderRadius.lg"),
          '&-sm': {
            backgroundColor: theme('colors.primary.DEFAULT'),
            color: theme('colors.white'),
            fontSize: theme('fontSize.sm'),
            paddingLeft: theme("spacing.3"),
            paddingRight: theme("spacing.3"),
            paddingTop: theme("spacing.0.5", '0.3rem'),
            paddingBottom: theme("spacing.0.5", '0.3rem'),
            borderRadius: theme("borderRadius.lg"),
          },
          '&-xs': {
            backgroundColor: theme('colors.primary.DEFAULT'),
            color: theme('colors.white'),
            fontSize: theme('fontSize.xs'),
            paddingLeft: theme("spacing.2"),
            paddingRight: theme("spacing.2"),
            paddingTop: theme("spacing.1"),
            paddingBottom: theme("spacing.1"),
            borderRadius: theme("borderRadius.lg"),
          }
          // borderWidth: '1px',
        }
      })
    }
  ]
};

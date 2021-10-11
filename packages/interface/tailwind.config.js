module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    fontFamily: {
      'display': ['Inter', 'sans-serif']
    },
    colors: {
      transparent: 'transparent',
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      green: {
        DEFAULT: '#34D399',
      },
      red: {
        DEFAULT: '#FF0000',
        type1: '#DC3545',
      },
      black: {
        DEFAULT: '#000000',
        type1: '#292825',
      },
      white: {
        DEFAULT: '#FFFFFF',
      },
      yellow: {
        DEFAULT: '#FFB01F',
      },
      purple: {
        DEFAULT: '#7749F8',
      },
      gray: {
        DEFAULT: '#DEE2E6',
        type1: '#8C8C8C',

      }

    },
    extend: {},
  },
  screens: {
    'sm': '640px',
    // => @media (min-width: 640px) { ... }

    'md': '768px',
    // => @media (min-width: 768px) { ... }

    'lg': '1024px',
    // => @media (min-width: 1024px) { ... }

    'xl': '1280px',
    // => @media (min-width: 1280px) { ... }

    '2xl': '1536px',
    // => @media (min-width: 1536px) { ... }
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'), // import tailwind forms
  ],
}

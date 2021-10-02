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
      secondary: '#EBEBEB',
      green: {
        DEFAULT: '#34D399',
      },
      red: {
        DEFAULT: '#FF0000',
      },
      black: {
        DEFAULT: '#000000',
      },
      white: {
        DEFAULT: '#FFFFFF',
      },
      yellow: {
        DEFAULT: '#FFB01F',
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

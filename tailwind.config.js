/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#25d366',
          light: '#48e082',
          dark: '#1fb755',
          50: '#e6fbf0',
          100: '#b3f4d4',
          200: '#80edb8',
          300: '#4de69c',
          400: '#25d366',
          500: '#1fb755',
          600: '#199b44',
          700: '#137f33',
          800: '#0d6322',
          900: '#074711',
        },
        secondary: {
          DEFAULT: '#128c7e',
          light: '#34a297',
          dark: '#0e7168',
        },
        accent: {
          DEFAULT: '#25d366',
          hover: '#1fb755',
        },
        background: {
          DEFAULT: '#f5f5f5',
          paper: '#ffffff',
          dark: '#1a1a1a',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
          disabled: '#bdbdbd',
          hint: '#9e9e9e',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'material': '4px',
        'card': '8px',
        'button': '24px',
      },
      boxShadow: {
        'material': '0 2px 4px rgba(0,0,0,0.1)',
        'material-lg': '0 4px 8px rgba(0,0,0,0.12)',
        'material-xl': '0 8px 16px rgba(0,0,0,0.15)',
        'button': '0 2px 4px rgba(37, 211, 102, 0.3)',
        'button-hover': '0 4px 8px rgba(37, 211, 102, 0.4)',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      }
    },
  },
  plugins: [],
}


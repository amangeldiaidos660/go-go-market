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
          DEFAULT: '#FF6B35',
          light: '#FF8B5C',
          dark: '#E5501B',
          50: '#FFF3EF',
          100: '#FFE5D9',
          200: '#FFCBB3',
          300: '#FFB08C',
          400: '#FF9566',
          500: '#FF6B35',
          600: '#E5501B',
          700: '#B33E15',
          800: '#802C0F',
          900: '#4D1A09',
        },
        secondary: {
          DEFAULT: '#128c7e',
          light: '#34a297',
          dark: '#0e7168',
        },
        accent: {
          DEFAULT: '#FF6B35',
          hover: '#E5501B',
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
        'button': '0 2px 4px rgba(255, 107, 53, 0.3)',
        'button-hover': '0 4px 8px rgba(255, 107, 53, 0.4)',
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


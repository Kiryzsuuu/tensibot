/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E86C1',
          dark: '#1A5276',
          deeper: '#154360',
          light: '#EAF4FB',
          mid: '#AED6F1',
          accent: '#2980B9',
        },
        tensi: {
          gold: '#F5A623',
          red: '#C0392B',
          offwhite: '#F4F8FC',
          text: '#1A2A3A',
          border: '#D6E8F5',
        },
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(46,134,193,0.08)',
        'card-hover': '0 4px 16px 0 rgba(46,134,193,0.16)',
      },
    },
  },
  plugins: [],
};

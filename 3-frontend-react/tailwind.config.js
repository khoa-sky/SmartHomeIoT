export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif']
      },
      borderRadius: {
        card: '22px',
        subcard: '16px',
        control: '14px',
        nav: '12px'
      }
    }
  },
  plugins: []
};

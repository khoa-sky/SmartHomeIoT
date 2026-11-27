export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '16px',
        subcard: '12px',
        control: '10px',
        nav: '8px'
      }
    }
  },
  plugins: []
};

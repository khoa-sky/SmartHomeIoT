export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Manrope', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        aura: {
          bg: 'var(--bg-main)',
          card: 'var(--bg-card)',
          soft: 'var(--soft-green)',
          sage: 'var(--sage-green)',
          olive: 'var(--olive-green)',
          darkOlive: 'var(--dark-olive)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          border: 'var(--border-color)',
          success: 'var(--success)',
          danger: 'var(--danger)'
        }
      },
      borderRadius: {
        bento: '24px',
        card: '22px',
        subcard: '16px',
        control: '14px',
        pill: '12px'
      }
    }
  },
  plugins: []
};

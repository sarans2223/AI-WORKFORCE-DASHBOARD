/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C4DFF',
        'primary-dark': '#6D3FEA',
        'primary-light': '#F0EAFF',
        'primary-muted': '#EDE7FF',
        background: '#F7F6FC',
        card: '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        success: '#10B981',
        'success-soft': '#D1FAE5',
        warning: '#F59E0B',
        'warning-soft': '#FEF3C7',
        danger: '#EF4444',
        'danger-soft': '#FEE2E2',
        info: '#3B82F6',
        'info-soft': '#DBEAFE',
        sidebar: '#1E1B2E',
        'sidebar-hover': '#2D2947',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        modal: '20px',
        badge: '100px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(124, 77, 255, 0.08)',
        'card-hover': '0 8px 32px rgba(124, 77, 255, 0.16)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.12)',
        sidebar: '4px 0 24px rgba(0,0,0,0.10)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

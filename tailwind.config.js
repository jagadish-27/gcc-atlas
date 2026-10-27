/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b1f3a',
          800: '#11294a',
          700: '#1b3a5e',
          600: '#2a4f7a',
          500: '#3d6a96',
          400: '#6789ad',
          300: '#9bb3cc',
          200: '#c4d2e0',
          100: '#e4ebf2',
          50: '#f3f6f9',
        },
        accent: {
          600: '#0c7d8c',
          500: '#0e94a3',
          400: '#22b3bf',
          300: '#5cc9d1',
          200: '#9bdee3',
          100: '#d3eef0',
          50: '#eaf7f8',
        },
        success: {
          600: '#1a8245',
          500: '#1f9d54',
          400: '#34b568',
          100: '#d7f0df',
          50: '#eefaf1',
        },
        warning: {
          600: '#b7791f',
          500: '#d4902a',
          400: '#e0a64a',
          100: '#fbe9c8',
          50: '#fdf5e6',
        },
        error: {
          600: '#c0392b',
          500: '#d94a3a',
          400: '#e76b5c',
          100: '#fadbd4',
          50: '#fceeeb',
        },
        canvas: {
          DEFAULT: '#f7f9fb',
          card: '#ffffff',
          subtle: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(11, 31, 58, 0.04), 0 1px 3px 0 rgba(11, 31, 58, 0.06)',
        cardhover: '0 4px 12px -2px rgba(11, 31, 58, 0.08), 0 2px 6px -2px rgba(11, 31, 58, 0.06)',
        pop: '0 8px 28px -6px rgba(11, 31, 58, 0.12), 0 4px 10px -4px rgba(11, 31, 58, 0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        slideIn: 'slideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};

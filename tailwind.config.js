/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        gamer: ['Rajdhani', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      colors: {
        dark: {
          950: '#020306',
          900: '#06080e',
          850: '#0a0d17',
          800: '#0f1422',
          700: '#182035',
        },
        cyan: {
          neon: '#00f2fe',
          glow: '#0ea5e9',
          muted: '#0284c7',
        }
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(0, 242, 254, 0.35)',
        'neon-strong': '0 0 35px -5px rgba(0, 242, 254, 0.55)',
        'neon-card': '0 8px 32px 0 rgba(0, 0, 0, 0.7), 0 0 15px -2px rgba(0, 242, 254, 0.15)',
        'neon-hud': 'inset 0 0 15px 0 rgba(0, 242, 254, 0.08), 0 0 20px -2px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}

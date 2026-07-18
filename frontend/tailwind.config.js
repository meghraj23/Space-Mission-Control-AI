/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spaceBg: '#050816',
        spaceCard: '#0B1220',
        accentCyan: '#00E5FF',
        accentPurple: '#7B61FF',
        accentDanger: '#FF4D6D',
        spaceText: '#FFFFFF',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 229, 255, 0.4)',
        'glow-purple': '0 0 15px rgba(123, 97, 255, 0.4)',
        'glow-danger': '0 0 15px rgba(255, 77, 109, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 229, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-cyan-purple': 'linear-gradient(135deg, #00E5FF 0%, #7B61FF 100%)',
        'gradient-dark': 'linear-gradient(180deg, #050816 0%, #0B1220 100%)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'meteor': 'meteor 5s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        meteor: {
          '0%': { transform: 'rotate(-45deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(-45deg) translateX(-1000px)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      colors: {
        navy: {
          50: 'oklch(0.95 0.02 260)',
          100: 'oklch(0.88 0.05 260)',
          200: 'oklch(0.75 0.08 260)',
          300: 'oklch(0.60 0.10 260)',
          400: 'oklch(0.48 0.12 260)',
          500: 'oklch(0.38 0.12 260)',
          600: 'oklch(0.32 0.12 260)',
          700: 'oklch(0.28 0.12 260)',
          800: 'oklch(0.22 0.10 260)',
          900: 'oklch(0.16 0.08 260)',
        },
        saffron: {
          50: 'oklch(0.97 0.04 55)',
          100: 'oklch(0.93 0.08 55)',
          200: 'oklch(0.88 0.12 55)',
          300: 'oklch(0.82 0.16 55)',
          400: 'oklch(0.76 0.18 55)',
          500: 'oklch(0.72 0.18 55)',
          600: 'oklch(0.65 0.18 55)',
          700: 'oklch(0.58 0.16 55)',
          800: 'oklch(0.50 0.14 55)',
          900: 'oklch(0.42 0.12 55)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        success: {
          DEFAULT: 'oklch(0.55 0.15 145)',
          foreground: 'oklch(0.99 0 0)',
        },
        warning: {
          DEFAULT: 'oklch(0.72 0.18 55)',
          foreground: 'oklch(0.15 0.02 240)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px 0 rgba(0,0,0,0.12)',
        nav: '0 2px 8px 0 rgba(0,0,0,0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

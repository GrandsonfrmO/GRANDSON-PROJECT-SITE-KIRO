import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#000000",
          light: "#1a1a1a",
        },
        accent: {
          DEFAULT: "#22c55e", // Green accent for better mobile visibility
          light: "#4ade80",
          dark: "#16a34a",
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        // Mobile-optimized theme colors
        mobile: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
      },
      // Mobile-first breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Mobile-specific breakpoints
        'mobile-sm': {'max': '374px'},
        'mobile-md': {'min': '375px', 'max': '413px'},
        'mobile-lg': {'min': '414px', 'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      // Mobile-optimized spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Mobile-specific spacing
        'mobile-xs': '0.25rem',
        'mobile-sm': '0.5rem',
        'mobile-md': '0.75rem',
        'mobile-lg': '1rem',
        'mobile-xl': '1.5rem',
        // Safe area insets
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Touch-friendly minimum sizes for mobile
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '52px',
        'mobile-screen': '100dvh', // Dynamic viewport height
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '52px',
      },
      // Mobile-optimized shadows
      boxShadow: {
        'mobile': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'mobile-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'mobile-xl': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'neon': '0 0 20px rgba(34, 197, 94, 0.5)',
        'neon-lg': '0 0 40px rgba(34, 197, 94, 0.7)',
      },
      // Mobile-optimized animations
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'mobile-bounce': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'mobile-bounce': 'mobile-bounce 0.6s ease-in-out',
        'ripple': 'ripple 0.6s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      // Mobile typography scale
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'mobile-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      // Safe area support
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      margin: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Mobile-optimized z-index scale
      zIndex: {
        'modal': '1000',
        'dropdown': '1010',
        'sticky': '1020',
        'fixed': '1030',
        'overlay': '1040',
        'tooltip': '1050',
      },
      // Mobile-optimized border radius
      borderRadius: {
        'mobile': '0.5rem',
        'mobile-lg': '0.75rem',
        'mobile-xl': '1rem',
      },
      // Mobile-optimized backdrop blur
      backdropBlur: {
        'mobile': '8px',
        'mobile-lg': '12px',
        'mobile-xl': '16px',
      },
    },
  },
  plugins: [],
};

export default config;

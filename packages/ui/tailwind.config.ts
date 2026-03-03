import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
    darkMode: 'class',
    content: [
        './src/**/*.{ts,tsx}',
        '../../apps/web/src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                // Ori-OS Brand Colors
                gunmetal: {
                    DEFAULT: 'hsl(var(--gunmetal))',
                    50: 'hsl(var(--gunmetal) / 0.05)',
                    100: 'hsl(var(--gunmetal) / 0.1)',
                    200: 'hsl(var(--gunmetal) / 0.2)',
                    300: 'hsl(var(--gunmetal) / 0.3)',
                    400: 'hsl(var(--gunmetal) / 0.4)',
                    500: 'hsl(var(--gunmetal) / 0.5)',
                    600: 'hsl(var(--gunmetal) / 0.6)',
                    700: 'hsl(var(--gunmetal) / 0.7)',
                    800: 'hsl(var(--gunmetal) / 0.8)',
                    900: 'hsl(var(--gunmetal) / 0.9)',
                },
                silver: {
                    DEFAULT: 'hsl(var(--silver))',
                    50: 'hsl(var(--silver) / 0.05)',
                    100: 'hsl(var(--silver) / 0.1)',
                    200: 'hsl(var(--silver) / 0.2)',
                    300: 'hsl(var(--silver) / 0.3)',
                    400: 'hsl(var(--silver) / 0.4)',
                    500: 'hsl(var(--silver) / 0.5)',
                    600: 'hsl(var(--silver) / 0.6)',
                    700: 'hsl(var(--silver) / 0.7)',
                    800: 'hsl(var(--silver) / 0.8)',
                    900: 'hsl(var(--silver) / 0.9)',
                },
                'coffee-bean': {
                    DEFAULT: 'hsl(var(--coffee-bean))',
                    50: 'hsl(var(--coffee-bean) / 0.05)',
                    100: 'hsl(var(--coffee-bean) / 0.1)',
                    200: 'hsl(var(--coffee-bean) / 0.2)',
                    300: 'hsl(var(--coffee-bean) / 0.3)',
                    400: 'hsl(var(--coffee-bean) / 0.4)',
                    500: 'hsl(var(--coffee-bean) / 0.5)',
                    600: 'hsl(var(--coffee-bean) / 0.6)',
                    700: 'hsl(var(--coffee-bean) / 0.7)',
                    800: 'hsl(var(--coffee-bean) / 0.8)',
                    900: 'hsl(var(--coffee-bean) / 0.9)',
                },
                tangerine: {
                    DEFAULT: 'hsl(var(--vivid-tangerine))',
                    50: 'hsl(var(--vivid-tangerine) / 0.05)',
                    100: 'hsl(var(--vivid-tangerine) / 0.1)',
                    200: 'hsl(var(--vivid-tangerine) / 0.2)',
                    300: 'hsl(var(--vivid-tangerine) / 0.3)',
                    400: 'hsl(var(--vivid-tangerine) / 0.4)',
                    500: 'hsl(var(--vivid-tangerine) / 0.5)',
                    600: 'hsl(var(--vivid-tangerine) / 0.6)',
                    700: 'hsl(var(--vivid-tangerine) / 0.7)',
                    800: 'hsl(var(--vivid-tangerine) / 0.8)',
                    900: 'hsl(var(--vivid-tangerine) / 0.9)',
                },
                // Semantic Colors
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    foreground: 'hsl(var(--warning-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xs: '2px',
            },
            fontFamily: {
                sans: ['var(--font-urbanist)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
            },
            boxShadow: {
                glow: '0 0 20px rgba(247, 127, 0, 0.3)',
                'glow-sm': '0 0 10px rgba(247, 127, 0, 0.2)',
                glass: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
                'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.12)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                'ori-gradient': 'linear-gradient(135deg, hsl(var(--coffee-bean)) 0%, hsl(var(--gunmetal)) 100%)',
                'ori-accent': 'linear-gradient(135deg, hsl(var(--vivid-tangerine)) 0%, hsl(31 100% 38%) 100%)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'fade-out': {
                    from: { opacity: '1' },
                    to: { opacity: '0' },
                },
                'slide-in-from-top': {
                    from: { transform: 'translateY(-10px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-from-bottom': {
                    from: { transform: 'translateY(10px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-from-left': {
                    from: { transform: 'translateX(-10px)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                'slide-in-from-right': {
                    from: { transform: 'translateX(10px)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(247, 127, 0, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(247, 127, 0, 0.5)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'fade-out': 'fade-out 0.2s ease-out',
                'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
                'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
                'slide-in-from-left': 'slide-in-from-left 0.2s ease-out',
                'slide-in-from-right': 'slide-in-from-right 0.2s ease-out',
                shimmer: 'shimmer 2s linear infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                float: 'float 3s ease-in-out infinite',
                glow: 'glow 2s ease-in-out infinite',
            },
        },
    },
    plugins: [tailwindcssAnimate],
};

export default config;

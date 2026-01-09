/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'grow-up': {
                    '0%': { transform: 'scaleY(0)', opacity: '0' },
                    '100%': { transform: 'scaleY(1)', opacity: '1' },
                },
                'draw-line': {
                    '0%': { strokeDashoffset: '1000', opacity: '0' },
                    '100%': { strokeDashoffset: '0', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'fade-in-up-delay-1': 'fade-in-up 0.6s ease-out 0.1s forwards',
                'fade-in-up-delay-2': 'fade-in-up 0.6s ease-out 0.2s forwards',
                'fade-in-up-delay-3': 'fade-in-up 0.6s ease-out 0.3s forwards',
                'float': 'float 3s ease-in-out infinite',
                'grow-up': 'grow-up 0.8s ease-out forwards',
                'draw-line': 'draw-line 1.5s ease-out forwards',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'fade-in-delay': 'fade-in 0.5s ease-out 0.3s forwards',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('tailwindcss-animate'),
        require('@tailwindcss/container-queries'),
    ],
}

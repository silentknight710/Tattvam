/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                tattvik: {
                    dark: '#121212',
                    green: '#059669', // Emerald Green (Professional)
                    red: '#FF3B30', // Neon Red
                    gold: '#FFD700', // Gold
                    gray: '#1E1E1E', // Slightly lighter for cards
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}

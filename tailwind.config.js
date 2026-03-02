/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#4f46e5',
                    dark: '#6366f1',
                },
                background: {
                    light: '#ffffff',
                    dark: '#0f172a',
                },
            }
        },
    },
    plugins: [],
}

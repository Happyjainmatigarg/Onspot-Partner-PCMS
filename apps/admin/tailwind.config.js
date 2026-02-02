/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c7d6fe',
                    300: '#a4bbfc',
                    400: '#8098f9',
                    500: '#667eea',
                    600: '#5a67d8',
                    700: '#4c51bf',
                    800: '#434190',
                    900: '#3c366b'
                }
            }
        }
    },
    plugins: []
};

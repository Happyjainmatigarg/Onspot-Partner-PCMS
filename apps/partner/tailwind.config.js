/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                // OnSpot Brand Colors - matching partner.onspot.one
                primary: {
                    50: '#E8EDF3',
                    100: '#D1DCE7',
                    200: '#A3B9CF',
                    300: '#7596B7',
                    400: '#47739F',
                    500: '#1E3A8A',
                    600: '#0B2545',  // Main primary
                    700: '#091D38',
                    800: '#07152A',
                    900: '#050E1D'
                },
                gold: {
                    50: '#FBF7EF',
                    100: '#F7EFDF',
                    200: '#EFE0C0',
                    300: '#E7D0A0',
                    400: '#DFC180',
                    500: '#C5A059',  // Main gold
                    600: '#9E8047',
                    700: '#776035',
                    800: '#4F4023',
                    900: '#282012'
                },
                accent: {
                    500: '#00A3E0',  // Cyan accent
                    600: '#0088BD'
                }
            },
            fontFamily: {
                'display': ['Playfair Display', 'serif'],
                'sans': ['Public Sans', 'sans-serif']
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'floating': '0 20px 40px rgba(0, 0, 0, 0.08)',
                'primary': '0 4px 20px rgba(11, 37, 69, 0.2)',
                'gold': '0 4px 20px rgba(197, 160, 89, 0.3)'
            }
        }
    },
    plugins: []
};

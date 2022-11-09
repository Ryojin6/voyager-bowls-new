/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./pages/**/*.{html,tsx}', './components/**/*.{html,tsx}'],
    plugins: [
        require('@tailwindcss/typography'),
        require('@headlessui/tailwindcss'),
    ],
};

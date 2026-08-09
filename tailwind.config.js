/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        terracotta: '#E0533C',
        sage: '#81A684',
        cream: '#F5F2E9',
        sand: '#F4E9CD',
        charcoal: '#3D3D3D',
        gold: '#D9A441',
      },
    },
  },
  plugins: [],
};

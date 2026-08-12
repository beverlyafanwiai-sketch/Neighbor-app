/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        terracotta: '#E0533C',
        sage: '#81A684',
        gold: '#D9A441',
        // Fixed tokens — always dark / always light, regardless of theme.
        // Used where a surface or text color is paired with a saturated
        // accent (e.g. cream text on a terracotta button) and must not
        // invert when the surrounding page flips to dark mode.
        ink: '#3D3D3D',
        paper: '#F5F2E9',
        // Flippable tokens — swap value between light and dark mode via
        // CSS variables defined in global.css.
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        sand: 'rgb(var(--color-sand) / <alpha-value>)',
        charcoal: 'rgb(var(--color-charcoal) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};

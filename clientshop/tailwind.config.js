/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' based on preference
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If using older pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Default sans-serif font
        iranYekan: ['IranYekanX', 'sans-serif'], // Custom Persian font
      },
      colors: {
        // Light theme colors (example)
        'light-primary': '#FFFFFF',
        'light-secondary': '#F3F4F6',
        'light-accent': '#3B82F6',
        'light-text-primary': '#1F2937',
        'light-text-secondary': '#6B7280',
        // Dark theme colors (example)
        'dark-primary': '#1F2937',
        'dark-secondary': '#374151',
        'dark-accent': '#60A5FA',
        'dark-text-primary': '#F3F4F6',
        'dark-text-secondary': '#D1D5DB',
      },
      boxShadow: {
        // Neumorphism shadows (examples - will need refinement)
        'neumo-light-DEFAULT': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
        'neumo-light-inset': 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
        'neumo-dark-DEFAULT': '5px 5px 10px #2c323d, -5px -5px 10px #4a5263',
        'neumo-dark-inset': 'inset 5px 5px 10px #2c323d, inset -5px -5px 10px #4a5263',
      }
      // We might add more specific things for glassmorphism or neumorphism here if needed
      // e.g., custom blur utilities, specific background opacities
    },
  },
  plugins: [
    require('tailwindcss-animate'), // Already in package.json, good for animations
    // Plugin for backdrop-filter if not well supported by default utilities for glassmorphism
    // function ({ addUtilities }) {
    //   const newUtilities = {
    //     '.backdrop-blur-8': {
    //       'backdrop-filter': 'blur(8px)',
    //     },
    //   }
    //   addUtilities(newUtilities, ['responsive', 'hover'])
    // }
  ],
};

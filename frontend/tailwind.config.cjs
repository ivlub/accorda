const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Source Serif Pro', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        // New Corporate Palette
        brand: {
          dark: '#2c3e50',      // Deep Charcoal/Blue (Primary Dark)
          muted: '#867768',     // Muted Brown/Grey (Secondary Accent)
          accent: '#df440d',    // Orange (Primary Action - Use Sparingly)
          accent_light: '#e97040', // Lighter Orange for hover maybe
        },
        neutral: {
          white: '#ffffff',
          lightest: '#f8f9fa', // Off-white background
          light: '#e9ecef',    // Light grey borders/dividers
          medium: '#ced4da',   // Medium grey UI elements
          dark: '#6c757d',     // Secondary text
          darkest: '#343a40',  // Primary text (Slightly softer than pure black)
        }
        // Remove old primary/accent if no longer needed, kept brand for clarity
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 
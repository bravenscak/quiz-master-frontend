/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quiz-primary': '#24ca31',    
        'quiz-primary-dark': '#2d5a2d',
        'quiz-gray': '#666666',
      }
    },
  },
  plugins: [],
}
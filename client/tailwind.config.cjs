/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0083B0',     
        secondary: '#00B4DB',   
        accent: '#F9A826',      
        background: '#F2F2F2',  
        dark: '#1F2937',        
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        card: '0 4px 14px rgba(0, 0, 0, 0.1)',
        button: '0 2px 8px rgba(0, 132, 176, 0.3)',
      },
    },
  },
  plugins: [],
}
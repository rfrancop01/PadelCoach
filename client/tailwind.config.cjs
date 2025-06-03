module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0E4A86',      // Azul oscuro profesional
        primaryLight: '#3566A0', // Azul medio para fondos
        secondary: '#6096BA',    // Azul suave para elementos secundarios
        accent: '#FFB347',       // Amarillo/naranja suave para acentos (botones, links)
        background: '#F7F9FC',   // Fondo muy suave, casi blanco con un toque azulado
        textDark: '#1E2D3B',     // Texto oscuro para buena legibilidad
        textLight: '#617A9B',    // Texto gris azulado para subtítulos o info secundaria
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
        button: '0 2px 8px rgba(14, 74, 134, 0.3)',
      },
    },
  },
  plugins: [],
}
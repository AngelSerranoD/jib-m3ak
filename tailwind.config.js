/**
 * Jib M3ak — configuración de Tailwind.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Paleta pedida: #EDE4D3 · #C9B79C · #9C7A54 · #6B4F3A · #3E2E22, la misma
 * arcilla del icono. `leche` es un aclarado de `crema` para las tarjetas: el
 * blanco puro cantaba demasiado sobre un fondo tan cálido.
 *
 * Contraste comprobado en tests/paleta.test.js:
 *   texto café sobre crema 10,3 · sobre leche 12,2
 *   nogal sobre leche 7,1 · sobre crema 5,9 (texto de apoyo y botones)
 *   canela sobre leche 3,7 → solo iconos y texto grande
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crema: '#EDE4D3',
        avena: '#C9B79C',
        canela: '#9C7A54',
        nogal: '#6B4F3A',
        cafe: '#3E2E22',
        leche: '#FBF8F2',
      },
      fontFamily: {
        // SF Pro Rounded en iPhone, Roboto en Android: nada que descargar.
        sans: ['ui-rounded', '"SF Pro Rounded"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        // Naskh sí se descarga: es la que dibuja bien el tashkil de la darija.
        arabe: ['"Noto Naskh Arabic"', '"Geeza Pro"', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        // Relieve de arcilla, como el icono: luz arriba, sombra cálida abajo.
        arcilla: 'inset 0 1.5px 0 rgba(255,255,255,0.8), 0 1px 0 rgba(156,122,84,0.18), 0 6px 16px -6px rgba(107,79,58,0.3)',
        hundido: 'inset 0 2px 6px rgba(107,79,58,0.25), inset 0 -1px 0 rgba(255,255,255,0.65)',
        flotante: '0 10px 30px -8px rgba(62,46,34,0.45)',
      },
      keyframes: {
        asomar: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fundido: { from: { opacity: '0' }, to: { opacity: '1' } },
        subir: { from: { transform: 'translateY(110%)' }, to: { transform: 'translateY(0)' } },
        destello: { '0%, 100%': { backgroundColor: 'transparent' }, '30%': { backgroundColor: 'rgba(156,122,84,0.22)' } },
        sello: { '0%': { transform: 'scale(0.6)', opacity: '0' }, '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        rebote: { '0%, 100%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.25)' } },
      },
      animation: {
        asomar: 'asomar 220ms ease-out',
        fundido: 'fundido 200ms ease-out',
        subir: 'subir 300ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        destello: 'destello 1.4s ease-out',
        sello: 'sello 320ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        rebote: 'rebote 420ms ease-out',
      },
    },
  },
  plugins: [],
};

/**
 * Jib M3ak — los iconos, dibujados a mano (nada de librerías).
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Todos heredan el color del texto y el grosor de trazo del icono de la app.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const IconoLista = (props) => (
  <svg {...base} {...props}>
    <path d="M4 6.5h3M4 12h3M4 17.5h3" />
    <path d="M10.5 6.5H20M10.5 12H20M10.5 17.5H20" />
  </svg>
);

export const IconoCarrito = (props) => (
  <svg {...base} {...props}>
    <path d="M3 4h2.2l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h7.7a1.6 1.6 0 0 0 1.6-1.2l1.5-6.1H6.3" />
    <circle cx="9.5" cy="19.5" r="1.4" />
    <circle cx="17" cy="19.5" r="1.4" />
  </svg>
);

export const IconoCamara = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 19.5h15a1.5 1.5 0 0 0 1.5-1.5V9a1.5 1.5 0 0 0-1.5-1.5h-2.6l-1.2-2.1a1 1 0 0 0-.9-.5H9.2a1 1 0 0 0-.9.5L7.1 7.5H4.5A1.5 1.5 0 0 0 3 9v9a1.5 1.5 0 0 0 1.5 1.5Z" />
    <circle cx="12" cy="13" r="3.6" />
  </svg>
);

export const IconoFlecha = (props) => (
  <svg {...base} {...props}>
    <path d="M5 12h13" />
    <path d="m12.5 6 6 6-6 6" />
  </svg>
);

export const IconoCheck = (props) => (
  <svg {...base} {...props} strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconoPapelera = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 6.5h15" />
    <path d="M9.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" />
    <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
  </svg>
);

export const IconoIdioma = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" />
  </svg>
);

export const IconoBuscar = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconoCerrar = (props) => (
  <svg {...base} {...props} strokeWidth={2.2}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconoNube = (props) => (
  <svg {...base} {...props}>
    <path d="M7 18.5h9.5a3.8 3.8 0 0 0 .4-7.6 5.3 5.3 0 0 0-10.2-1A3.9 3.9 0 0 0 7 18.5Z" />
  </svg>
);

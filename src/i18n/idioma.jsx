/**
 * Jib M3ak — el idioma de la app (español o darija) y el botón que los cambia.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * El idioma es de este móvil, no de la lista: cada uno de la familia lee la
 * misma compra en el suyo. Se recuerda entre visitas y, la primera vez, se
 * elige por el idioma del teléfono.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DIRECCION, textos } from './textos.js';

const Contexto = createContext(null);
const CLAVE = 'jibm3ak:idioma';

function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'es' || guardado === 'dar') return guardado;
  } catch { /* modo privado: se decide por el idioma del teléfono */ }
  const idiomas = navigator.languages?.length ? navigator.languages : [navigator.language ?? 'es'];
  return idiomas.some((codigo) => /^ar/i.test(codigo)) ? 'dar' : 'es';
}

export function ProveedorIdioma({ children }) {
  const [idioma, setIdioma] = useState(idiomaInicial);

  useEffect(() => {
    const html = document.documentElement;
    // `lang="ar"` es lo que hace que el navegador (y la CSS) traten el texto
    // como árabe: tipografía, corte de línea y dirección.
    html.lang = idioma === 'dar' ? 'ar' : 'es';
    html.dir = DIRECCION[idioma];
    try { localStorage.setItem(CLAVE, idioma); } catch { /* da igual: se recalcula */ }
  }, [idioma]);

  const valor = useMemo(() => ({
    idioma,
    rtl: idioma === 'dar',
    t: textos(idioma),
    cambiar: () => setIdioma((actual) => (actual === 'es' ? 'dar' : 'es')),
  }), [idioma]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export const usarIdioma = () => useContext(Contexto);

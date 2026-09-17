/**
 * Jib M3ak — cabecera, pestañas de abajo, avisos y banda de estado.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Todo lo que rodea a las dos listas. Va junto porque son piezas pequeñas y
 * las tres hablan del mismo sitio: la barra de arriba y la de abajo.
 */
import { useEffect } from 'react';
import { usarIdioma } from '../i18n/idioma.jsx';
import { NOMBRE_IDIOMA } from '../i18n/textos.js';
import { IconoCarrito, IconoIdioma, IconoLista, IconoNube } from './Iconos.jsx';

export function Cabecera() {
  const { t, idioma, cambiar } = usarIdioma();
  const otro = idioma === 'es' ? 'dar' : 'es';

  return (
    <header className="sticky top-0 z-20 border-b border-avena/50 bg-crema/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-2xl shadow-arcilla" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{t.app}</h1>
          <p className="truncate text-xs leading-tight text-nogal">{t.lema}</p>
        </div>
        <button
          type="button"
          onClick={cambiar}
          aria-label={t.cambiarIdioma}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-avena bg-leche px-3 py-2 text-sm font-semibold text-nogal shadow-arcilla active:translate-y-px"
        >
          <IconoIdioma className="h-4 w-4" />
          <span className={otro === 'dar' ? 'font-arabe' : 'font-sans'}>{NOMBRE_IDIOMA[otro]}</span>
        </button>
      </div>
    </header>
  );
}

/** Una línea fina bajo la cabecera: sin conexión, o cambios saliendo. */
export function Estado({ enLinea, pendientes }) {
  const { t } = usarIdioma();
  if (enLinea && !pendientes) return null;
  return (
    <p className="flex items-center justify-center gap-2 bg-avena/60 px-4 py-1.5 text-center text-xs text-cafe">
      <IconoNube className="h-4 w-4 shrink-0" />
      {enLinea ? t.enviando : t.sinConexion}
    </p>
  );
}

export function Pestanas({ activa, onCambiar, cuantos }) {
  const { t } = usarIdioma();
  const pestanas = [
    { id: 'articulos', texto: t.pestanaArticulos, Icono: IconoLista },
    { id: 'compra', texto: t.pestanaCompra, Icono: IconoCarrito, insignia: cuantos },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-avena/60 bg-crema/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {pestanas.map(({ id, texto, Icono, insignia }) => {
          const activo = activa === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onCambiar(id)}
              aria-current={activo ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${activo ? 'text-cafe' : 'text-canela'}`}
            >
              <span className={`relative rounded-2xl px-6 py-1 ${activo ? 'bg-avena/60' : ''}`}>
                <Icono className="h-6 w-6" />
                {insignia > 0 && (
                  <span
                    key={insignia}
                    className="absolute -top-1 end-3 grid h-5 min-w-5 animate-rebote place-items-center rounded-full bg-nogal px-1 text-[11px] font-bold text-crema"
                  >
                    {insignia}
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold">{texto}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** Aviso breve que se va solo (no interrumpe: no lleva botones). */
export function Aviso({ mensaje, onFin }) {
  useEffect(() => {
    const reloj = setTimeout(onFin, 2200);
    return () => clearTimeout(reloj);
  }, [mensaje, onFin]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 flex justify-center px-6">
      <p role="status" className="animate-asomar rounded-full bg-cafe px-4 py-2 text-sm font-semibold text-crema shadow-flotante">
        {mensaje}
      </p>
    </div>
  );
}

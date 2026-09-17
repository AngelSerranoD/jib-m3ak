/**
 * Jib M3ak — el apartado de compra: lo que hay que meter en el carro.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Se tacha una a una según van cayendo en el carro (con un momento de tachado
 * antes de irse, para saber qué acabas de marcar), o se vacía entera con
 * «Todo comprado». Los artículos siguen guardados en su apartado.
 */
import { useMemo, useState } from 'react';
import { usarIdioma } from '../i18n/idioma.jsx';
import { mostrar } from '../i18n/diccionario.js';
import Foto from './Foto.jsx';
import { IconoCarrito, IconoCheck } from './Iconos.jsx';

const TACHADO = 260;

export default function Compra({ compra, onQuitar, onVaciar }) {
  const { t, idioma, rtl } = usarIdioma();
  const [tachando, setTachando] = useState(() => new Set());

  const lista = useMemo(
    () => compra.map((linea) => ({ ...linea, texto: mostrar(linea.articulo.nombre, idioma) })),
    [compra, idioma]
  );

  function comprado(id) {
    if (tachando.has(id)) return;
    setTachando((antes) => new Set(antes).add(id));
    setTimeout(() => {
      onQuitar(id);
      setTachando((antes) => {
        const nuevo = new Set(antes);
        nuevo.delete(id);
        return nuevo;
      });
    }, TACHADO);
  }

  if (lista.length === 0) {
    return (
      <div className="tarjeta mt-6 p-8 text-center text-nogal">
        <IconoCarrito className="mx-auto h-12 w-12 text-avena" />
        <p className="mt-3 font-semibold text-cafe">{t.compraVacia}</p>
        <p className="mt-2 text-sm">{t.compraVaciaPista}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <p className="flex-1 font-semibold text-nogal">{t.porComprar(lista.length)}</p>
        <button type="button" className="boton py-2.5 text-sm" onClick={onVaciar}>
          {t.todoComprado}
        </button>
      </div>

      <ul className="space-y-2.5">
        {lista.map(({ id, articulo, texto }) => {
          const tachado = tachando.has(id);
          return (
            <li
              key={id}
              className={`tarjeta flex items-center gap-3 p-2.5 transition-all duration-200 ${
                tachado ? 'scale-[0.97] opacity-40' : ''
              }`}
            >
              <Foto articulo={articulo} />

              <div className="min-w-0 flex-1">
                <p className={`truncate font-semibold leading-snug ${tachado ? 'line-through' : ''}`}>
                  {texto.principal}
                </p>
                {texto.original && (
                  <p dir="auto" className={`truncate text-sm text-canela ${rtl ? 'text-right' : 'text-left'}`}>
                    {texto.original}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => comprado(id)}
                aria-label={`${t.quitar}: ${texto.principal}`}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-avena bg-crema text-nogal shadow-arcilla active:translate-y-px active:bg-avena"
              >
                <IconoCheck className="h-6 w-6" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

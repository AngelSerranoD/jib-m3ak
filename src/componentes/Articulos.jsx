/**
 * Jib M3ak — el apartado de artículos: el catálogo de la casa.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Aquí no se borra nada al comprar: lo que se fotografía una vez se queda para
 * siempre, y la flechita lo manda a la compra cuando haga falta. Lo que ya está
 * en la lista de la compra enseña un visto en vez de la flecha.
 */
import { useMemo } from 'react';
import { usarIdioma } from '../i18n/idioma.jsx';
import { coincide, mostrar } from '../i18n/diccionario.js';
import Foto from './Foto.jsx';
import { IconoBuscar, IconoCheck, IconoFlecha, IconoPapelera } from './Iconos.jsx';

export default function Articulos({
  articulos, enCompra, busqueda, onBuscar, onACompra, onBorrar, recien,
}) {
  const { t, idioma, rtl } = usarIdioma();

  const visibles = useMemo(() => {
    const comparar = new Intl.Collator(idioma === 'dar' ? 'ar' : 'es', { sensitivity: 'base' });
    return articulos
      .map((articulo) => ({ articulo, texto: mostrar(articulo.nombre, idioma) }))
      .filter(({ articulo }) => coincide(articulo.nombre, busqueda))
      .sort((a, b) => comparar.compare(a.texto.principal, b.texto.principal));
  }, [articulos, busqueda, idioma]);

  return (
    <div>
      {articulos.length >= 6 && (
        <label className="relative mb-4 block">
          <IconoBuscar className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-canela" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            placeholder={t.buscar}
            aria-label={t.buscar}
            className="campo ps-12"
          />
        </label>
      )}

      {articulos.length === 0 && (
        <p className="tarjeta mt-6 p-6 text-center text-nogal">
          <span className="block font-semibold text-cafe">{t.articulosVacios}</span>
          <span className="mt-2 block text-sm">{t.articulosVaciosPista}</span>
        </p>
      )}

      {articulos.length > 0 && visibles.length === 0 && (
        <p className="mt-6 text-center text-nogal">{t.sinResultados}</p>
      )}

      <ul className="space-y-2.5">
        {visibles.map(({ articulo, texto }) => {
          const apuntado = enCompra.has(articulo.id);
          return (
            <li
              key={articulo.id}
              className={`tarjeta flex items-center gap-3 p-2.5 ${articulo.id === recien ? 'animate-destello' : ''}`}
            >
              <Foto articulo={articulo} />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-snug">{texto.principal}</p>
                {/* El nombre original va en el otro alfabeto: `dir="auto"` lo
                    escribe bien, pero hay que alinearlo con el lado de la fila. */}
                {texto.original && (
                  <p dir="auto" className={`truncate text-sm text-canela ${rtl ? 'text-right' : 'text-left'}`}>
                    {texto.original}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onBorrar(articulo)}
                aria-label={`${t.eliminar}: ${texto.principal}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-canela active:bg-avena/40"
              >
                <IconoPapelera className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => onACompra(articulo)}
                aria-label={apuntado ? t.yaEnCompra : `${t.anadirACompra}: ${texto.principal}`}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-arcilla active:translate-y-px ${
                  apuntado ? 'bg-avena text-cafe' : 'bg-nogal text-crema'
                }`}
              >
                {apuntado
                  ? <IconoCheck className="h-6 w-6 animate-sello" />
                  : <IconoFlecha className="voltear h-6 w-6" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

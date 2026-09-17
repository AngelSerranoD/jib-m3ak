/**
 * Jib M3ak — la foto de un artículo.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Mientras el artículo espera en la cola, la foto se ve desde el propio móvil
 * (data URL); en cuanto sube, se ve la de Supabase. `crossOrigin` no es un
 * adorno: sin él la respuesta llega opaca y el service worker no la puede
 * guardar para el supermercado sin cobertura.
 */
import { useState } from 'react';
import { urlFoto } from '../lib/servidor.js';
import { IconoCamara } from './Iconos.jsx';

export default function Foto({ articulo, className = 'h-16 w-16' }) {
  const [rota, setRota] = useState(false);
  const local = articulo.foto_local;

  if (rota && !local) {
    return (
      <div className={`${className} grid shrink-0 place-items-center rounded-2xl bg-avena/50 text-nogal`}>
        <IconoCamara className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={local ?? urlFoto(articulo.id)}
      alt=""
      loading="lazy"
      decoding="async"
      crossOrigin={local ? undefined : 'anonymous'}
      onError={() => setRota(true)}
      className={`${className} shrink-0 rounded-2xl bg-avena/40 object-cover`}
    />
  );
}

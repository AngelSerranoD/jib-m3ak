/**
 * Jib M3ak — el servidor: Supabase (tablas, fotos y cambios en directo).
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Sin cuentas: la app entra siempre como anónima, que es la misma «familia»
 * para todo el mundo que la instale. Lo que puede hacer esa anónima está
 * acotado en la base de datos (ver supabase/migrations).
 *
 * Todo lo que falle por conexión se marca con `clase: ERROR_RED` para que la
 * cola de estado.js lo reintente en vez de darlo por perdido.
 */
import { createClient } from '@supabase/supabase-js';
import { ERROR_RED } from './estado.js';

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL;
const CLAVE_SUPABASE = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hayConfiguracion = Boolean(URL_SUPABASE && CLAVE_SUPABASE);

export const sb = hayConfiguracion
  ? createClient(URL_SUPABASE, CLAVE_SUPABASE, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 4 } },
    })
  : null;

/** La URL pública de la foto de un artículo. Nunca cambia: se puede cachear. */
export const urlFoto = (articuloId) =>
  `${URL_SUPABASE}/storage/v1/object/public/fotos/${articuloId}.jpg`;

/** Un fallo de red se reintenta; uno de la base de datos, no (llegaría igual de mal). */
function traducirError(error, contexto) {
  const mensaje = String(error?.message ?? error);
  const sinCodigo = !error?.code && !error?.statusCode && !error?.status;
  const pareceRed = /fetch|network|timeout|offline|Load failed/i.test(mensaje) || sinCodigo;
  const fallo = new Error(`${contexto}: ${mensaje}`);
  if (pareceRed) fallo.clase = ERROR_RED;
  fallo.causa = error;
  return fallo;
}

const lanzar = (error, contexto) => { if (error) throw traducirError(error, contexto); };

/** data:image/jpeg;base64,… → Blob, sin pasar por fetch() (la CSP no deja data:). */
export function blobDesdeDataUrl(dataUrl) {
  const [cabecera, base64] = String(dataUrl).split(',');
  const tipo = /:(.*?);/.exec(cabecera)?.[1] ?? 'image/jpeg';
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
}

export const servidorSupabase = {
  async leer() {
    const [articulos, compra] = await Promise.all([
      sb.from('articulos').select('id, nombre, creado_en'),
      sb.from('compra').select('id, articulo_id, creado_en'),
    ]);
    lanzar(articulos.error, 'leer artículos');
    lanzar(compra.error, 'leer la compra');
    return { articulos: articulos.data ?? [], compra: compra.data ?? [] };
  },

  async crearArticulo({ id, nombre, fotoLocal }) {
    const { error: errorFoto } = await sb.storage
      .from('fotos')
      .upload(`${id}.jpg`, blobDesdeDataUrl(fotoLocal), {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
        upsert: false,
      });
    // Si ya estaba subida es que este mismo envío se reintentó: se sigue.
    const yaEstaba = /already exists|Duplicate/i.test(String(errorFoto?.message ?? ''));
    if (errorFoto && !yaEstaba) lanzar(errorFoto, 'subir la foto');

    const { error } = await sb.from('articulos').insert({ id, nombre });
    if (error?.code === '23505') return; // ya se había creado en otro intento
    lanzar(error, 'crear el artículo');
  },

  async borrarArticulo({ articuloId }) {
    const { error } = await sb.from('articulos').delete().eq('id', articuloId);
    lanzar(error, 'borrar el artículo');
    // La foto es lo último: si esto falla, solo queda un archivo huérfano.
    await sb.storage.from('fotos').remove([`${articuloId}.jpg`]).catch(() => {});
  },

  async aCompra({ id, articuloId }) {
    const { error } = await sb.from('compra').insert({ id, articulo_id: articuloId });
    if (error?.code === '23505' || error?.code === '23503') return; // ya estaba, o lo borraron
    lanzar(error, 'añadir a la compra');
  },

  async quitarCompra({ id }) {
    const { error } = await sb.from('compra').delete().eq('id', id);
    lanzar(error, 'quitar de la compra');
  },

  async vaciarCompra({ ids }) {
    const { error } = await sb.from('compra').delete().in('id', ids);
    lanzar(error, 'vaciar la compra');
  },
};

/**
 * Escucha los cambios de las dos tablas y avisa (una sola vez por ráfaga).
 * No se mira QUÉ cambió: las listas son pequeñas, se vuelven a leer enteras y
 * así da igual perderse un evento o recibirlo dos veces.
 */
export function escucharCambios(alCambiar) {
  if (!sb) return () => {};
  let temporizador;
  const avisar = () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(alCambiar, 150);
  };

  // Tema único por suscripción: `sb.channel(tema)` devuelve el canal que ya
  // exista con ese nombre, y si aún se está cerrando (removeChannel es
  // asíncrono) añadirle oyentes revienta con «cannot add postgres_changes
  // callbacks after subscribe()». Con un nombre nuevo cada vez, no se cruzan.
  const canal = sb
    .channel(`jibm3ak-cambios-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'articulos' }, avisar)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'compra' }, avisar)
    .subscribe((estado) => {
      // Al (re)conectar puede haberse perdido algo mientras no había red.
      if (estado === 'SUBSCRIBED') avisar();
    });

  return () => {
    clearTimeout(temporizador);
    sb.removeChannel(canal);
  };
}

/** Le dice al service worker que ya puede olvidar la foto de un artículo borrado. */
export function olvidarFotoCacheada(articuloId) {
  const url = urlFoto(articuloId);
  caches?.open('jibm3ak-fotos').then((cache) => cache.delete(url)).catch(() => {});
  navigator.serviceWorker?.controller?.postMessage({ tipo: 'olvidar-foto', url });
}

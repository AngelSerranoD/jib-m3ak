/**
 * Jib M3ak — el estado de las dos listas y la cola de cambios pendientes.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * La compra se hace dentro del supermercado, donde la cobertura es la que es.
 * Así que nada de esperar al servidor: cada cambio se pinta al momento, se
 * apunta en una cola y se manda cuando se pueda. Como los identificadores los
 * pone el móvil (uuid), reenviar una operación dos veces no duplica nada.
 *
 * Aquí no hay React ni Supabase: son funciones puras y un motor con el
 * «servidor» inyectado, para poder probarlo entero sin navegador.
 */

export const ERROR_RED = 'red';

/** Vista = lo último que dijo el servidor + lo que aún no ha salido de este móvil. */
export function aplicarPendientes(base, pendientes) {
  let articulos = [...base.articulos];
  let compra = [...base.compra];

  for (const op of pendientes) {
    switch (op.tipo) {
      case 'crearArticulo': {
        if (!articulos.some((a) => a.id === op.id)) {
          articulos.push({ id: op.id, nombre: op.nombre, creado_en: op.creado_en, foto_local: op.fotoLocal });
        }
        break;
      }
      case 'borrarArticulo': {
        articulos = articulos.filter((a) => a.id !== op.articuloId);
        compra = compra.filter((c) => c.articulo_id !== op.articuloId);
        break;
      }
      case 'aCompra': {
        const existe = compra.some((c) => c.articulo_id === op.articuloId);
        if (!existe && articulos.some((a) => a.id === op.articuloId)) {
          compra.push({ id: op.id, articulo_id: op.articuloId, creado_en: op.creado_en });
        }
        break;
      }
      case 'quitarCompra': {
        compra = compra.filter((c) => c.id !== op.id);
        break;
      }
      case 'vaciarCompra': {
        compra = compra.filter((c) => !op.ids.includes(c.id));
        break;
      }
      default:
        break;
    }
  }

  return { articulos, compra };
}

/**
 * Motor de sincronización.
 *
 * @param servidor  crearArticulo/borrarArticulo/aCompra/quitarCompra/vaciarCompra/leer
 *                  (cada uno lanza un error con `clase === ERROR_RED` si el fallo
 *                  es de conexión: eso reintenta; cualquier otro descarta la operación)
 * @param almacen   dónde sobrevive la cola a que se cierre la app (localStorage)
 * @param alCambiar aviso para repintar
 */
export function crearSincronizador({ servidor, almacen, alCambiar, alError }) {
  let base = almacen.leerBase() ?? { articulos: [], compra: [] };
  let pendientes = (almacen.leerPendientes() ?? []).filter((op) => !op.completada);
  let reloj = 0;
  let enviando = false;
  let hayQueRepetir = false;
  let cargado = false;

  const vista = () => aplicarPendientes(base, pendientes);
  const estado = () => ({
    ...vista(),
    pendientes: pendientes.filter((op) => !op.completada).length,
    cargado,
  });
  const avisar = () => alCambiar?.(estado());

  function guardarPendientes() {
    almacen.guardarPendientes(pendientes.map(({ completada, ...op }) => op));
  }

  function encolar(op) {
    pendientes = [...pendientes, op];
    guardarPendientes();
    avisar();
    enviar();
  }

  /** Trae el estado del servidor y tira las operaciones que ya están allí. */
  async function refrescar() {
    const marca = reloj;
    try {
      base = await servidor.leer();
      cargado = true;
      almacen.guardarBase(base);
      pendientes = pendientes.filter((op) => !(op.completada && op.completada <= marca));
      guardarPendientes();
      avisar();
      return true;
    } catch (error) {
      if (error?.clase !== ERROR_RED) alError?.(error);
      return false;
    }
  }

  /** Vacía la cola en orden. Una sola a la vez: el orden importa. */
  async function enviar() {
    if (enviando) { hayQueRepetir = true; return; }
    enviando = true;
    try {
      let seEnvioAlgo = false;
      for (const op of pendientes) {
        if (op.completada) continue;
        try {
          await servidor[op.tipo](op);
        } catch (error) {
          if (error?.clase === ERROR_RED) return;        // sin red: se queda en la cola
          alError?.(error);                               // culpa nuestra o de otro móvil:
        }                                                 // se da por hecha y se sigue
        op.completada = ++reloj;
        seEnvioAlgo = true;
      }
      if (seEnvioAlgo) await refrescar();
    } finally {
      enviando = false;
      avisar();
      if (hayQueRepetir) { hayQueRepetir = false; enviar(); }
    }
  }

  return {
    vista,
    estado,
    hayPendientes: () => pendientes.some((op) => !op.completada),
    refrescar,
    enviar,

    // La foto viaja como data URL: así sobrevive a que se cierre la app con la
    // cola a medias (un Blob no cabe en localStorage).
    crearArticulo({ id, nombre, fotoLocal }) {
      encolar({ tipo: 'crearArticulo', id, nombre, fotoLocal, creado_en: new Date().toISOString() });
    },
    borrarArticulo(articuloId) {
      encolar({ tipo: 'borrarArticulo', articuloId });
    },
    aCompra(articuloId) {
      encolar({ tipo: 'aCompra', id: crypto.randomUUID(), articuloId, creado_en: new Date().toISOString() });
    },
    quitarCompra(id) {
      encolar({ tipo: 'quitarCompra', id });
    },
    vaciarCompra() {
      const ids = vista().compra.map((c) => c.id);
      if (ids.length) encolar({ tipo: 'vaciarCompra', ids });
    },
  };
}

/** La cola y la última copia de las listas, guardadas en el propio móvil. */
export function crearAlmacenLocal(storage = globalThis.localStorage, clave = 'jibm3ak') {
  const leer = (nombre) => {
    try {
      const crudo = storage?.getItem(`${clave}:${nombre}`);
      return crudo ? JSON.parse(crudo) : null;
    } catch {
      return null;
    }
  };
  const guardar = (nombre, valor) => {
    try {
      storage?.setItem(`${clave}:${nombre}`, JSON.stringify(valor));
    } catch { /* sin sitio o en modo privado: se pierde la copia, no los datos del servidor */ }
  };
  return {
    leerBase: () => leer('base'),
    guardarBase: (base) => guardar('base', base),
    leerPendientes: () => leer('pendientes'),
    guardarPendientes: (pendientes) => guardar('pendientes', pendientes),
  };
}

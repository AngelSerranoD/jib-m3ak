/**
 * Jib M3ak — la app: dos listas, una cámara y un botón de idioma.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Todo lo que se toca se pinta al momento y se manda por detrás (ver
 * lib/estado.js); lo que cambien los demás llega por Realtime.
 */
import { useEffect, useMemo, useState } from 'react';
import { usarIdioma } from './i18n/idioma.jsx';
import { mostrar } from './i18n/diccionario.js';
import { crearAlmacenLocal, crearSincronizador } from './lib/estado.js';
import { escucharCambios, hayConfiguracion, olvidarFotoCacheada, servidorSupabase } from './lib/servidor.js';
import Articulos from './componentes/Articulos.jsx';
import Camara from './componentes/Camara.jsx';
import Compra from './componentes/Compra.jsx';
import Dialogo from './componentes/Dialogo.jsx';
import Instalar from './componentes/Instalar.jsx';
import { Aviso, Cabecera, Estado, Pestanas } from './componentes/Marco.jsx';
import { IconoCamara } from './componentes/Iconos.jsx';

const REINTENTO = 15000;

export default function App() {
  const { t, idioma } = usarIdioma();

  const [sinc] = useState(() => crearSincronizador({
    servidor: servidorSupabase,
    almacen: crearAlmacenLocal(),
    alCambiar: (nuevo) => setDatos(nuevo),
    alError: (fallo) => console.warn('[Jib M3ak]', fallo),
  }));
  const [datos, setDatos] = useState(() => sinc.estado());

  const [pestana, setPestana] = useState('articulos');
  const [busqueda, setBusqueda] = useState('');
  const [camara, setCamara] = useState(false);
  const [pregunta, setPregunta] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [recien, setRecien] = useState(null);
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

  // Leer al entrar, escuchar lo que hagan los demás y volver a mirar cada vez
  // que la app vuelve a primer plano (el móvil corta el socket al bloquearse).
  useEffect(() => {
    if (!hayConfiguracion) return undefined;
    sinc.refrescar();
    const dejarDeEscuchar = escucharCambios(() => sinc.refrescar());
    const alVolver = () => {
      if (document.visibilityState !== 'visible') return;
      sinc.refrescar();
      sinc.enviar();
    };
    const alConectar = () => { setEnLinea(true); sinc.enviar(); sinc.refrescar(); };
    const alDesconectar = () => setEnLinea(false);

    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('online', alConectar);
    window.addEventListener('offline', alDesconectar);
    return () => {
      dejarDeEscuchar();
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('online', alConectar);
      window.removeEventListener('offline', alDesconectar);
    };
  }, [sinc]);

  // Mientras quede algo sin mandar, se reintenta solo.
  useEffect(() => {
    if (!datos.pendientes) return undefined;
    const reloj = setInterval(() => sinc.enviar(), REINTENTO);
    return () => clearInterval(reloj);
  }, [datos.pendientes, sinc]);

  const enCompra = useMemo(() => new Set(datos.compra.map((linea) => linea.articulo_id)), [datos.compra]);

  const compra = useMemo(() => {
    const porId = new Map(datos.articulos.map((articulo) => [articulo.id, articulo]));
    return datos.compra
      .map((linea) => ({ ...linea, articulo: porId.get(linea.articulo_id) }))
      .filter((linea) => linea.articulo)
      .sort((a, b) => String(a.creado_en).localeCompare(String(b.creado_en)));
  }, [datos]);

  function guardarArticulo({ nombre, fotoLocal }) {
    const id = crypto.randomUUID();
    sinc.crearArticulo({ id, nombre, fotoLocal });
    setCamara(false);
    setBusqueda('');
    setPestana('articulos');
    setRecien(id);
    setTimeout(() => setRecien((actual) => (actual === id ? null : actual)), 1600);
  }

  function aCompra(articulo) {
    if (enCompra.has(articulo.id)) {
      setAviso(t.yaEnCompra);
      return;
    }
    sinc.aCompra(articulo.id);
    setAviso(t.anadido);
  }

  function pedirBorrar(articulo) {
    setPregunta({
      titulo: t.borrarTitulo(mostrar(articulo.nombre, idioma).principal),
      texto: t.borrarTexto,
      confirmar: t.borrarSi,
      hacer: () => {
        sinc.borrarArticulo(articulo.id);
        olvidarFotoCacheada(articulo.id);
      },
    });
  }

  function pedirVaciar() {
    setPregunta({
      titulo: t.vaciarTitulo,
      texto: t.vaciarTexto,
      confirmar: t.vaciarSi,
      hacer: () => sinc.vaciarCompra(),
    });
  }

  if (!hayConfiguracion) {
    return (
      <main className="grid min-h-[100dvh] place-items-center p-6 text-center">
        <p className="tarjeta max-w-sm p-6 text-nogal">{t.errorConfig}</p>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col">
      <Cabecera />
      <Estado enLinea={enLinea} pendientes={datos.pendientes} />

      <main className="flex-1 px-4 pb-44 pt-4">
        {pestana === 'articulos' ? (
          <>
            <Instalar />
            {/* Sin red no hay nada que esperar: se enseña lo que haya (o el
                apartado vacío) y arriba ya avisa la banda de «sin conexión». */}
            {!datos.cargado && datos.articulos.length === 0 && enLinea ? (
              <p className="mt-10 text-center text-nogal">{t.cargando}</p>
            ) : (
              <Articulos
                articulos={datos.articulos}
                enCompra={enCompra}
                busqueda={busqueda}
                onBuscar={setBusqueda}
                onACompra={aCompra}
                onBorrar={pedirBorrar}
                recien={recien}
              />
            )}
          </>
        ) : (
          <Compra compra={compra} onQuitar={(id) => sinc.quitarCompra(id)} onVaciar={pedirVaciar} />
        )}
      </main>

      {pestana === 'articulos' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] z-30 mx-auto flex max-w-lg justify-center px-4">
          <button
            type="button"
            onClick={() => setCamara(true)}
            className="boton pointer-events-auto flex items-center gap-2.5 px-6 py-3.5 shadow-flotante"
          >
            <IconoCamara className="h-6 w-6" />
            {t.anadirArticulo}
          </button>
        </div>
      )}

      <Pestanas activa={pestana} onCambiar={setPestana} cuantos={compra.length} />

      {camara && <Camara onGuardar={guardarArticulo} onCerrar={() => setCamara(false)} />}

      {pregunta && (
        <Dialogo
          titulo={pregunta.titulo}
          texto={pregunta.texto}
          confirmar={pregunta.confirmar}
          onCancelar={() => setPregunta(null)}
          onConfirmar={() => { pregunta.hacer(); setPregunta(null); }}
        />
      )}

      {aviso && <Aviso mensaje={aviso} onFin={() => setAviso(null)} />}
    </div>
  );
}

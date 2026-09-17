/**
 * Jib M3ak — la cámara y el «¿cómo se llama esto?».
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Al pulsar «Añadir artículo» se abre esto directamente: cámara a pantalla
 * completa con un marco cuadrado (lo que se ve dentro es lo que se guarda).
 * Al disparar, la foto ENCOGE desde ese marco hasta su sitio en el diálogo del
 * nombre: la animación se calcula midiendo los dos rectángulos, así que sale
 * bien en cualquier pantalla.
 *
 * Si el navegador no deja abrir la cámara (permiso denegado, o un navegador
 * raro), queda la cámara nativa del móvil por `<input capture>`.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usarIdioma } from '../i18n/idioma.jsx';
import { sugerir } from '../i18n/diccionario.js';
import { abrirCamara, capturarDeArchivo, capturarDelVideo, cerrarCamara } from '../lib/foto.js';
import { IconoCerrar } from './Iconos.jsx';

const menosMovimiento = () =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function ladoDelVisor() {
  const { innerWidth: ancho, innerHeight: alto } = window;
  return Math.round(Math.min(ancho - 40, alto * 0.56));
}

export default function Camara({ onGuardar, onCerrar }) {
  const { t, idioma } = usarIdioma();
  const [fase, setFase] = useState('abriendo'); // abriendo · viendo · sinCamara · nombrando
  const [motivo, setMotivo] = useState(null);
  const [foto, setFoto] = useState(null);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState(null);
  const [lado, setLado] = useState(ladoDelVisor);

  const video = useRef(null);
  const visor = useRef(null);
  const miniatura = useRef(null);
  const entrada = useRef(null);
  const archivo = useRef(null);
  const stream = useRef(null);
  const desde = useRef(null); // rectángulo del que sale la animación

  useEffect(() => {
    const alRedimensionar = () => setLado(ladoDelVisor());
    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, []);

  // La cámara se abre al montar y se cierra al salir: mientras esté encendida,
  // el móvil enseña su aviso de «cámara en uso», y eso no se deja colgado.
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const medios = await abrirCamara();
        if (!vivo) { cerrarCamara(medios); return; }
        stream.current = medios;
        if (video.current) {
          video.current.srcObject = medios;
          await video.current.play().catch(() => {});
        }
        setFase('viendo');
      } catch (fallo) {
        if (!vivo) return;
        setMotivo(fallo.motivo ?? 'sin-camara');
        setFase('sinCamara');
      }
    })();
    return () => { vivo = false; cerrarCamara(stream.current); stream.current = null; };
  }, []);

  // La foto encoge desde el marco de la cámara hasta el hueco del diálogo.
  useLayoutEffect(() => {
    if (fase !== 'nombrando' || !miniatura.current) return undefined;
    const enfocar = setTimeout(() => entrada.current?.focus(), menosMovimiento() ? 0 : 460);
    if (!desde.current || menosMovimiento()) return () => clearTimeout(enfocar);

    const hasta = miniatura.current.getBoundingClientRect();
    const escala = desde.current.width / hasta.width;
    const dx = desde.current.left + desde.current.width / 2 - (hasta.left + hasta.width / 2);
    const dy = desde.current.top + desde.current.height / 2 - (hasta.top + hasta.height / 2);
    miniatura.current.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${escala})`, borderRadius: '24px' },
        { transform: 'none', borderRadius: '24px' },
      ],
      { duration: 420, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' }
    );
    return () => clearTimeout(enfocar);
  }, [fase]);

  const sugerencias = useMemo(() => sugerir(nombre, idioma), [nombre, idioma]);

  function disparar() {
    try {
      const marco = visor.current.getBoundingClientRect();
      const pantalla = video.current.getBoundingClientRect();
      const dataUrl = capturarDelVideo(video.current, {
        x: marco.left - pantalla.left,
        y: marco.top - pantalla.top,
        lado: marco.width,
      });
      desde.current = marco;
      setFoto(dataUrl);
      setError(null);
      setFase('nombrando');
    } catch {
      setError(t.fotoError);
    }
  }

  async function desdeArchivo(evento) {
    const elegido = evento.target.files?.[0];
    evento.target.value = '';
    if (!elegido) return;
    try {
      const dataUrl = await capturarDeArchivo(elegido);
      desde.current = null;
      setFoto(dataUrl);
      setError(null);
      setFase('nombrando');
    } catch {
      setError(t.fotoError);
    }
  }

  function repetir() {
    setFoto(null);
    setNombre('');
    setError(null);
    setFase(stream.current ? 'viendo' : 'sinCamara');
  }

  function aceptar() {
    const limpio = nombre.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!limpio) { setError(t.nombreVacio); entrada.current?.focus(); return; }
    onGuardar({ nombre: limpio, fotoLocal: foto });
  }

  return (
    <div className="fixed inset-0 z-50 bg-cafe text-crema sin-seleccion">
      <video
        ref={video}
        playsInline
        muted
        autoPlay
        className={`h-full w-full object-cover ${fase === 'viendo' ? 'opacity-100' : 'opacity-0'}`}
      />
      <input
        ref={archivo}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={desdeArchivo}
      />

      {fase !== 'nombrando' && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              ref={visor}
              style={{ width: lado, height: lado }}
              className="rounded-3xl border-2 border-crema/80 shadow-[0_0_0_9999px_rgba(62,46,34,0.6)]"
            />
          </div>

          <p className="absolute inset-x-0 top-0 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-center text-lg font-semibold drop-shadow">
            {t.camaraTitulo}
          </p>

          <button
            type="button"
            onClick={onCerrar}
            aria-label={t.cerrar}
            className="absolute top-[calc(env(safe-area-inset-top)+1rem)] end-4 grid h-11 w-11 place-items-center rounded-full bg-cafe/60 text-crema"
          >
            <IconoCerrar className="h-6 w-6" />
          </button>

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
            {error && <p className="rounded-2xl bg-cafe/80 px-4 py-2 text-sm">{error}</p>}

            {fase === 'sinCamara' ? (
              <div className="mx-5 max-w-sm rounded-3xl bg-cafe/85 p-5 text-center">
                <p className="font-semibold">{t.camaraNoVa}</p>
                {motivo === 'sin-permiso' && <p className="mt-2 text-sm text-crema/85">{t.camaraPermiso}</p>}
                <button type="button" className="boton mt-4 w-full" onClick={() => archivo.current?.click()}>
                  {t.camaraDelMovil}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={disparar}
                disabled={fase !== 'viendo'}
                aria-label={t.hacerFoto}
                className="h-20 w-20 rounded-full border-[5px] border-crema bg-crema/25 backdrop-blur-sm active:scale-95 disabled:opacity-40"
              />
            )}
          </div>
        </>
      )}

      {fase === 'nombrando' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-y-auto bg-cafe/85 px-5 py-8 backdrop-blur-sm">
          <img
            ref={miniatura}
            src={foto}
            alt=""
            className="h-40 w-40 shrink-0 rounded-3xl object-cover shadow-flotante"
          />

          <div className="tarjeta w-full max-w-sm p-5 text-cafe">
            <h2 className="text-center text-lg font-semibold">{t.ponerNombre}</h2>
            <input
              ref={entrada}
              className="campo mt-4"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') aceptar(); }}
              placeholder={t.nombreEjemplo}
              maxLength={60}
              enterKeyHint="done"
              autoComplete="off"
              aria-label={t.ponerNombre}
            />

            {sugerencias.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {sugerencias.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => { setNombre(sugerencia); setError(null); }}
                    className="rounded-full border border-avena bg-crema px-3 py-1.5 text-sm text-nogal"
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="mt-3 text-sm font-semibold text-nogal">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button type="button" className="boton-suave flex-1" onClick={repetir}>{t.repetirFoto}</button>
              <button type="button" className="boton flex-1" onClick={aceptar}>{t.aceptar}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Jib M3ak — el recordatorio de instalar la app en la pantalla de inicio.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * En Android el navegador ofrece instalarla (beforeinstallprompt); en iPhone no
 * existe esa ventana, así que se explica el camino de «Compartir». Se enseña
 * una vez y, si la cierras, no vuelve.
 */
import { useEffect, useState } from 'react';
import { usarIdioma } from '../i18n/idioma.jsx';
import { IconoCerrar } from './Iconos.jsx';

const CLAVE = 'jibm3ak:instalar-visto';

const yaInstalada = () =>
  globalThis.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;

export default function Instalar() {
  const { t } = usarIdioma();
  const [oculto, setOculto] = useState(() => {
    try { return yaInstalada() || localStorage.getItem(CLAVE) === 'si'; } catch { return yaInstalada(); }
  });
  const [oferta, setOferta] = useState(null);

  useEffect(() => {
    const alOfrecer = (evento) => { evento.preventDefault(); setOferta(evento); };
    window.addEventListener('beforeinstallprompt', alOfrecer);
    return () => window.removeEventListener('beforeinstallprompt', alOfrecer);
  }, []);

  if (oculto) return null;

  const cerrar = () => {
    setOculto(true);
    try { localStorage.setItem(CLAVE, 'si'); } catch { /* se volverá a ver, tampoco pasa nada */ }
  };

  return (
    <aside className="tarjeta relative mb-4 p-4 pe-10 text-sm">
      <button
        type="button"
        onClick={cerrar}
        aria-label={t.ahoraNo}
        className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-xl text-canela"
      >
        <IconoCerrar className="h-4 w-4" />
      </button>
      <p className="font-semibold">{t.instalarTitulo}</p>
      {oferta ? (
        <button
          type="button"
          className="boton mt-3 w-full py-2.5 text-sm"
          onClick={async () => { oferta.prompt(); await oferta.userChoice.catch(() => {}); cerrar(); }}
        >
          {t.instalar}
        </button>
      ) : (
        <ul className="mt-2 space-y-1 text-nogal">
          <li>{t.instalarIphone}</li>
          <li>{t.instalarAndroid}</li>
        </ul>
      )}
    </aside>
  );
}

/**
 * Jib M3ak — la pregunta antes de borrar algo.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * El foco arranca SIEMPRE en «Cancelar»: un toque de más no puede vaciarle la
 * compra a media familia.
 */
import { useEffect, useRef } from 'react';
import { usarIdioma } from '../i18n/idioma.jsx';

export default function Dialogo({ titulo, texto, confirmar, onConfirmar, onCancelar }) {
  const { t } = usarIdioma();
  const cancelar = useRef(null);

  useEffect(() => {
    cancelar.current?.focus();
    const alTeclear = (evento) => { if (evento.key === 'Escape') onCancelar(); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [onCancelar]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-cafe/60 p-4 pb-8 animate-fundido sm:items-center"
      onClick={(evento) => { if (evento.target === evento.currentTarget) onCancelar(); }}
    >
      <div role="dialog" aria-modal="true" aria-label={titulo} className="tarjeta w-full max-w-sm animate-subir p-6">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <p className="mt-2 text-nogal">{texto}</p>
        <div className="mt-6 flex gap-3">
          <button ref={cancelar} type="button" className="boton-suave flex-1" onClick={onCancelar}>
            {t.cancelar}
          </button>
          <button type="button" className="boton flex-1" onClick={onConfirmar}>
            {confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

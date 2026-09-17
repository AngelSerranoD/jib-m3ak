/**
 * Jib M3ak — registro del service worker.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * La CSP exige Trusted Types y register() es un destino protegido: la URL pasa
 * por la política 'jibm3ak-sw', que solo admite /sw.js.
 */
export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  let url = '/sw.js';
  if (window.trustedTypes?.createPolicy) {
    const politica = window.trustedTypes.createPolicy('jibm3ak-sw', {
      createScriptURL(valor) {
        if (valor !== '/sw.js') throw new TypeError('URL de service worker no permitida');
        return valor;
      },
    });
    url = politica.createScriptURL('/sw.js');
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(url, { scope: '/' }).catch(() => {});
  });
}

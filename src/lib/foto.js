/**
 * Jib M3ak — la foto del artículo, preparada en el propio móvil.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Se recorta en cuadrado y se baja a 480 px en JPEG: unos 45 kB en vez de los
 * 3 MB que pesa una foto de móvil. Así sube con mala cobertura, cabe en el
 * bucket (tope de 1 MB) y se puede guardar en la cola mientras no haya red.
 *
 * Sale como data URL, no como Blob, porque la cola vive en localStorage.
 */

const LADO = 480;
const CALIDAD = 0.82;

function lienzoCuadrado() {
  const lienzo = document.createElement('canvas');
  lienzo.width = LADO;
  lienzo.height = LADO;
  const ctx = lienzo.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { lienzo, ctx };
}

const aDataUrl = (lienzo) => lienzo.toDataURL('image/jpeg', CALIDAD);

/**
 * Recorta del vídeo el cuadrado que el usuario ve en el visor.
 *
 * El vídeo se pinta con `object-fit: cover`, así que en pantalla se ve un trozo
 * ampliado y centrado: hay que deshacer ese encuadre para saber qué píxeles del
 * fotograma caen dentro del marco. Si no, la foto sale descuadrada.
 *
 * @param video   elemento <video> en marcha
 * @param visor   marco cuadrado en coordenadas del elemento: { x, y, lado }
 */
export function capturarDelVideo(video, visor) {
  const anchoReal = video.videoWidth;
  const altoReal = video.videoHeight;
  if (!anchoReal || !altoReal) throw new Error('el vídeo todavía no tiene imagen');

  const { clientWidth: ancho, clientHeight: alto } = video;
  const escala = Math.max(ancho / anchoReal, alto / altoReal);
  const margenX = (ancho - anchoReal * escala) / 2;
  const margenY = (alto - altoReal * escala) / 2;

  const lado = Math.min(visor.lado / escala, anchoReal, altoReal);
  const x = Math.max(0, Math.min((visor.x - margenX) / escala, anchoReal - lado));
  const y = Math.max(0, Math.min((visor.y - margenY) / escala, altoReal - lado));

  const { lienzo, ctx } = lienzoCuadrado();
  ctx.drawImage(video, x, y, lado, lado, 0, 0, LADO, LADO);
  return aDataUrl(lienzo);
}

/** Carga una imagen de archivo (cámara nativa o galería) y la recorta al centro. */
export async function capturarDeArchivo(archivo) {
  if (!archivo?.type?.startsWith('image/')) throw new Error('eso no es una imagen');
  const url = URL.createObjectURL(archivo);
  try {
    const imagen = await new Promise((resolver, rechazar) => {
      const img = new Image();
      img.onload = () => resolver(img);
      img.onerror = () => rechazar(new Error('no se ha podido leer la imagen'));
      img.src = url;
    });
    const lado = Math.min(imagen.naturalWidth, imagen.naturalHeight);
    const { lienzo, ctx } = lienzoCuadrado();
    ctx.drawImage(
      imagen,
      (imagen.naturalWidth - lado) / 2,
      (imagen.naturalHeight - lado) / 2,
      lado,
      lado,
      0, 0, LADO, LADO
    );
    return aDataUrl(lienzo);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Abre la cámara trasera. Devuelve el stream o lanza un error con `motivo`. */
export async function abrirCamara() {
  if (!navigator.mediaDevices?.getUserMedia) {
    const error = new Error('este navegador no abre la cámara');
    error.motivo = 'sin-camara';
    throw error;
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false,
    });
  } catch (error) {
    const fallo = new Error('no se ha podido abrir la cámara');
    fallo.motivo = /NotAllowed|Security/i.test(error?.name ?? '') ? 'sin-permiso' : 'sin-camara';
    fallo.causa = error;
    throw fallo;
  }
}

export function cerrarCamara(stream) {
  stream?.getTracks().forEach((pista) => pista.stop());
}

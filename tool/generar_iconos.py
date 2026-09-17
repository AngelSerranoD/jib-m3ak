"""
Jib M3ak — genera los iconos de la PWA a partir del original.
Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.

El original es una MONEDA redonda sobre fondo transparente. Un icono de app es
un cuadrado (iOS y Android le aplican después su propia máscara), así que:

  1. se mide el disco por su canal alfa,
  2. se recorta el interior, dejando fuera el bisel del borde,
  3. ese interior se pega, con máscara circular difuminada, sobre un cuadrado
     del mismo color de fondo que el disco.

Así el dibujo del carrito llena el icono y no queda una moneda pequeña con
esquinas vacías.

Uso:  python tool/generar_iconos.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "assets" / "icono-original.png"
DESTINO = RAIZ / "public" / "icons"
MAESTRO = RAIZ / "assets" / "icono-1024.png"

TAMANOS = (32, 152, 167, 180, 192, 512)
ZONA_SEGURA_MASKABLE = 0.80   # Android recorta hasta un círculo del 80 %
BISEL = 14                    # píxeles del borde que se tiran (el brillo del canto)
CREMA = (237, 228, 211)       # #EDE4D3, el fondo de la app


def disco(img):
    """Caja del disco medida en la fila y la columna centrales del alfa."""
    alfa = img.getchannel("A")
    ancho, alto = img.size
    fila = [x for x in range(ancho) if alfa.getpixel((x, alto // 2)) >= 250]
    columna = [y for y in range(alto) if alfa.getpixel((ancho // 2, y)) >= 250]
    return fila[0], columna[0], fila[-1] + 1, columna[-1] + 1


def color_fondo(interior):
    """Mediana de una franja del borde superior del disco, donde no hay dibujo."""
    ancho, alto = interior.size
    trozo = interior.convert("RGB").crop((ancho // 3, 6, ancho // 3 * 2, 6 + alto // 12))
    canales = list(zip(*trozo.getdata()))
    return tuple(sorted(c)[len(c) // 2] for c in canales)


def main():
    img = Image.open(ORIGEN).convert("RGBA")
    izq, arriba, der, abajo = disco(img)
    caja = (izq + BISEL, arriba + BISEL, der - BISEL, abajo - BISEL)
    interior = img.crop(caja)
    lado = min(interior.size)
    interior = interior.crop((0, 0, lado, lado))
    fondo = color_fondo(interior)
    print(f"disco {(izq, arriba, der, abajo)}, interior {lado}x{lado}, fondo {fondo}")

    # El interior es un círculo: se pega sobre el cuadrado con una máscara
    # redonda difuminada, y las esquinas se quedan del color del propio disco.
    mascara = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(mascara).ellipse((2, 2, lado - 3, lado - 3), fill=255)
    mascara = mascara.filter(ImageFilter.GaussianBlur(2.5))

    cuadrado = Image.new("RGB", (lado, lado), fondo)
    cuadrado.paste(interior.convert("RGB"), (0, 0), mascara)
    maestro = cuadrado.resize((1024, 1024), Image.LANCZOS)
    maestro.save(MAESTRO)

    DESTINO.mkdir(parents=True, exist_ok=True)
    for tamano in TAMANOS:
        maestro.resize((tamano, tamano), Image.LANCZOS).save(DESTINO / f"icon-{tamano}.png", optimize=True)

    # Android recorta en círculo: el dibujo se mete dentro de la zona segura.
    maskable = Image.new("RGB", (1024, 1024), fondo)
    dentro = round(1024 * ZONA_SEGURA_MASKABLE)
    desplazamiento = (1024 - dentro) // 2
    maskable.paste(maestro.resize((dentro, dentro), Image.LANCZOS), (desplazamiento, desplazamiento))
    maskable.resize((512, 512), Image.LANCZOS).save(DESTINO / "maskable-512.png", optimize=True)

    # Vista previa para WhatsApp (Open Graph): la moneda entera sobre crema.
    og = Image.new("RGB", (1200, 630), CREMA)
    moneda = img.crop((izq, arriba, der, abajo)).resize((560, 560), Image.LANCZOS)
    og.paste(moneda, (320, 35), moneda)
    og.save(DESTINO / "og.png", optimize=True)

    img.save(RAIZ / "public" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("iconos generados en", DESTINO)


if __name__ == "__main__":
    main()

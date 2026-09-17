# Jib M3ak · جِيبْ مْعَاكْ

**La lista de la compra de la familia, con fotos.** Haces la foto del artículo,
le pones nombre y se queda guardado para siempre; cuando falte, la flechita lo
manda a la lista de la compra, que ven todos los móviles de casa a la vez.

Toda la app se lee en **español** o en **darija marroquí** (en árabe y con
tashkil) con un botón, y los nombres de los artículos se traducen solos en los
dos sentidos: 228 productos de la compra y un pequeño compositor de frases, así
que «zumo de naranja» sale como «عْصِيرْ دْ لِيمُونْ» sin pedirle nada a nadie.

> Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
> Consulta `LICENSE`: el código se puede leer, no reutilizar.

## Cómo funciona

- **Artículos** — «Añadir artículo» abre la cámara directamente. Al disparar, la
  foto encoge hasta el diálogo de «Asigna un nombre a este artículo». Cada
  artículo se queda aquí para siempre; se puede borrar uno a uno.
- **Compra** — lo que se ha mandado con la flecha. Se va tachando mientras se
  compra, o se vacía entero con «Todo comprado». Los artículos no se borran.
- **Sin cuentas**: quien instala la app comparte lista con el resto de la
  familia. No hay registro ni contraseñas.
- **Sin cobertura**: todo lo que se toca se guarda en el móvil y se manda solo
  cuando vuelve la red. Las fotos también se guardan para verlas sin conexión.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y pega la URL y la clave publicable de Supabase
npm run dev
npm test                     # 59 pruebas: esquema, cola offline, traducción y paleta
npm run build
```

`npm run iconos` regenera los iconos de la PWA desde `assets/icono-original.png`
(necesita Pillow).

## Cómo está hecha

| Pieza | Dónde |
|---|---|
| Base de datos, permisos y fotos | `supabase/migrations/` |
| Servidor (Supabase, Realtime, Storage) | `src/lib/servidor.js` |
| Cola de cambios y estado | `src/lib/estado.js` |
| Cámara y recorte cuadrado | `src/lib/foto.js`, `src/componentes/Camara.jsx` |
| Español ⇄ darija (diccionario, frases y transcripción) | `src/i18n/` |
| Funcionamiento sin red e instalación | `public/sw.js`, `public/manifest.webmanifest` |

React 19 · Vite · Tailwind · Supabase (Postgres + Storage + Realtime).
PWA instalable en Android y iPhone, con CSP estricta y Trusted Types.

## Lo que conviene saber

- La lista es **abierta a propósito**: la clave de Supabase va en la app, así
  que cualquiera que tenga la dirección web puede ver y cambiar la lista. Para
  una familia y una lista de la compra es el equilibrio que se buscó (cero
  fricción); si algún día hace falta, se le puede poner un código de familia.
- La base de datos solo permite lo justo: crear, leer y borrar. Nada de
  modificar, nada de falsear fechas, fotos solo JPEG de menos de 1 MB y con el
  nombre del artículo al que pertenecen.
- La darija está escrita con tashkil a mano, revisable por quien la hable: está
  toda junta en `src/i18n/textos.js` y `src/i18n/diccionario.js`.

## Cómo traduce (sin APIs ni conexión)

No existe un «paquete de idioma» de darija: ningún traductor offline (Bergamot,
Argos…) la soporta. Así que el traductor va dentro de la app, en dos capas:

1. **Diccionario de la compra**: 228 productos y 46 modificadores, con el
   género de cada palabra en los dos idiomas. Reconoce plurales, tildes,
   artículos, y en árabe da igual el tashkil o el «ال».
2. **Compositor de frases**: cuando el nombre entero no está, se arma palabra a
   palabra («leche sin lactosa» → «حْلِيبْ بْلَا لَاكْتُوزْ»), con los adjetivos
   concordando en género.
3. **Transcripción** (`src/i18n/transliteracion.js`): lo que no se puede
   traducir —marcas, sobre todo— se escribe con el otro alfabeto y vocalizado:
   «Nocilla» → «نُوسِيَا», «Puleva» → «پُولِيبَا». No es una traducción, es que
   en esta familia hay quien **solo lee árabe**, y una marca en letras latinas
   no la puede ni deletrear; así la lee en alto y la reconoce en el lineal. El
   nombre original se queda debajo, en pequeño, para los demás.

Resultado: en darija nunca queda una palabra en letras latinas. El español se
presta a esto porque se lee como se escribe; las reglas (ch, ll, ñ, la c y la g
según la vocal, la h muda) están en el propio archivo.

Las entradas están escritas a mano y contrastadas con las dos fuentes abiertas
que existen: el [Darija Open Dataset](https://github.com/darija-open-dataset/dataset)
(CC BY-NC 4.0) y las etiquetas `ary` de [Wikidata](https://www.wikidata.org)
(CC0). No se distribuye ninguno de esos conjuntos de datos: se usaron para
verificar el vocabulario (gracias a ellos, por ejemplo, el calabacín dejó de
ser قَرْعَة, que es la calabaza, y pasó a ser كُورْجِيطْ).

/**
 * Jib M3ak — pasar una palabra de un alfabeto al otro (no es traducir).
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Hay quien en la familia SOLO lee árabe. Para esa persona, «Nocilla» escrito
 * en letras latinas no es una palabra difícil: es un dibujo. Así que lo que no
 * está en el diccionario (marcas, sobre todo) se escribe con letras árabes y
 * con tashkil, para que pueda leerlo en alto y reconocerlo: «نُوسِيَا».
 *
 * Y al revés: una palabra en árabe que no esté en el diccionario se pasa a
 * letras latinas, para que quien no lee árabe pueda pronunciarla.
 *
 * El español se presta a esto porque se lee como se escribe; las pocas reglas
 * que tiene (ch, ll, ñ, la c y la g según la vocal, la h muda) están abajo.
 */

// ───────── Español → árabe ─────────

const CONSONANTES = {
  b: 'ب', v: 'ب', d: 'د', f: 'ف', j: 'خ', k: 'ك', l: 'ل', m: 'م', n: 'ن',
  p: 'پ', r: 'ر', s: 'س', t: 'ت', w: 'و', y: 'ي', z: 'ز',
};

// Vocal → [haraka, letra larga]. En darija la e y la i se escriben igual,
// y la o y la u también: es como suenan ahí.
const VOCALES = {
  a: ['\u064E', 'ا'],
  e: ['\u0650', 'ي'],
  i: ['\u0650', 'ي'],
  o: ['\u064F', 'و'],
  u: ['\u064F', 'و'],
};

// Vocal al principio de palabra: hace falta un soporte donde apoyar la haraka.
const VOCAL_INICIAL = { a: 'أ\u064E', e: 'إ\u0650ي', i: 'إ\u0650ي', o: 'أ\u064Fو', u: 'أ\u064Fو' };

const SUKUN = '\u0652';
const SHADDA = '\u0651';

const esVocal = (letra) => letra in VOCALES;

/** Quita tildes y deja la ñ, que sí dice algo. */
const sinTildes = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036F]/g, (marca, posicion, cadena) =>
    cadena[posicion - 1] === 'n' && marca === '\u0303' ? marca : '')
    .normalize('NFC');

/**
 * Parte una palabra española en sonidos: cada uno es una consonante árabe o
 * una vocal. Aquí es donde viven las reglas raras del español.
 */
function sonidos(palabra) {
  const letras = sinTildes(palabra.toLowerCase());
  const salida = [];

  for (let i = 0; i < letras.length; i += 1) {
    const letra = letras[i];
    const siguiente = letras[i + 1] ?? '';
    const palatal = siguiente === 'e' || siguiente === 'i';

    if (esVocal(letra)) { salida.push({ vocal: letra }); continue; }

    switch (letra) {
      case 'h': // muda, salvo en «ch»
        break;
      case 'c':
        if (siguiente === 'h') { salida.push({ consonante: 'ش' }); i += 1; }
        else salida.push({ consonante: palatal ? 'س' : 'ك' });
        break;
      case 'q': // «que», «qui»: la u no suena
        salida.push({ consonante: 'ك' });
        if (siguiente === 'u') i += 1;
        break;
      case 'g':
        if (palatal) { salida.push({ consonante: 'خ' }); break; }
        salida.push({ consonante: 'ݣ' });
        // «gue»/«gui»: la u tampoco suena; «gua»/«guo» sí.
        if (siguiente === 'u') {
          const tercera = letras[i + 2] ?? '';
          if (tercera === 'e' || tercera === 'i') i += 1;
        }
        break;
      case 'l':
        if (siguiente === 'l') { salida.push({ consonante: 'ي' }); i += 1; }
        else salida.push({ consonante: 'ل' });
        break;
      case 'r':
        if (siguiente === 'r') { salida.push({ consonante: 'ر', doble: true }); i += 1; }
        else salida.push({ consonante: 'ر' });
        break;
      case 'ñ':
        salida.push({ consonante: 'ن' }, { consonante: 'ي' });
        break;
      case 'x':
        salida.push({ consonante: 'ك' }, { consonante: 'س' });
        break;
      default:
        if (CONSONANTES[letra]) salida.push({ consonante: CONSONANTES[letra] });
        // Cifras, signos y emojis se quedan como están: se leen igual en los
        // dos alfabetos. Las comillas sí se tiran, que en árabe estorban.
        else if (!/['"`´]/.test(letra)) salida.push({ literal: letra });
        break;
    }
  }
  // Dos consonantes iguales seguidas son una sola con shadda («crackers»).
  return salida.filter((pieza, i) => {
    const anterior = salida[i - 1];
    if (!pieza.consonante || anterior?.consonante !== pieza.consonante) return true;
    anterior.doble = true;
    return false;
  });
}

/** Una palabra española escrita con letras árabes y vocalizada. */
export function aArabe(palabra) {
  const piezas = sonidos(palabra);
  if (!piezas.length) return palabra;

  let salida = '';
  for (let i = 0; i < piezas.length; i += 1) {
    const pieza = piezas[i];

    if (pieza.literal) { salida += pieza.literal; continue; }

    if (pieza.vocal) {
      // Al principio de la palabra hace falta un soporte; pegada a otra vocal
      // («cacao», «pascual») basta con su letra larga. El resto de vocales van
      // con su consonante, más abajo.
      salida += i === 0 ? VOCAL_INICIAL[pieza.vocal] : VOCALES[pieza.vocal][1];
      continue;
    }

    salida += pieza.consonante + (pieza.doble ? SHADDA : '');
    const despues = piezas[i + 1];
    if (despues?.vocal) {
      const [haraka, larga] = VOCALES[despues.vocal];
      salida += haraka;
      // Si la letra larga es la misma que la consonante que viene detrás, se
      // deja solo la haraka: «nocilla» es نُوسِيَا, no نُوسِييَا.
      if (piezas[i + 2]?.consonante !== larga) salida += larga;
      i += 1;
    } else {
      salida += SUKUN;
    }
  }
  return salida;
}

// ───────── Árabe → español ─────────

const LETRAS_LATINAS = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'z', 'ج': 'y',
  'ح': 'h', 'خ': 'j', 'د': 'd', 'ذ': 'd', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'ch',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'd', 'ع': 'a', 'غ': 'g', 'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'ة': 'a', 'و': 'u', 'ي': 'i',
  'ى': 'a', 'ء': '', 'ݣ': 'g', 'گ': 'g', 'پ': 'p', 'ڤ': 'v',
};

const HARAKAS = { '\u064E': 'a', '\u0650': 'i', '\u064F': 'u', '\u064B': 'an', '\u064D': 'in', '\u064C': 'un' };

/** Una palabra árabe escrita con letras latinas, aprovechando su tashkil. */
export function aLatino(palabra) {
  let salida = '';
  let consonante = { letra: '', hasta: 0 }; // la \u00faltima, para poder doblarla

  for (let i = 0; i < palabra.length; i += 1) {
    const letra = palabra[i];
    if (letra === SUKUN || letra === '\u0670' || letra === '\u0640') continue;
    if (letra === SHADDA) {
      // La shadda dobla la consonante, y se escribe unas veces antes de la
      // vocal y otras despu\u00e9s: se dobla donde estaba, no al final.
      if (consonante.letra) {
        salida = salida.slice(0, consonante.hasta) + consonante.letra + salida.slice(consonante.hasta);
        consonante.hasta += consonante.letra.length;
      }
      continue;
    }
    if (HARAKAS[letra]) {
      // La vocal ya viene escrita si detrás hay una letra larga («و» tras damma).
      const larga = { a: 'ا', i: 'ي', u: 'و' }[HARAKAS[letra]];
      if (palabra[i + 1] === larga) { salida += HARAKAS[letra]; i += 1; continue; }
      salida += HARAKAS[letra];
      continue;
    }
    const latina = LETRAS_LATINAS[letra] ?? letra;
    salida += latina;
    consonante = { letra: latina, hasta: salida.length };
  }
  // Dos vocales iguales seguidas salen de la letra larga + su haraka: sobra una.
  return salida
    .replace(/aa+/g, 'a')
    .replace(/ii+/g, 'i')
    .replace(/uu+/g, 'u')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Escribe una palabra con el alfabeto del idioma pedido. */
export const transcribir = (palabra, idioma) => (idioma === 'dar' ? aArabe(palabra) : aLatino(palabra));

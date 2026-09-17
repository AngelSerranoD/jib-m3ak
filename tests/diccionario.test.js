/**
 * Jib M3ak — el traductor de nombres de artículos.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ARTICULOS_CONOCIDOS, coincide, componer, mostrar, normalizarArabe, normalizarEspanol, sugerir, traducir,
} from '../src/i18n/diccionario.js';

const TASHKIL = /[\u064B-\u0652\u0670]/;

describe('encontrar el artículo, se escriba como se escriba', () => {
  test('en español: mayúsculas, tildes, artículos y plurales', () => {
    for (const escrito of ['leche', 'LECHE', 'La leche', 'Leches']) {
      assert.equal(traducir(escrito)?.dar, 'حْلِيبْ', `no reconoce «${escrito}»`);
    }
    assert.equal(traducir('Limones')?.es, 'Limón', 'singular y plural son el mismo artículo');
    assert.equal(traducir('Tomates')?.es, 'Tomate');
  });

  test('en darija: con o sin vocales, con o sin «ال»', () => {
    for (const escrito of ['حْلِيبْ', 'حليب', 'الحليب']) {
      assert.equal(traducir(escrito)?.es, 'Leche', `no reconoce «${escrito}»`);
    }
  });

  test('lo que no está en el diccionario no se inventa', () => {
    assert.equal(traducir('Colacao'), null);
    assert.equal(traducir(''), null);
  });
});

describe('cómo se enseña cada nombre', () => {
  test('lo escrito en el otro idioma se traduce y se deja el original debajo', () => {
    assert.deepEqual(mostrar('Leche', 'dar'), { principal: 'حْلِيبْ', original: 'Leche', traducido: true });
    assert.deepEqual(mostrar('حليب', 'es'), { principal: 'Leche', original: 'حليب', traducido: true });
  });

  test('lo escrito en el idioma de la app se deja tal cual', () => {
    assert.deepEqual(mostrar('Leche', 'es'), { principal: 'Leche', original: null, traducido: false });
  });

  test('una marca no se traduce, pero se escribe para que se pueda leer', () => {
    // En esta familia hay quien solo lee árabe: «Colacao» en letras latinas no
    // le dice nada, así que se transcribe. El original se queda debajo.
    assert.deepEqual(mostrar('Colacao', 'dar'), { principal: 'كُولَاكَاو', original: 'Colacao', traducido: true });
    assert.equal(mostrar('Leche Puleva sin lactosa', 'dar').principal, 'حْلِيبْ پُولِيبَا بْلَا لَاكْتُوزْ');
  });
});

describe('frases armadas palabra a palabra', () => {
  test('el «de» del español es el «د» de la darija', () => {
    assert.equal(componer('Zumo de naranja', 'dar'), 'عْصِيرْ دْ لِيمُونْ');
    assert.equal(componer('Bolsa de patatas', 'dar'), 'سَاشِي دْ بَطَاطَا');
    assert.equal(componer('عصير د ليمون', 'es'), 'Zumo de naranja');
  });

  test('los adjetivos concuerdan con el sustantivo, en los dos idiomas', () => {
    assert.equal(componer('Tomate rojo', 'dar'), 'مَاطِيشَة حَمْرَا', 'matecha es femenina en darija');
    assert.equal(componer('Pan integral', 'dar'), 'خُبْزْ كَامَلْ');
    assert.equal(componer('Arroz integral', 'dar'), 'رُوزْ كَامَلْ');
    assert.equal(componer('مَاطِيشَة حَمْرَا', 'es'), 'Tomate rojo', 'tomate es masculino en español');
    assert.equal(componer('خْضْرَة طْرِيَّة', 'es'), 'Verdura fresca');
  });

  test('las cantidades pasan de largo', () => {
    assert.equal(componer('2 kg de tomates', 'dar'), '2 كِيلُو دْ مَاطِيشَة');
  });

  test('lo que no conoce lo escribe con el otro alfabeto, no lo deja tirado', () => {
    assert.equal(componer('Yogur bifidus', 'dar'), 'دَانُونْ بِيفِيدُوسْ');
    assert.equal(componer('Pan Bimbo', 'dar'), 'خُبْزْ بِيمْبُو');
    assert.equal(componer('بْرِيوَاتْ', 'es'), 'Briouat');
  });

  test('nunca se queda una palabra en letras latinas para quien no las lee', () => {
    const nombres = [
      'Nocilla', 'Actimel', 'Queso Philadelphia', 'Bombilla LED', 'Yogur bifidus',
      'Coca-Cola', "L'Oréal", "Kellogg's", '3 Delicias', 'Pan 100% integral',
      'ÑOÑO', 'wok', 'xilitol', 'ketchup Heinz',
      'حليب Puleva', 'Leche حليب', // nombres a medias entre los dos alfabetos
    ];
    for (const nombre of nombres) {
      const escrito = mostrar(nombre, 'dar').principal;
      assert.ok(!/[a-z]/i.test(escrito), `«${nombre}» deja letras latinas: ${escrito}`);
      assert.ok(/[ً-ْ]/.test(escrito), `«${nombre}» sale sin tashkil: ${escrito}`);
    }
  });

  test('las cantidades y los símbolos no se pierden por el camino', () => {
    assert.equal(mostrar('Pan 100% integral', 'dar').principal, 'خُبْزْ 100% كَامَلْ');
    assert.equal(mostrar('Yogur 0%', 'dar').principal, 'دَانُونْ 0%');
  });

  test('y todo eso llega a la pantalla', () => {
    assert.equal(mostrar('Zumo de naranja', 'dar').principal, 'عْصِيرْ دْ لِيمُونْ');
    assert.equal(mostrar('Yogur griego', 'dar').principal, 'دَانُونْ يُونَانِي');
    assert.equal(mostrar('Yogur bifidus', 'dar').original, 'Yogur bifidus', 'el original sigue debajo');
  });
});

describe('buscar en la lista de artículos', () => {
  test('busca en los dos idiomas a la vez', () => {
    assert.ok(coincide('حْلِيبْ', 'leche'), 'escribiendo en español encuentra lo apuntado en darija');
    assert.ok(coincide('Leche', 'حليب'), 'y al revés');
    assert.ok(coincide('Leche', 'lech'), 'a medio escribir');
    assert.ok(coincide('عْصِيرْ دْ لِيمُونْ', 'zumo'), 'también dentro de una frase');
    assert.ok(!coincide('Leche', 'pan'));
  });

  test('sin búsqueda, entra todo', () => {
    assert.ok(coincide('Leche', ''));
    assert.ok(coincide('Leche', '   '));
  });
});

describe('sugerencias mientras se escribe', () => {
  test('salen en el idioma de la app, aunque se escriba en el otro', () => {
    assert.ok(sugerir('lech', 'es').includes('Leche'));
    assert.ok(sugerir('lech', 'dar').includes('حْلِيبْ'));
    assert.ok(sugerir('حلي', 'es').includes('Leche'));
  });

  test('no sugiere lo que ya está escrito entero, ni con el campo vacío', () => {
    assert.ok(!sugerir('Leche', 'es').includes('Leche'));
    assert.deepEqual(sugerir('', 'es'), []);
  });

  test('como mucho cuatro, que la pantalla es pequeña', () => {
    assert.ok(sugerir('a', 'es').length <= 4);
  });
});

describe('el diccionario en sí', () => {
  test('tiene el tamaño de una compra de verdad', () => {
    assert.ok(ARTICULOS_CONOCIDOS.length >= 180, `solo hay ${ARTICULOS_CONOCIDOS.length} artículos`);
  });

  test('toda la darija lleva tashkil', () => {
    for (const { es, dar } of ARTICULOS_CONOCIDOS) {
      assert.ok(TASHKIL.test(dar), `«${es}» (${dar}) está sin vocales`);
    }
  });

  test('todo artículo declara sus dos géneros', () => {
    for (const { es, ges, gdar } of ARTICULOS_CONOCIDOS) {
      assert.ok(['m', 'f'].includes(ges) && ['m', 'f'].includes(gdar), `«${es}» tiene el género mal puesto`);
    }
  });

  test('no hay dos artículos que se pisen', () => {
    const vistos = new Map();
    for (const { es, dar } of ARTICULOS_CONOCIDOS) {
      for (const [clave, idioma] of [[normalizarEspanol(es), 'es'], [normalizarArabe(dar), 'dar']]) {
        const antes = vistos.get(`${idioma}:${clave}`);
        assert.equal(antes, undefined, `«${es}» choca con «${antes}» en ${idioma}`);
        vistos.set(`${idioma}:${clave}`, es);
      }
    }
  });

  test('y todas las parejas van en los dos sentidos', () => {
    for (const { es, dar } of ARTICULOS_CONOCIDOS) {
      assert.equal(traducir(es)?.dar, dar, `${es} no lleva a su darija`);
      assert.equal(traducir(dar)?.es, es, `${dar} no vuelve a su español`);
    }
  });
});

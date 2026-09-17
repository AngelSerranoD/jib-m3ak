/**
 * Jib M3ak — que la darija no se quede a medias.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Dos cosas que es fácil olvidar al añadir un texto nuevo: escribirlo en los
 * dos idiomas, y ponerle el tashkil (sin vocales, la darija escrita no hay
 * quien la lea de corrido).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDIOMAS, NOMBRE_IDIOMA, TEXTOS, textos } from '../src/i18n/textos.js';

const TASHKIL = /[\u064B-\u0652\u0670]/;
const ARABE = /[\u0621-\u064A]/;

/** Una frase de ejemplo por clave, ya sean textos o funciones. */
const frases = (idioma) =>
  Object.entries(TEXTOS[idioma]).map(([clave, valor]) => [
    clave,
    typeof valor === 'function' ? [valor(1), valor(3)].join(' · ') : valor,
  ]);

test('los dos idiomas tienen exactamente las mismas claves', () => {
  assert.deepEqual(Object.keys(TEXTOS.dar).sort(), Object.keys(TEXTOS.es).sort());
  for (const clave of Object.keys(TEXTOS.es)) {
    assert.equal(typeof TEXTOS.dar[clave], typeof TEXTOS.es[clave], `«${clave}» cambia de forma`);
  }
});

test('ninguna frase se queda vacía', () => {
  for (const idioma of IDIOMAS) {
    for (const [clave, frase] of frases(idioma)) {
      assert.ok(frase.trim().length > 0, `«${clave}» está vacía en ${idioma}`);
    }
  }
});

test('toda la darija lleva tashkil', () => {
  for (const [clave, frase] of frases('dar')) {
    if (!ARABE.test(frase)) continue; // alguna lleva solo cifras o nombres propios
    assert.ok(TASHKIL.test(frase), `«${clave}» está sin vocales: ${frase}`);
  }
});

test('el plural cambia de verdad', () => {
  for (const idioma of IDIOMAS) {
    const uno = TEXTOS[idioma].porComprar(1);
    const varios = TEXTOS[idioma].porComprar(4);
    assert.notEqual(uno, varios, `el plural de ${idioma} no distingue`);
    assert.match(varios, /4/);
  }
});

test('cada idioma se nombra en su propia lengua', () => {
  assert.equal(NOMBRE_IDIOMA.es, 'Español');
  assert.ok(TASHKIL.test(NOMBRE_IDIOMA.dar));
});

test('si se pide un idioma que no existe, se responde en español', () => {
  assert.equal(textos('fr'), TEXTOS.es);
});

/**
 * Jib M3ak — pasar palabras de un alfabeto al otro.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Esto no traduce: sirve para que quien solo lee árabe pueda LEER una marca
 * española, y al revés. Lo que se comprueba es que suene a lo que tiene que
 * sonar y que siempre salga vocalizado (sin tashkil no se lee de corrido).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { aArabe, aLatino } from '../src/i18n/transliteracion.js';

const TASHKIL = /[ً-ْ]/;
const LATINO = /[a-z]/i;

describe('del español al árabe', () => {
  test('las marcas de la compra se pueden leer en alto', () => {
    assert.equal(aArabe('Nocilla'), 'نُوسِيَا');
    assert.equal(aArabe('Actimel'), 'أَكْتِيمِيلْ');
    assert.equal(aArabe('Bimbo'), 'بِيمْبُو');
    assert.equal(aArabe('Puleva'), 'پُولِيبَا');
  });

  test('las reglas del español: ch, ll, ñ, la c y la g, la h muda', () => {
    assert.equal(aArabe('chocolate'), 'شُوكُولَاتِي');
    assert.equal(aArabe('España'), 'إِيسْپَانْيَا');
    assert.equal(aArabe('cereza'), 'سِيرِيزَا', 'la c ante e suena como s');
    assert.equal(aArabe('casa'), 'كَاسَا', 'y ante a como k');
    assert.equal(aArabe('gente'), 'خِينْتِي', 'la g ante e suena como j');
    assert.equal(aArabe('queso'), 'كِيسُو', 'la u de «que» no suena');
    assert.equal(aArabe('hola'), 'أُولَا', 'la h no suena');
  });

  test('no se queda nada sin vocalizar', () => {
    for (const palabra of ['Nocilla', 'Danone', 'Hacendado', 'Ariel', 'Philadelphia']) {
      const escrito = aArabe(palabra);
      assert.ok(TASHKIL.test(escrito), `«${palabra}» sale sin tashkil: ${escrito}`);
      assert.ok(!LATINO.test(escrito), `«${palabra}» se ha dejado letras latinas: ${escrito}`);
    }
  });

  test('los números se quedan como están: en Marruecos se usan los mismos', () => {
    assert.match(aArabe('5L'), /^5/);
  });
});

describe('del árabe al español', () => {
  test('se puede pronunciar lo que otro apuntó en darija', () => {
    assert.equal(aLatino('حْلِيبْ'), 'hlib');
    assert.equal(aLatino('مَاطِيشَة'), 'maticha');
    assert.equal(aLatino('بْرِيوَاتْ'), 'briuat');
  });

  test('la shadda dobla la letra y el sukun no suena', () => {
    assert.equal(aLatino('سُكَّرْ'), 'sukkar');
  });
});

test('ida y vuelta: lo transcrito se sigue pareciendo al original', () => {
  // La vuelta no es exacta (la c y la k suenan igual, la v y la b también),
  // pero tiene que quedar algo pronunciable y de largo parecido.
  for (const [palabra, esperado] of [['Bimbo', 'bimbu'], ['Nocilla', 'nusia'], ['Colacao', 'kulakau']]) {
    assert.equal(aLatino(aArabe(palabra)).toLowerCase(), esperado);
  }
});

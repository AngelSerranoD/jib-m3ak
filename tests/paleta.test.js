/**
 * Jib M3ak — que la paleta se lea, no solo que sea bonita.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * Los cinco colores son los que pidió Ángel; lo que se comprueba aquí es el
 * contraste de las combinaciones que la app usa de verdad (WCAG 2.1: 4,5 para
 * texto normal, 3 para texto grande e iconos).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import tailwind from '../tailwind.config.js';

const COLORES = tailwind.theme.extend.colors;

const luminancia = (hex) =>
  [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((canal) => (canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4))
    .reduce((suma, canal, i) => suma + canal * [0.2126, 0.7152, 0.0722][i], 0);

function contraste(unNombre, otroNombre) {
  const [uno, otro] = [COLORES[unNombre], COLORES[otroNombre]].map((hex) => luminancia(hex) + 0.05);
  return Math.max(uno, otro) / Math.min(uno, otro);
}

test('la paleta es la que se pidió', () => {
  assert.deepEqual(
    [COLORES.crema, COLORES.avena, COLORES.canela, COLORES.nogal, COLORES.cafe],
    ['#EDE4D3', '#C9B79C', '#9C7A54', '#6B4F3A', '#3E2E22']
  );
});

test('el texto normal se lee (4,5 o más)', () => {
  const combinaciones = [
    ['cafe', 'crema'],   // texto principal sobre el fondo
    ['cafe', 'leche'],   // texto principal sobre las tarjetas
    ['nogal', 'leche'],  // texto de apoyo y botones suaves
    ['nogal', 'crema'],  // texto de apoyo sobre el fondo
    ['crema', 'nogal'],  // botones principales
    ['cafe', 'avena'],   // insignias y bandas de estado
  ];
  for (const [tinta, fondo] of combinaciones) {
    const razon = contraste(tinta, fondo);
    assert.ok(razon >= 4.5, `${tinta} sobre ${fondo} se queda en ${razon.toFixed(2)}`);
  }
});

test('el canela solo vale para iconos y texto grande (3 o más)', () => {
  assert.ok(contraste('canela', 'leche') >= 3);
  assert.ok(contraste('canela', 'leche') < 4.5, 'si subiera, se podría usar para texto normal');
});

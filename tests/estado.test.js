/**
 * Jib M3ak — la cola de cambios: lo que pasa cuando no hay cobertura.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * El servidor es de mentira, pero se comporta como el de verdad en lo que
 * importa: se cae, vuelve, y rechaza lo que ya existe.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ERROR_RED, aplicarPendientes, crearSincronizador } from '../src/lib/estado.js';

const UUID = () => crypto.randomUUID();
const FOTO = 'data:image/jpeg;base64,/9j/4AAQ';

function servidorFalso() {
  const datos = { articulos: [], compra: [] };
  const hecho = [];
  let caido = false;
  const sinRed = () => { const fallo = new Error('sin red'); fallo.clase = ERROR_RED; throw fallo; };

  return {
    datos,
    hecho,
    caer: (valor = true) => { caido = valor; },
    async leer() {
      if (caido) sinRed();
      return structuredClone(datos);
    },
    async crearArticulo({ id, nombre, creado_en, fotoLocal }) {
      if (caido) sinRed();
      assert.ok(fotoLocal, 'la foto tiene que viajar con la operación');
      hecho.push(`crear:${nombre}`);
      if (!datos.articulos.some((a) => a.id === id)) datos.articulos.push({ id, nombre, creado_en });
    },
    async borrarArticulo({ articuloId }) {
      if (caido) sinRed();
      hecho.push('borrar');
      datos.articulos = datos.articulos.filter((a) => a.id !== articuloId);
      datos.compra = datos.compra.filter((c) => c.articulo_id !== articuloId);
    },
    async aCompra({ id, articuloId, creado_en }) {
      if (caido) sinRed();
      hecho.push('aCompra');
      if (!datos.compra.some((c) => c.articulo_id === articuloId)) {
        datos.compra.push({ id, articulo_id: articuloId, creado_en });
      }
    },
    async quitarCompra({ id }) {
      if (caido) sinRed();
      hecho.push('quitar');
      datos.compra = datos.compra.filter((c) => c.id !== id);
    },
    async vaciarCompra({ ids }) {
      if (caido) sinRed();
      hecho.push('vaciar');
      datos.compra = datos.compra.filter((c) => !ids.includes(c.id));
    },
  };
}

/** Un localStorage de mentira: guarda texto, como el de verdad. */
function almacenFalso(memoria = new Map()) {
  const leer = (clave) => (memoria.has(clave) ? JSON.parse(memoria.get(clave)) : null);
  const guardar = (clave, valor) => memoria.set(clave, JSON.stringify(valor));
  return {
    memoria,
    leerBase: () => leer('base'),
    guardarBase: (base) => guardar('base', base),
    leerPendientes: () => leer('pendientes'),
    guardarPendientes: (pendientes) => guardar('pendientes', pendientes),
  };
}

const esperar = async (condicion, limite = 2000) => {
  const hasta = Date.now() + limite;
  while (!condicion()) {
    if (Date.now() > hasta) throw new Error('se acabó la espera');
    await new Promise((sigue) => setTimeout(sigue, 5));
  }
};

describe('lo que se ve mientras la cola espera', () => {
  const base = { articulos: [{ id: 'a1', nombre: 'Pan' }], compra: [] };

  test('un artículo recién hecho se ve con su foto del propio móvil', () => {
    const vista = aplicarPendientes(base, [
      { tipo: 'crearArticulo', id: 'a2', nombre: 'Leche', fotoLocal: FOTO, creado_en: 'ahora' },
    ]);
    assert.equal(vista.articulos.length, 2);
    assert.equal(vista.articulos[1].foto_local, FOTO);
  });

  test('borrar un artículo lo quita también de la compra', () => {
    const conCompra = { articulos: base.articulos, compra: [{ id: 'c1', articulo_id: 'a1' }] };
    const vista = aplicarPendientes(conCompra, [{ tipo: 'borrarArticulo', articuloId: 'a1' }]);
    assert.deepEqual(vista.articulos, []);
    assert.deepEqual(vista.compra, []);
  });

  test('la flecha no duplica aunque se pulse dos veces', () => {
    const vista = aplicarPendientes(base, [
      { tipo: 'aCompra', id: 'c1', articuloId: 'a1', creado_en: '1' },
      { tipo: 'aCompra', id: 'c2', articuloId: 'a1', creado_en: '2' },
    ]);
    assert.equal(vista.compra.length, 1);
  });
});

describe('sin cobertura en el supermercado', () => {
  test('lo hecho sin red se ve al momento, se manda al volver y la cola queda limpia', async () => {
    const servidor = servidorFalso();
    const sinc = crearSincronizador({ servidor, almacen: almacenFalso() });

    servidor.caer();
    const articulo = UUID();
    sinc.crearArticulo({ id: articulo, nombre: 'Leche', fotoLocal: FOTO });
    sinc.aCompra(articulo);

    await new Promise((sigue) => setTimeout(sigue, 20));
    assert.equal(sinc.vista().articulos.length, 1, 'se ve aunque no haya salido del móvil');
    assert.equal(sinc.vista().compra.length, 1);
    assert.deepEqual(servidor.hecho, [], 'nada ha llegado al servidor');
    assert.ok(sinc.hayPendientes());

    servidor.caer(false);
    sinc.enviar();
    await esperar(() => !sinc.hayPendientes());

    assert.deepEqual(servidor.hecho, ['crear:Leche', 'aCompra'], 'y en ese orden');
    assert.equal(servidor.datos.articulos.length, 1);
    assert.equal(sinc.estado().pendientes, 0);
    assert.equal(sinc.vista().articulos.length, 1, 'no parpadea al vaciarse la cola');
  });

  test('la cola sobrevive a que se cierre la app', async () => {
    const memoria = new Map();
    const servidor = servidorFalso();
    servidor.caer();

    const antes = crearSincronizador({ servidor, almacen: almacenFalso(memoria) });
    antes.crearArticulo({ id: UUID(), nombre: 'Huevos', fotoLocal: FOTO });
    await new Promise((sigue) => setTimeout(sigue, 20));

    // Se cierra la app y se vuelve a abrir: mismo almacén, sincronizador nuevo.
    const despues = crearSincronizador({ servidor, almacen: almacenFalso(memoria) });
    assert.equal(despues.vista().articulos.length, 1, 'la foto y el nombre siguen ahí');

    servidor.caer(false);
    despues.enviar();
    await esperar(() => !despues.hayPendientes());
    assert.equal(servidor.datos.articulos[0].nombre, 'Huevos');
  });

  test('un error que no es de red no atasca la cola', async () => {
    const servidor = servidorFalso();
    const fallos = [];
    const sinc = crearSincronizador({ servidor, almacen: almacenFalso(), alError: (e) => fallos.push(e) });
    servidor.aCompra = async () => { throw new Error('lo borró otro móvil'); };

    const articulo = UUID();
    sinc.crearArticulo({ id: articulo, nombre: 'Pan', fotoLocal: FOTO });
    sinc.aCompra(articulo);
    sinc.quitarCompra('lo-que-sea');

    await esperar(() => !sinc.hayPendientes());
    assert.equal(fallos.length, 1);
    assert.ok(servidor.hecho.includes('quitar'), 'lo siguiente se sigue mandando');
  });

  test('«todo comprado» solo borra lo que se veía en ese momento', async () => {
    const servidor = servidorFalso();
    const sinc = crearSincronizador({ servidor, almacen: almacenFalso() });

    const uno = UUID();
    sinc.crearArticulo({ id: uno, nombre: 'Pan', fotoLocal: FOTO });
    sinc.aCompra(uno);
    await esperar(() => !sinc.hayPendientes());

    // Alguien de casa apunta algo justo después, desde otro móvil.
    servidor.caer();
    sinc.vaciarCompra();
    servidor.datos.compra.push({ id: 'de-otro', articulo_id: uno, creado_en: 'después' });

    servidor.caer(false);
    sinc.enviar();
    await esperar(() => !sinc.hayPendientes());
    assert.deepEqual(servidor.datos.compra.map((c) => c.id), ['de-otro'], 'lo suyo no se borra');
  });
});

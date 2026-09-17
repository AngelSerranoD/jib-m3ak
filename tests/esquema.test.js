/**
 * Jib M3ak — la migración real, probada sobre Postgres de verdad (PGlite).
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 *
 * No hay cuentas: todo el mundo entra como `anon`. Lo que se comprueba es que
 * ese anónimo pueda hacer lo que la app necesita y NADA más: ni renombrar, ni
 * falsear fechas, ni colar fotos con nombres inventados.
 */
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), 'utf8');

let db;

before(async () => {
  db = new PGlite();
  await db.exec(leer('./sql/stub-supabase.sql'));
  await db.exec(leer('../supabase/migrations/20260917140000_esquema_inicial.sql'));
});

after(async () => { await db?.close(); });

/** Ejecuta como cualquiera que tenga la app instalada. */
async function comoFamilia(fn) {
  await db.exec('set role anon');
  try { return await fn(); } finally { await db.exec('reset role'); }
}

/** Devuelve el mensaje del error que lanza `fn`, o falla si no lanza ninguno. */
async function falla(fn, mensaje) {
  const error = await fn().then(() => null, (e) => e);
  assert.ok(error, `se esperaba un error: ${mensaje}`);
  return String(error.message);
}

const UUID = () => crypto.randomUUID();

async function crearArticulo(nombre = 'Leche') {
  const id = UUID();
  await comoFamilia(() => db.query('insert into public.articulos (id, nombre) values ($1, $2)', [id, nombre]));
  return id;
}

describe('artículos', () => {
  test('la familia los crea, los ve y los borra', async () => {
    const id = await crearArticulo('Pan');
    const { rows } = await comoFamilia(() =>
      db.query('select nombre, creado_en from public.articulos where id = $1', [id]));
    assert.equal(rows[0].nombre, 'Pan');
    assert.ok(rows[0].creado_en instanceof Date, 'la fecha la pone el servidor');

    await comoFamilia(() => db.query('delete from public.articulos where id = $1', [id]));
    const { rows: quedan } = await comoFamilia(() =>
      db.query('select 1 from public.articulos where id = $1', [id]));
    assert.equal(quedan.length, 0);
  });

  test('nadie puede falsear la fecha de creación', async () => {
    const mensaje = await falla(
      () => comoFamilia(() => db.query(
        "insert into public.articulos (id, nombre, creado_en) values ($1, 'Pan', '2099-01-01')", [UUID()])),
      'creado_en no está concedido');
    assert.match(mensaje, /permission denied|denegado/i);
  });

  test('nadie puede renombrar ni tocar lo que ya está', async () => {
    const id = await crearArticulo();
    const mensaje = await falla(
      () => comoFamilia(() => db.query("update public.articulos set nombre = 'Otro' where id = $1", [id])),
      'UPDATE no está concedido');
    assert.match(mensaje, /permission denied|denegado/i);
  });

  test('el nombre no puede venir vacío, con espacios de sobra ni kilométrico', async () => {
    for (const nombre of ['', '   ', ' Leche', 'x'.repeat(61)]) {
      const mensaje = await falla(
        () => comoFamilia(() => db.query('insert into public.articulos (id, nombre) values ($1, $2)', [UUID(), nombre])),
        `nombre rechazado: «${nombre}»`);
      assert.match(mensaje, /nombre_valido/);
    }
  });
});

describe('lista de la compra', () => {
  test('un artículo entra una sola vez', async () => {
    const articulo = await crearArticulo('Huevos');
    await comoFamilia(() => db.query('insert into public.compra (id, articulo_id) values ($1, $2)', [UUID(), articulo]));
    const mensaje = await falla(
      () => comoFamilia(() => db.query('insert into public.compra (id, articulo_id) values ($1, $2)', [UUID(), articulo])),
      'la flecha no duplica');
    assert.match(mensaje, /compra_articulo_id_key|duplicate|duplicada/i);
  });

  test('no se puede apuntar algo que no existe', async () => {
    const mensaje = await falla(
      () => comoFamilia(() => db.query('insert into public.compra (id, articulo_id) values ($1, $2)', [UUID(), UUID()])),
      'clave ajena');
    assert.match(mensaje, /foreign key|clave foránea/i);
  });

  test('borrar de la compra NO borra el artículo', async () => {
    const articulo = await crearArticulo('Azúcar');
    const enCompra = UUID();
    await comoFamilia(async () => {
      await db.query('insert into public.compra (id, articulo_id) values ($1, $2)', [enCompra, articulo]);
      await db.query('delete from public.compra where id = $1', [enCompra]);
    });
    const { rows } = await comoFamilia(() => db.query('select 1 from public.articulos where id = $1', [articulo]));
    assert.equal(rows.length, 1, 'el artículo se queda en su apartado');
  });

  test('borrar el artículo sí lo quita de la compra', async () => {
    const articulo = await crearArticulo('Aceite');
    await comoFamilia(async () => {
      await db.query('insert into public.compra (id, articulo_id) values ($1, $2)', [UUID(), articulo]);
      await db.query('delete from public.articulos where id = $1', [articulo]);
    });
    const { rows } = await comoFamilia(() =>
      db.query('select 1 from public.compra where articulo_id = $1', [articulo]));
    assert.equal(rows.length, 0);
  });
});

describe('fotos', () => {
  // Sin RETURNING: con él, Postgres exige además la política de SELECT y un
  // agujero en la de INSERT pasaría la prueba igualmente.
  const subir = (nombre, bucket = 'fotos') =>
    comoFamilia(() => db.query('insert into storage.objects (bucket_id, name) values ($1, $2)', [bucket, nombre]));

  test('se sube la foto de un artículo', async () => {
    await subir(`${UUID()}.jpg`);
  });

  test('el nombre tiene que ser el uuid del artículo', async () => {
    for (const nombre of ['gato.jpg', `${UUID()}.png`, `carpeta/${UUID()}.jpg`, `${UUID()}.jpg.html`]) {
      const mensaje = await falla(() => subir(nombre), `nombre de foto rechazado: ${nombre}`);
      assert.match(mensaje, /row-level security|seguridad a nivel/i);
    }
  });

  test('no se puede escribir en otro bucket', async () => {
    await db.query("insert into storage.buckets (id, name) values ('privado', 'privado')");
    const mensaje = await falla(() => subir(`${UUID()}.jpg`, 'privado'), 'otro bucket');
    assert.match(mensaje, /row-level security|seguridad a nivel/i);
  });

  test('el bucket de fotos es público, de solo JPEG y con tope de 1 MB', async () => {
    const { rows } = await db.query('select public, file_size_limit, allowed_mime_types from storage.buckets where id = $1', ['fotos']);
    assert.deepEqual(rows[0], { public: true, file_size_limit: 1048576, allowed_mime_types: ['image/jpeg'] });
  });
});

test('las dos tablas viajan por Realtime', async () => {
  const { rows } = await db.query(
    "select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by tablename");
  assert.deepEqual(rows.map((r) => r.tablename), ['articulos', 'compra']);
});

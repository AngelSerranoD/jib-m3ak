-- Jib M3ak — esquema inicial: los artículos y la lista de la compra de la familia.
-- Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
--
-- La app no tiene cuentas: quien la instala ve y edita la misma lista, que es
-- justo lo que se pidió (una lista para toda la familia). Lo que sí se acota:
--   · nada de UPDATE (ni renombrar ni tocar filas ajenas),
--   · solo las columnas que manda la app: las fechas las pone el servidor,
--   · nombres y nombres de foto validados en la propia base,
--   · las fotos viven en un bucket propio, solo JPEG y como mucho 1 MB.
-- La foto de un artículo es siempre «<id>.jpg», así que no hace falta columna.

-- ───────────────────────── Tablas ─────────────────────────

create table public.articulos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null constraint nombre_valido
    check (nombre = btrim(nombre) and char_length(nombre) between 1 and 60),
  creado_en timestamptz not null default now()
);

comment on table public.articulos is
  'Catálogo permanente de la familia: cada artículo con su foto. No se borra al comprar.';

-- Un artículo entra una sola vez en la lista de la compra: la flecha no duplica.
create table public.compra (
  id uuid primary key default gen_random_uuid(),
  articulo_id uuid not null unique references public.articulos (id) on delete cascade,
  creado_en timestamptz not null default now()
);

comment on table public.compra is
  'Lo que hay que comprar ahora. Se vacía al comprar; los artículos siguen en su tabla.';

-- ──────────────────── Permisos y políticas ────────────────────
-- Supabase concede ALL sobre las tablas nuevas a anon: se retira y se da lo justo.

revoke all on table public.articulos, public.compra from anon, authenticated;
grant select, delete on table public.articulos, public.compra to anon, authenticated;
grant insert (id, nombre) on table public.articulos to anon, authenticated;
grant insert (id, articulo_id) on table public.compra to anon, authenticated;

alter table public.articulos enable row level security;
alter table public.compra enable row level security;

create policy articulos_leer on public.articulos
  for select to anon, authenticated using (true);
create policy articulos_crear on public.articulos
  for insert to anon, authenticated with check (true);
create policy articulos_borrar on public.articulos
  for delete to anon, authenticated using (true);

create policy compra_leer on public.compra
  for select to anon, authenticated using (true);
create policy compra_crear on public.compra
  for insert to anon, authenticated with check (true);
create policy compra_borrar on public.compra
  for delete to anon, authenticated using (true);

-- ───────────────────────── Fotos ─────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 1048576, array['image/jpeg']);

-- El nombre del archivo tiene que ser el uuid del artículo: nada de rutas raras
-- ni de usar el bucket como alojamiento de imágenes cualquiera.
create policy fotos_subir on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'fotos'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
  );

-- El bucket es público (las fotos se ven por URL); esta política es la que deja
-- que la app borre la foto al borrar el artículo (la API pide select + delete).
create policy fotos_ver on storage.objects
  for select to anon, authenticated using (bucket_id = 'fotos');
create policy fotos_borrar on storage.objects
  for delete to anon, authenticated using (bucket_id = 'fotos');

-- ──────────────────── Cambios en directo ────────────────────
-- Para que la lista se mueva sola en los móviles de los demás.

alter publication supabase_realtime add table public.articulos, public.compra;

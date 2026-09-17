-- Jib M3ak — lo mínimo de Supabase para probar la migración en PGlite.
-- Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
--
-- Imita lo que la migración necesita: los roles, storage (buckets y objects con
-- RLS), la publicación de Realtime y los permisos que Supabase da de serie en
-- public (que la migración retira). Sin auth: esta app no tiene cuentas.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema storage;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null,
  creado_en timestamptz not null default now()
);
alter table storage.objects enable row level security;

create publication supabase_realtime;

grant usage on schema public, storage to anon, authenticated, service_role;
grant select, insert, update, delete on storage.objects to anon, authenticated;

-- Lo que hace Supabase de serie en public.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

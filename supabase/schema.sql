-- DTFragancias — Supabase schema (Phase 1: add-supabase-perfume-crud)
-- Run this once in the Supabase SQL Editor.
-- Safe to re-run: uses "if not exists" / "drop policy if exists" guards.

-- 1) Perfumes table (RAW fields; the client still derives id/slug/tags via normalizePerfume)
create table if not exists public.perfumes (
  id           bigint generated always as identity primary key,
  name         text        not null,
  brand        text        not null,
  price        numeric,                                   -- NULL means "Consultar"
  gender       text        not null check (gender in ('masculino', 'femenino', 'unisex')),
  category     text        not null,
  size         text        not null,
  image_url    text        not null,
  description  text        not null,
  notes        jsonb       not null default '{"top":[],"middle":[],"base":[]}'::jsonb,
  collection   text        not null check (collection in ('regular', 'mini', 'accesorio', 'arabe', 'arabic')),
  is_featured  boolean     not null default false,        -- owner-controlled "Destacar"
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Run this if the table already exists (adds 'arabic' to the allowed collections):
alter table public.perfumes drop constraint if exists perfumes_collection_check;
alter table public.perfumes add constraint perfumes_collection_check
  check (collection in ('regular', 'mini', 'accesorio', 'arabe', 'arabic'));

-- 2) Row Level Security: everyone can read, only logged-in admin can write
alter table public.perfumes enable row level security;

drop policy if exists "public read perfumes"  on public.perfumes;
drop policy if exists "admin insert perfumes" on public.perfumes;
drop policy if exists "admin update perfumes" on public.perfumes;
drop policy if exists "admin delete perfumes" on public.perfumes;

create policy "public read perfumes"
  on public.perfumes for select
  to anon, authenticated
  using (true);

create policy "admin insert perfumes"
  on public.perfumes for insert
  to authenticated
  with check (true);

create policy "admin update perfumes"
  on public.perfumes for update
  to authenticated
  using (true) with check (true);

create policy "admin delete perfumes"
  on public.perfumes for delete
  to authenticated
  using (true);

-- 3) Storage bucket for perfume photos (public read)
insert into storage.buckets (id, name, public)
values ('perfume-images', 'perfume-images', true)
on conflict (id) do nothing;

-- 4) Storage policies: public can view images, only admin can upload/change/delete
drop policy if exists "public read images"  on storage.objects;
drop policy if exists "admin write images"  on storage.objects;
drop policy if exists "admin update images" on storage.objects;
drop policy if exists "admin delete images" on storage.objects;

create policy "public read images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'perfume-images');

create policy "admin write images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'perfume-images');

create policy "admin update images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'perfume-images');

create policy "admin delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'perfume-images');

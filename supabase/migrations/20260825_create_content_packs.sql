-- Content packs are private editorial work for the owner admin.
-- Configure auth.users.app_metadata.content_admin = true in Supabase Auth for
-- the owner admin. This app_metadata claim cannot be modified by the client.

create table if not exists public.content_packs (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.perfumes(id) on delete cascade,
  reason text not null check (reason in ('manual', 'new_product')),
  payload jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_packs_product_id_idx
  on public.content_packs(product_id);
drop index if exists public.content_packs_status_idx;
create index if not exists content_packs_status_updated_idx
  on public.content_packs(status, updated_at desc);

alter table public.content_packs enable row level security;

drop policy if exists "content admin can select content packs" on public.content_packs;
drop policy if exists "content admin can insert content packs" on public.content_packs;
drop policy if exists "content admin can update content packs" on public.content_packs;

create policy "content admin can select content packs"
  on public.content_packs for select to authenticated
  using (
    auth.uid() is not null
    and auth.jwt()->'app_metadata'->>'content_admin' = 'true'
  );

create policy "content admin can insert content packs"
  on public.content_packs for insert to authenticated
  with check (
    auth.uid() is not null
    and auth.jwt()->'app_metadata'->>'content_admin' = 'true'
  );

create policy "content admin can update content packs"
  on public.content_packs for update to authenticated
  using (
    auth.uid() is not null
    and auth.jwt()->'app_metadata'->>'content_admin' = 'true'
  )
  with check (
    auth.uid() is not null
    and auth.jwt()->'app_metadata'->>'content_admin' = 'true'
  );

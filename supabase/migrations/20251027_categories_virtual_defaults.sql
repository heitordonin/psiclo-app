-- 20251027_categories_virtual_defaults.sql
-- Migration limpa: adiciona templates + categorias_user + view categories_all + RLS

create table if not exists public.category_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('receita','despesa','transferencia')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  unique (name, kind)
);

create table if not exists public.categories_user (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('receita','despesa','transferencia')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name, kind)
);

create or replace view public.categories_all as
  select
    ct.id::uuid as id,
    null::uuid as user_id,
    ct.name,
    ct.kind,
    ct.sort_order,
    true as locked,
    'template'::text as source
  from public.category_templates ct
  where ct.is_active = true

  union all

  select
    cu.id::uuid as id,
    cu.user_id,
    cu.name,
    cu.kind,
    cu.sort_order,
    false as locked,
    'user'::text as source
  from public.categories_user cu;

alter table public.categories_user enable row level security;

create policy if not exists cat_user_select_own on public.categories_user
for select to authenticated using (user_id = auth.uid());

create policy if not exists cat_user_insert_own on public.categories_user
for insert to authenticated with check (user_id = auth.uid());

create policy if not exists cat_user_update_own on public.categories_user
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists cat_user_delete_own on public.categories_user
for delete to authenticated using (user_id = auth.uid());

insert into public.category_templates (name, kind, sort_order) values
  ('Consulta Particular','receita',10),
  ('Plano de Saúde','receita',20),
  ('Supervisão','receita',30),
  ('Aluguel do consultório','despesa',10),
  ('Plataforma de agendamento','despesa',20),
  ('Marketing/Anúncios','despesa',30)
on conflict (name, kind) do nothing;

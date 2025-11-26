-- 1) Visibility enum for product placement
do $$ begin
  create type public.product_visibility as enum ('PUBLIC', 'INNER', 'DROP');
exception when duplicate_object then null; end $$;

-- 2) Add columns on products (skip if they already exist)
alter table public.products
  add column if not exists "visibility" public.product_visibility not null default 'PUBLIC',
  add column if not exists "dropId" uuid null;

-- 3) Drops table (one active drop per curator)
create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  "curatorId" uuid not null,
  slug text not null unique,
  title text not null,
  description text,
  "heroImage" text,
  "startsAt" timestamp without time zone not null,
  "endsAt"   timestamp without time zone not null,
  "isActive" boolean not null default false,
  "createdAt" timestamp without time zone not null default now(),
  "updatedAt" timestamp without time zone not null default now()
);

-- 4) FK to curators + products link to drop
alter table public.drops
  add constraint drops_curator_fk
    foreign key ("curatorId") references public.curator_profiles(id) on delete cascade;

alter table public.products
  add constraint products_drop_fk
    foreign key ("dropId") references public.drops(id) on delete set null;

-- 5) Enforce "only one active drop per curator"
create unique index if not exists uniq_active_drop_per_curator
on public.drops("curatorId")
where "isActive" = true;

-- 6) Helpful indexes
create index if not exists idx_products_curator_visibility
  on public.products("curatorId","visibility");

create index if not exists idx_products_drop
  on public.products("dropId");

-- 7) Create view for active drops
create or replace view public.v_active_drops as
select d.*, 
       now() between d."startsAt" and d."endsAt" as "isCurrentlyActive"
from public.drops d
where d."isActive" = true;
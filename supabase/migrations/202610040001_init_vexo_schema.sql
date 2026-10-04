-- Vexo Garage — initial public schema (14 tables from API inventory)
-- Applied against Supabase Postgres. Safe to re-run with IF NOT EXISTS guards.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.garage_status as enum (
    'pending', 'active', 'suspended', 'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum (
    'pending_payment',
    'held',
    'accepted',
    'declined',
    'in_progress',
    'awaiting_proof',
    'awaiting_approval',
    'completed',
    'disputed',
    'cancelled',
    'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.service_type as enum (
    'mot', 'service', 'diagnostics', 'tyres', 'brakes', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reminder_channel as enum ('sms', 'email', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reminder_status as enum ('scheduled', 'sent', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1. postcodes
-- ---------------------------------------------------------------------------
create table if not exists public.postcodes (
  id uuid primary key default gen_random_uuid(),
  postcode text not null,
  postcode_norm text generated always as (upper(replace(postcode, ' ', ''))) stored,
  district text not null,
  area text,
  region text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (postcode_norm)
);

create index if not exists postcodes_district_idx on public.postcodes (district);
create index if not exists postcodes_geo_idx on public.postcodes (lat, lng);

-- ---------------------------------------------------------------------------
-- 2. customers (linked to auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  postcode text,
  district text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_email_idx on public.customers (lower(email));

-- ---------------------------------------------------------------------------
-- 3. garages
-- ---------------------------------------------------------------------------
create table if not exists public.garages (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users (id) on delete set null,
  name text not null,
  slug text not null unique,
  company_number text,
  company_status text,
  status public.garage_status not null default 'pending',
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  postcode text not null,
  district text,
  lat double precision,
  lng double precision,
  mot_license text,
  insurance_doc_path text,
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,
  base_mot_price_pence integer not null default 4500,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists garages_district_idx on public.garages (district);
create index if not exists garages_status_idx on public.garages (status);
create index if not exists garages_geo_idx on public.garages (lat, lng);

-- ---------------------------------------------------------------------------
-- 4. vehicles
-- ---------------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  reg text not null,
  reg_norm text generated always as (upper(replace(reg, ' ', ''))) stored,
  make text,
  model text,
  year integer,
  colour text,
  fuel text,
  engine_cc integer,
  dvla_raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reg_norm)
);

create index if not exists vehicles_customer_idx on public.vehicles (customer_id);

-- ---------------------------------------------------------------------------
-- 5. bookings
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  garage_id uuid not null references public.garages (id),
  vehicle_id uuid references public.vehicles (id),
  service_type public.service_type not null default 'mot',
  status public.booking_status not null default 'pending_payment',
  amount_pence integer not null,
  garage_share_pence integer,
  vexo_share_pence integer,
  currency text not null default 'gbp',
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  scheduled_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  approval_deadline_at timestamptz,
  customer_notes text,
  garage_notes text,
  district text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_garage_idx on public.bookings (garage_id, status);
create index if not exists bookings_customer_idx on public.bookings (customer_id);
create index if not exists bookings_district_idx on public.bookings (district);

-- ---------------------------------------------------------------------------
-- 6. mot_history
-- ---------------------------------------------------------------------------
create table if not exists public.mot_history (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles (id) on delete cascade,
  reg text not null,
  reg_norm text generated always as (upper(replace(reg, ' ', ''))) stored,
  expiry_date date,
  mileage integer,
  advisories jsonb not null default '[]'::jsonb,
  fails jsonb not null default '[]'::jsonb,
  district text,
  raw jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists mot_history_reg_idx on public.mot_history (reg_norm);
create index if not exists mot_history_expiry_idx on public.mot_history (expiry_date);

-- ---------------------------------------------------------------------------
-- 7. video_proofs
-- ---------------------------------------------------------------------------
create table if not exists public.video_proofs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  storage_path text not null,
  content_hash text,
  duration_sec integer,
  mot_cert_path text,
  uploaded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists video_proofs_booking_idx on public.video_proofs (booking_id);

-- ---------------------------------------------------------------------------
-- 8. passports
-- ---------------------------------------------------------------------------
create table if not exists public.passports (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null unique references public.vehicles (id) on delete cascade,
  reg text not null,
  reg_norm text generated always as (upper(replace(reg, ' ', ''))) stored,
  history jsonb not null default '[]'::jsonb,
  resale_value_pence integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists passports_reg_idx on public.passports (reg_norm);

-- ---------------------------------------------------------------------------
-- 9. commissions
-- ---------------------------------------------------------------------------
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  garage_id uuid not null references public.garages (id),
  garage_amount_pence integer not null,
  vexo_base_pence integer not null default 0,
  vexo_shield_pence integer not null default 0,
  vexo_passport_pence integer not null default 0,
  vexo_total_pence integer not null,
  stripe_transfer_id text,
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 10. reminders
-- ---------------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  channel public.reminder_channel not null default 'both',
  status public.reminder_status not null default 'scheduled',
  template_key text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists reminders_due_idx on public.reminders (status, scheduled_for);

-- ---------------------------------------------------------------------------
-- 11. bot_market_sequence
-- ---------------------------------------------------------------------------
create table if not exists public.bot_market_sequence (
  id uuid primary key default gen_random_uuid(),
  district text not null,
  sequence_order integer not null,
  status text not null default 'queued',
  keyword_score numeric,
  social_score numeric,
  total_selling_score numeric,
  deployed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (district, sequence_order)
);

-- ---------------------------------------------------------------------------
-- 12. keyword_research
-- ---------------------------------------------------------------------------
create table if not exists public.keyword_research (
  id uuid primary key default gen_random_uuid(),
  district text not null,
  keyword text not null,
  volume integer,
  cpc_gbp numeric,
  competition numeric,
  source text not null default 'google_ads',
  researched_at timestamptz not null default now(),
  raw jsonb,
  unique (district, keyword, source)
);

create index if not exists keyword_research_district_idx on public.keyword_research (district);

-- ---------------------------------------------------------------------------
-- 13. social_research
-- ---------------------------------------------------------------------------
create table if not exists public.social_research (
  id uuid primary key default gen_random_uuid(),
  district text,
  platform text not null,
  query text not null,
  volume integer,
  engagement numeric,
  researched_at timestamptz not null default now(),
  raw jsonb
);

create index if not exists social_research_platform_idx on public.social_research (platform, researched_at desc);

-- ---------------------------------------------------------------------------
-- 14. social_trends
-- ---------------------------------------------------------------------------
create table if not exists public.social_trends (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  region text,
  score numeric,
  trend_direction text,
  researched_at timestamptz not null default now(),
  raw jsonb
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create trigger postcodes_updated_at before update on public.postcodes
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger customers_updated_at before update on public.customers
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger garages_updated_at before update on public.garages
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger vehicles_updated_at before update on public.vehicles
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger bookings_updated_at before update on public.bookings
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger passports_updated_at before update on public.passports
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- Haversine distance in miles
create or replace function public.distance_miles(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
returns double precision
language sql
immutable
as $$
  select 3958.7613 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- Nearby active garages within radius_miles (default 0.3)
create or replace function public.garages_near(
  p_lat double precision,
  p_lng double precision,
  p_radius_miles double precision default 0.3,
  p_national boolean default false
)
returns table (
  id uuid,
  name text,
  slug text,
  postcode text,
  district text,
  lat double precision,
  lng double precision,
  base_mot_price_pence integer,
  distance_miles double precision
)
language sql
stable
as $$
  select
    g.id, g.name, g.slug, g.postcode, g.district, g.lat, g.lng,
    g.base_mot_price_pence,
    public.distance_miles(p_lat, p_lng, g.lat, g.lng) as distance_miles
  from public.garages g
  where g.status = 'active'
    and g.lat is not null
    and g.lng is not null
    and (
      p_national
      or public.distance_miles(p_lat, p_lng, g.lat, g.lng) <= p_radius_miles
    )
  order by distance_miles asc;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.postcodes enable row level security;
alter table public.customers enable row level security;
alter table public.garages enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.mot_history enable row level security;
alter table public.video_proofs enable row level security;
alter table public.passports enable row level security;
alter table public.commissions enable row level security;
alter table public.reminders enable row level security;
alter table public.bot_market_sequence enable row level security;
alter table public.keyword_research enable row level security;
alter table public.social_research enable row level security;
alter table public.social_trends enable row level security;

-- Public read for discovery data
drop policy if exists postcodes_public_read on public.postcodes;
create policy postcodes_public_read on public.postcodes
  for select using (true);

drop policy if exists garages_public_read_active on public.garages;
create policy garages_public_read_active on public.garages
  for select using (status = 'active' or owner_user_id = auth.uid());

drop policy if exists passports_public_read on public.passports;
create policy passports_public_read on public.passports
  for select using (true);

-- Customers: own row
drop policy if exists customers_own on public.customers;
create policy customers_own on public.customers
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Vehicles: owner customer
drop policy if exists vehicles_own on public.vehicles;
create policy vehicles_own on public.vehicles
  for all using (
    customer_id in (select id from public.customers where user_id = auth.uid())
  )
  with check (
    customer_id in (select id from public.customers where user_id = auth.uid())
  );

-- Bookings: customer or garage owner
drop policy if exists bookings_participant on public.bookings;
create policy bookings_participant on public.bookings
  for select using (
    customer_id in (select id from public.customers where user_id = auth.uid())
    or garage_id in (select id from public.garages where owner_user_id = auth.uid())
  );

-- Garage owners manage own garage
drop policy if exists garages_owner_write on public.garages;
create policy garages_owner_write on public.garages
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- Keyword / social / bot: authenticated read (admin writes via service role)
drop policy if exists keyword_research_auth_read on public.keyword_research;
create policy keyword_research_auth_read on public.keyword_research
  for select to authenticated using (true);

drop policy if exists social_research_auth_read on public.social_research;
create policy social_research_auth_read on public.social_research
  for select to authenticated using (true);

drop policy if exists social_trends_auth_read on public.social_trends;
create policy social_trends_auth_read on public.social_trends
  for select to authenticated using (true);

drop policy if exists bot_market_auth_read on public.bot_market_sequence;
create policy bot_market_auth_read on public.bot_market_sequence
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for video proofs
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'video_proofs',
  'video_proofs',
  false,
  104857600, -- 100MB
  array['video/mp4','video/quicktime','video/webm','application/pdf','image/jpeg','image/png']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

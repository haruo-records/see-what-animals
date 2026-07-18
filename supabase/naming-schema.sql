-- ============================================================================
-- See What? — one-word observations + AI naming
-- Run in Supabase → SQL Editor. Complements observation_responses (schema.sql).
-- ============================================================================

-- Works and their naming state. published_at drives the 7-day window.
create table if not exists public.animals (
  id             text primary key,
  name           text,                         -- the AI's 2-word name, or null
  published_at   timestamptz not null,
  naming_status  text not null default 'observing'
                 check (naming_status in ('observing','named'))
);
create index if not exists animals_status_published_idx
  on public.animals (naming_status, published_at);

-- One word per observer (session) per animal.
create table if not exists public.observations (
  id                    uuid primary key default gen_random_uuid(),
  animal_id             text not null,
  word                  text not null,
  anonymous_session_id  uuid not null,
  created_at            timestamptz not null default now(),
  unique (animal_id, anonymous_session_id)
);
create index if not exists observations_animal_idx on public.observations (animal_id);

-- RLS on, no policies: only the server (service_role) reads/writes. Browsers
-- cannot INSERT/SELECT directly.
alter table public.animals enable row level security;
alter table public.observations enable row level security;

-- ---------------------------------------------------------------------------
-- Seed the current works. published_at sets each 7-day observation window.
-- animal-023 is open now; the others are past (their windows have closed, so the
-- cron will name them on its next run). Adjust ids/dates to your real works.
-- ---------------------------------------------------------------------------
insert into public.animals (id, name, published_at, naming_status) values
  ('animal-023', null, now(),                    'observing'),
  ('animal-022', null, now() - interval '10 days','observing'),
  ('animal-021', null, now() - interval '20 days','observing'),
  ('animal-020', null, now() - interval '30 days','observing')
on conflict (id) do nothing;

-- Publishing a new work later = insert one row:
--   insert into public.animals (id, published_at) values ('animal-024', now());

-- ============================================================================
-- Admin queries
-- ============================================================================
-- Words gathered per animal:
--   select animal_id, count(*), array_agg(word) from public.observations group by animal_id;
-- Named works:
--   select id, name, published_at from public.animals where naming_status = 'named' order by published_at desc;

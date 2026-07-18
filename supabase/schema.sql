-- ============================================================================
-- See What? — anonymous observation analytics
-- Run this whole file in Supabase → SQL Editor.
--
-- Already created the table from an earlier version? Run these migration lines
-- first (safe to run repeatedly), then re-run the rest of the file:
--   -- add session_id if missing
--   alter table public.observation_responses
--     add column if not exists session_id text not null default '';
--   -- add / backfill country_code as NOT NULL DEFAULT 'XX'
--   alter table public.observation_responses
--     add column if not exists country_code text;
--   update public.observation_responses set country_code = 'XX' where country_code is null;
--   alter table public.observation_responses alter column country_code set default 'XX';
--   alter table public.observation_responses alter column country_code set not null;
-- ============================================================================

-- 1) Table -------------------------------------------------------------------
create table if not exists public.observation_responses (
  id                   uuid primary key default gen_random_uuid(),
  session_id           text not null,  -- Observation Session id (e.g. "observation-023")
  question_id          text not null,
  answer_id            text not null,
  country_code         text not null default 'XX',  -- ISO 3166-1 alpha-2, or 'XX' when unknown
  language             text,          -- e.g. "ja-JP"
  device_type          text,          -- mobile | tablet | desktop | unknown
  referrer             text,          -- bare host or "direct" (never full URL)
  utm_source           text,
  utm_medium           text,
  utm_campaign         text,
  anonymous_session_id uuid not null, -- rotating anon id (no PII)
  game_version         text not null,
  question_version     text not null,
  answered_at          timestamptz not null default now()  -- SERVER time
);

-- 2) Indexes -----------------------------------------------------------------
create index if not exists observation_responses_question_id_idx
  on public.observation_responses (question_id);
create index if not exists observation_responses_country_code_idx
  on public.observation_responses (country_code);
create index if not exists observation_responses_answered_at_idx
  on public.observation_responses (answered_at);
create index if not exists observation_responses_session_question_idx
  on public.observation_responses (session_id, question_id);
create index if not exists observation_responses_session_question_country_idx
  on public.observation_responses (session_id, question_id, country_code);

-- 3) Row Level Security ------------------------------------------------------
-- Enable RLS with NO policies: the anon/auth keys can neither read nor write.
-- All access goes through our Next.js server using the service_role key, which
-- bypasses RLS. This prevents any direct browser INSERT/SELECT.
alter table public.observation_responses enable row level security;

-- 4) Aggregation function (returns the shape the results API expects) --------
--    Always scoped to ONE observation session AND question, so different runs
--    that reuse the same question_id never mix.
create or replace function public.get_observation_results(
  p_session_id  text,
  p_question_id text,
  p_country     text default null,
  p_min_sample  int  default 20
) returns jsonb
language plpgsql
stable
as $$
declare
  v_total         int;
  v_global        jsonb;
  v_country       jsonb;
  v_top           jsonb;
  v_country_total int;
begin
  select count(*) into v_total
  from public.observation_responses
  where session_id = p_session_id and question_id = p_question_id;

  -- global distribution
  select coalesce(jsonb_agg(obj order by cnt desc), '[]'::jsonb) into v_global
  from (
    select jsonb_build_object(
             'answerId', answer_id,
             'count', cnt,
             'percentage', case when v_total = 0 then 0
                                else round(cnt::numeric * 100 / v_total, 1) end
           ) as obj, cnt
    from (
      select answer_id, count(*) as cnt
      from public.observation_responses
      where session_id = p_session_id and question_id = p_question_id
      group by answer_id
    ) g
  ) gg;

  -- current country (withheld below the sample threshold)
  if p_country is null then
    v_country := jsonb_build_object('available', false, 'reason', 'no_country');
  else
    select count(*) into v_country_total
    from public.observation_responses
    where session_id = p_session_id and question_id = p_question_id
      and country_code = p_country;

    if v_country_total < p_min_sample then
      v_country := jsonb_build_object('available', false,
                     'reason', 'insufficient_sample', 'countryCode', p_country);
    else
      select jsonb_build_object(
               'available', true,
               'countryCode', p_country,
               'total', v_country_total,
               'results', coalesce(jsonb_agg(obj order by cnt desc), '[]'::jsonb)
             ) into v_country
      from (
        select jsonb_build_object(
                 'answerId', answer_id,
                 'count', cnt,
                 'percentage', round(cnt::numeric * 100 / v_country_total, 1)
               ) as obj, cnt
        from (
          select answer_id, count(*) as cnt
          from public.observation_responses
          where session_id = p_session_id and question_id = p_question_id
            and country_code = p_country
          group by answer_id
        ) c
      ) cc;
    end if;
  end if;

  -- top countries with enough samples (max 5)
  select coalesce(jsonb_agg(country_obj order by ctotal desc), '[]'::jsonb) into v_top
  from (
    select t.country_code, t.ctotal,
      jsonb_build_object(
        'countryCode', t.country_code,
        'total', t.ctotal,
        'results', (
          select coalesce(jsonb_agg(jsonb_build_object(
                   'answerId', answer_id, 'count', cnt,
                   'percentage', round(cnt::numeric * 100 / t.ctotal, 1)
                 ) order by cnt desc), '[]'::jsonb)
          from (
            select answer_id, count(*) as cnt
            from public.observation_responses r2
            where r2.session_id = p_session_id and r2.question_id = p_question_id
              and r2.country_code = t.country_code
            group by answer_id
          ) x
        )
      ) as country_obj
    from (
      select country_code, count(*) as ctotal
      from public.observation_responses
      where session_id = p_session_id and question_id = p_question_id
        and country_code <> 'XX'
      group by country_code
      having count(*) >= p_min_sample
      order by count(*) desc
      limit 5
    ) t
  ) tt;

  return jsonb_build_object(
    'questionId', p_question_id,
    'totalResponses', v_total,
    'global', v_global,
    'country', v_country,
    'topCountries', v_top
  );
end;
$$;

-- Only the server (service_role) may call the function.
revoke execute on function public.get_observation_results(text, text, text, int) from anon, authenticated;

-- ============================================================================
-- Admin / analysis queries (run manually as needed)
-- ============================================================================

-- Responses per answer, per session + question
-- select session_id, question_id, answer_id, count(*) as response_count
-- from public.observation_responses
-- group by session_id, question_id, answer_id
-- order by session_id, question_id, response_count desc;

-- Country distribution (per session + question)
-- select session_id, question_id, country_code, answer_id, count(*) as response_count
-- from public.observation_responses
-- group by session_id, question_id, country_code, answer_id
-- order by session_id, question_id, country_code, response_count desc;

-- Responses per day
-- select date_trunc('day', answered_at) as response_date, count(*) as response_count
-- from public.observation_responses
-- group by response_date
-- order by response_date desc;

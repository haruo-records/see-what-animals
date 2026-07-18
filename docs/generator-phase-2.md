# Generator phase 2 — daily generation and admin approval

**Status: not implemented.** This is the design and the reasoning, so the
decision can be made deliberately rather than discovered halfway through.

The brief specified daily automatic generation, Supabase persistence and an
admin approval screen. What is built instead is the local generator: it produces
candidates, you look at them, you register the ones you want. That covers the
whole job of making works. What phase 2 adds is not new capability but
*automation* of the choosing, and that is worth being clear-eyed about before
building it.

---

## Why it was not built now

**It is a second system, not a feature.** Daily cron plus persistence plus an
authenticated admin UI is roughly the size of everything under `generator/`
again, and almost none of it is about making works. It is about scheduling,
storage, sessions and access control.

**It needs a database the project does not have.** The site currently has no
Supabase tables for works; `data/*.ts` is the source of truth and the whole
thing builds statically. Adding persistence means two sources of truth for what
a work is, and a migration story for keeping them agreed.

**The bottleneck it removes is not the bottleneck.** Generating twelve
candidates takes under a second. The slow part is looking at them and deciding —
which is the part that should be slow, on a site about not rushing to a
conclusion. A daily batch nobody has looked at is twelve more things to review,
not fewer.

**A weekly work does not need a daily pipeline.** At one work a week,
`generator:generate` on a Monday costs one command and produces a gallery
immediately.

None of this means it should never exist. If the cadence rises, or if works are
authored from a phone away from a terminal, the calculus changes. The pieces
below are the parts that would be genuinely useful first, in the order they earn
their keep.

---

## If built, in this order

### 1. Persistence only (no cron, no UI)

The smallest useful piece: keep a durable record of every candidate generated,
so a batch is not lost when `generated/` is cleared.

```sql
-- Proposed. NOT executed. Review before running.
create table generated_batches (
  id                text primary key,          -- the seed, e.g. 'weekly-2026-07-20'
  seed              text not null,
  candidate_count   int  not null,
  generator_version text not null,
  rule_set_version  text not null,
  generated_at      timestamptz not null default now(),
  complete          boolean not null default false
);

create table generated_candidates (
  batch_id      text not null references generated_batches(id) on delete cascade,
  candidate_id  text not null,                 -- 'candidate-003'
  recipe        jsonb not null,
  svg           text  not null,
  constraint_id text  not null,
  has_motion    boolean not null,
  coverage      numeric(4,3) not null,
  status        text not null default 'pending'
                check (status in ('pending', 'adopted', 'rejected')),
  work_id       text,                          -- set when adopted
  primary key (batch_id, candidate_id)
);

create index generated_candidates_status on generated_candidates (status, batch_id);

alter table generated_batches     enable row level security;
alter table generated_candidates  enable row level security;
-- No public policies. Service-role access only: candidates are unpublished work.
```

Note there is no `published_at` here. Publication stays in `data/observation-sessions.ts`,
decided by `isPublic()`. Two systems deciding whether a work is visible is how a
work ends up visible in one and not the other.

### 2. Daily generation

```json
{ "crons": [
  { "path": "/api/cron/name",      "schedule": "0 3 * * *"  },
  { "path": "/api/cron/generate",  "schedule": "0 20 * * *" }
] }
```

`0 20 * * *` UTC is 05:00 JST the following day. The existing naming cron at
`0 3 * * *` is untouched.

Requirements:

- **Authenticate.** Verify `CRON_SECRET` against the `Authorization` header.
  Vercel cron paths are otherwise publicly reachable.
- **Be idempotent.** Key the batch on the Asia/Tokyo date (`tokyoDate()`), so a
  retry produces the same batch id and the insert is a no-op rather than a
  second batch.
- **Fail quietly.** A failed daily generation is not an incident. Log and return
  200; do not retry into a loop.

### 3. Admin approval

A route at `/admin/generator`, behind Supabase Auth, showing pending candidates
with adopt / reject.

Adoption from the browser is the part that needs care. `generator:register`
works by editing `data/*.ts` on disk, which a serverless function cannot do. The
options:

- **Commit via the GitHub API** — the admin action opens a commit against
  `data/*.ts` and `public/specimens/`. Keeps one source of truth. Needs a token
  with write access, and a deploy per adoption.
- **Move works to the database** — the site reads works from Supabase instead of
  `data/*.ts`. Cleaner long-term; a significant rewrite of how every page loads
  its data, and it gives up static generation.
- **Approve in the browser, register at the terminal** — the admin screen marks
  a candidate adopted; `generator:register --from-db` picks it up later. Least
  elegant, least risky, and preserves the seam between choosing and publishing.

The third is the one to start with.

---

## What must not break

- The existing `/api/cron/name` job and its schedule.
- The response and `sessionId` flow — nothing here touches how observations are
  collected.
- `isPublic()` as the single decider of visibility.
- The requirement that a publish date is chosen explicitly. If a daily pipeline
  ever assigns dates automatically, the project has quietly become a content
  mill, which is the opposite of what it is for.

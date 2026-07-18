# Publishing

## The gate

`lib/observation/publish.ts` exports `isPublic(session, now)`. Everything that
could expose a work goes through it:

- `app/page.tsx` — the featured work
- `app/observations/page.tsx` — the archive
- `app/observations/[slug]/page.tsx` — both `generateStaticParams` and the page
- `app/sitemap.ts`

A scheduled work has no URL at all. Its slug 404s rather than showing a
"coming soon" page: the fact that observation-031 is on its way is not something
to leak either.

## Asia/Tokyo

Publication is decided in Tokyo, not UTC. A work dated `2026-07-22` becomes
public at `2026-07-21T15:00:00Z`. Deciding in UTC would publish it nine hours
early for a Tokyo reader.

`register` writes the correct instant into `startsAt`. `tokyoMidnightIso()` and
`tokyoDate()` handle the conversion; JST has no daylight saving, so the offset
is a constant.

## No deploy needed

The gate reads the clock at request time, so a scheduled work goes live on its
date without a redeploy — provided the route is not statically frozen past that
point. `generateStaticParams` deliberately omits scheduled slugs, so they are
rendered on demand when they first become public.

## Dates are always chosen

`--publish-date` is required and has no default, not even "today". A date nobody
chose is not a decision. If the user has not supplied one, ask.

## Scheduling several at once

Register each separately with its own date:

```bash
npm run generator:register -- --batch b --candidate candidate-003 --publish-date 2026-07-22
npm run generator:register -- --batch b --candidate candidate-007 --publish-date 2026-07-29
```

Close dates default to publish + 6 days; override with `--close-date`.

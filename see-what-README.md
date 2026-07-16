# See What?

**Observation is a luxury.** A project for looking before naming.

See What? is the public brand + observation-game site. The **animals archive**
(`https://haruo-records.github.io/animals-site/`) remains the permanent home of
the works themselves. This site never duplicates work-detail pages — it links
back to the archive.

> animals is the place they exist. See What? is where they are observed together.

---

## What is in this build (Phase 1)

Fully built and wired to mock data + `localStorage`:

- **Home (`/`) = the current observation game.** Opening the site *is* the
  experience — a two-column page (framed work on the left, the game on the right).
  There is no start screen and **no "begin" button**: looking at the work already
  is the observation, so the first question ("What do you see?") is present at
  once. On mobile it stacks to one column.
- **Observation Result (`/observations/[slug]`)** — how a form was seen, as
  percentages only. No numbers of people anywhere (per choice or total), and no
  status or aphorism text: the record is just the work, the distribution, the
  names/notes others gave it, and the link back to the animals archive. `count`
  and `totalResponses` stay in the data for future analysis. Same two-column shape
  as the game.
- **No observation numbers on screen.** `id` / `slug` / `observationNumber` stay
  in the data as management fields, but nothing numeric is shown to the visitor.
- **Past Observations (`/observations`)** — a register of closed sessions,
  reached from a result (not from the nav).
- **About**, **Field Notes** (list + detail), **Shop** (list + detail), **Contact**, **Privacy**
- **404 / error / loading**, sitemap, robots, JSON-LD, OGP/metadata
- Design tokens, shared components, types, mock data, analytics helper, service/repository layer

**Routing note:** the old `/observe` route was removed; it now **301-redirects to
`/`** (`next.config.mjs`). The observation screen is managed in exactly one place.

**Placeholders:** works are drawn as deterministic SVG "specimen" forms
(`components/observation/specimen-form.tsx`) — no stock photos, no AI imagery.
Replace with real images when ready (see *Replacing images* below).

**Mock data:** results are placeholders (`data/mock-results.ts`). The UI presents
them honestly (small counts show *"the record is still forming"*). Swap for a real
datastore via `lib/observation/result-service.ts`.

---

## Run locally

Requires Node 18.18+ (Node 20+ recommended).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
npm run typecheck  # tsc --noEmit (type-only check, no build)
```

> This project was authored in an environment **without network access**, so
> `npm install` / `npm run build` / `npm run lint` were **not executed there**
> (the npm registry was unreachable). Run them once locally — they are expected
> to pass. If anything trips, it will almost certainly be the dependency install,
> not the source. A quick order that surfaces problems fastest:
> `npm install` → `npm run typecheck` → `npm run lint` → `npm run build`.

---

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **New Project → import the repo**. Framework preset **Next.js** is auto-detected.
3. Add environment variables (below) in **Project → Settings → Environment Variables**.
4. Deploy. After changing env vars later, **Redeploy** for them to take effect.

### Environment variables (`.env.example`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, OGP, sitemap (no trailing slash) |
| `NEXT_PUBLIC_ANIMALS_ARCHIVE_URL` | animals archive URL (defaults to the current GitHub Pages URL) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 id — leave empty to disable analytics |
| `NEXT_PUBLIC_GTM_ID` | GTM id — leave empty to disable |

Copy `.env.example` to `.env.local` for local dev.

---

## How to add / edit content

Everything is data. You never touch component code to add a week's observation.

### Add a new work (AnimalReference) — `data/animal-references.ts`

```ts
{
  id: "animal-024",
  specimenNumber: "024",
  imageUrl: "specimen:animal-024",     // placeholder, OR "/specimens/animal-024.png"
  archiveUrl: "https://haruo-records.github.io/animals-site/",
  alt: "An abstract form with … (describe shape, never assert meaning)",
}
```

`alt` must describe form, not identity — e.g. *"An abstract form with a rounded
body and three projecting shapes,"* not *"a bird-shaped creature."*

### Add a new Observation Session — `data/observation-sessions.ts`

```ts
{
  id: "observation-024",
  slug: "observation-024",
  observationNumber: "024",
  animalId: "animal-024",              // points at animal-references.ts
  intro: { en: "…", ja: "…" },
  startsAt: "2026-07-20T00:00:00.000Z",
  closesAt: "2026-07-26T23:59:59.000Z",
  questionIds: ["q-see", "q-move", "q-name"],
  allowPostCloseResponses: false,
  featured: true,                       // only one featured at a time
}
```

- **Set the run length here, not in code.** 7 / 14 / 30 days are just different
  `closesAt` dates.
- Only one session should have `featured: true` — it drives the game on `/`.
- **Status is automatic.** `scheduled | open | closed` is derived from the clock
  in `lib/observation/session-status.ts`. Set an explicit `status` only to override.
- **Demo note:** the featured session uses a `weeklyWindow()` helper so it is
  always mid-run while you evaluate the template. **Before launch, open
  `data/observation-sessions.ts` and set `USE_DEMO_WINDOW = false`** — the featured
  session then uses the explicit `FEATURED_STARTS_AT` / `FEATURED_CLOSES_AT` ISO
  strings right above it. That single flag is the only change needed to ship real
  dates.

### Post-close responses

Set `allowPostCloseResponses: true` to keep accepting answers after `closesAt`
(archive observations). `false` = view-only after close. This is per-session data.

### Add / edit questions — `data/questions.ts`

Add a question object and reference its `id` from a session's `questionIds`.
Types: `single-choice`, `free-text` (both implemented in the flow),
`multiple-choice`, `scale` (types defined, add UI when needed). Questions are
**never scored**.

`required: true` disables **Next** until the question is answered (works for both
choice and free-text). **Skip is always available** and moves on without recording
an answer — required never traps anyone. `q-see` ships as `required: true` to
demonstrate this; the rest are optional.

### Change mock results — `data/mock-results.ts`

Keyed by session id. Percentages are pre-computed on purpose (don't imply more
precision than exists). Keep minority answers — never merge them away.

### Add a Field Note — `data/field-notes.ts`

Append an entry with a new `slug`. `body` is a small block list
(`paragraph | heading | figure | quote`) so figures and captions sit where you want.

### Add a product — `data/products.ts`

Append an entry. **Purchase is external:** set `externalPurchaseUrl` (Shopify /
Stripe / BASE / STORES / …). Product data and the EC link are deliberately
separate, so you are never coupled to one provider. No checkout runs on this site.

### Navigation — `data/navigation.ts`

`/` is itself the game, so **Play is not in the nav**. The header is just the
wordmark (→ `/`, the current observation) plus **About · Shop**. `primaryNav`
holds those two; `footerNav` holds the utility trio **animals Archive · Contact ·
Privacy**.

Field Notes and previous observations are **not** in the nav by design — they are
reached after finishing a play ("Previous observations" and the Field Notes link
on the result). To resurface either in the header later, add an entry to
`primaryNav`. Every item has an `enabled` flag if you want to stage a route
without deleting it.

---

## Replacing images

Placeholders are generated SVG forms keyed by `"specimen:<seed>"`. To use real
imagery:

1. Put files in `public/specimens/` (e.g. `public/specimens/animal-024.png`).
2. Change the data field to the path, e.g. `imageUrl: "/specimens/animal-024.png"`.
3. `SpecimenView` / gallery / figure switch to `next/image` automatically when the
   value does **not** start with `specimen:`.
4. To load images from the archive or a CDN later, add the host to
   `images.remotePatterns` in `next.config.mjs`.

Do **not** use unrelated stock or AI-looking abstract images (see brief §37/§38).

---

## Set the animals archive URL

Default lives in `data/site-settings.ts` and reads `NEXT_PUBLIC_ANIMALS_ARCHIVE_URL`.
Per-work links use each `AnimalReference.archiveUrl`, so you can later point
individual forms at their own permanent archive URLs.

---

## Analytics (GA4 / GTM)

- One helper: `lib/analytics.ts` → `trackEvent({ event, … })`. Components never
  push to `dataLayer` directly.
- With no id set, events are safe no-ops (logged to console in dev only).
- To enable: set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and/or `NEXT_PUBLIC_GTM_ID`, then
  add the GTM/GA `<Script>` where marked in `app/layout.tsx`.
- Events emitted: `observation_view/start/answer/skip/note_submit/complete/result_view`,
  `animals_archive_click`, `field_note_view`, `product_view`, `shop_click`,
  `newsletter_click`, `contact_click`. Archive clicks send
  `{ observation_id, animal_id, archive_url }`. Archive-download tracking is the
  archive site's responsibility — this site only measures send-off.

---

## Future backend (Supabase / Firebase / API / D1 / Vercel Postgres)

The UI never touches storage directly.

- `components/*` → `lib/observation/observation-service.ts` → `ObservationRepository`.
- v0 uses `LocalObservationRepository` (localStorage) for simple per-device
  de-duplication.
- Swap in a backend by implementing `ObservationRepository` and calling
  `setObservationRepository(new YourRepo())` once at startup — **no component
  changes**. `result-service.ts` is where result reads move from mock → datastore.

---

## Future CMS / EC

- **CMS:** Field Notes / products are typed data (`data/*.ts`). Move them behind a
  CMS by replacing the `data/*` reads with a fetch that returns the same types.
- **EC:** already decoupled via `externalPurchaseUrl`. Add a provider by setting
  the link; no code coupling.

---

## Multi-language

**Status: Japanese dictionary is prepared; locale routing is not implemented.**
The UI ships in English. A complete Japanese dictionary exists (`locales/ja.ts`)
and is type-checked against the English one, but there are **no `/ja` routes and
no locale switch wired up yet** — `getDictionary()` is currently always called
with `"en"`.

To turn Japanese on later (not done in this build):

- add an `app/[locale]/` route group (or middleware-based locale detection),
- thread the active `locale` into `getDictionary(locale)` instead of the hardcoded
  `"en"`,
- add a language control (a `nav.language` label already exists).

Copy already lives entirely in `locales/*`, not in components, so no component
changes are needed to localize — only the routing/switch layer above.

---

---

## Fonts (and matching the animals sister site)

All font loading goes through one file: **`app/fonts.ts`**, which exports
`sans` / `serif` / `jp`. `layout.tsx` imports only from there — so the typeface is
changed in exactly one place.

**Sister-brand alignment.** See What? should read as the same hand as the animals
archive (`https://haruo-records.github.io/animals-site/`). The animals site's
raw CSS could not be machine-read here (the page reader strips styles), so the
*exact* face is not hard-verified. What is matched is the observable rhythm:
light weights (no bold anywhere), airy small-caps labels (`0.18em`), generous
line-height, restrained heading sizes, short centred lines, and minimal
explanatory copy. The current faces are a quiet editorial pairing — **Source
Serif 4** (display / wordmark / poetic lines), **Instrument Sans** (body / labels),
**Noto Sans JP** (Japanese). **To lock 100% parity, set the animals face(s) in
`app/fonts.ts`** (or drop local files per `app/fonts.local.example.ts`); nothing
else needs to change.

- Uses `next/font/google`, self-hosted at build time (Vercel builds fine).
- **Resilience:** every face has `display: "swap"`, a system fallback stack, and
  `adjustFontFallback`; Tailwind chains `var(--font-*) → system-ui → sans-serif`.
- **Fully offline build?** Flip `USE_LOCAL_FONTS = true` in `app/fonts.ts` and
  follow `app/fonts.local.example.ts`.

---

## Design tokens

- Source of truth: `app/globals.css` (CSS variables) **and** `tailwind.config.ts`
  (same values as Tailwind theme). Change both together.
- Palette: Paper / Plaster / **Canvas** / Stone / **Muted** / Charcoal + Ink, plus
  accents Moss / Water / Clay / Sand / Dusk. **Muted** (`--color-muted`) is
  secondary *text* only (labels, hints, meta) — ~20% darker than Stone so it stays
  quiet but readable. Lines, the frame hairline, and backgrounds keep **Stone**, so
  darkening the text never touches them.
- **The framing model matters.** A work is shown as four stacked layers so it
  reads as one mounted object on a wall, not a coloured banner:
  `Paper` (the page — soft, unchanged) → `Plaster` (the mat, a touch darker) →
  `Canvas` (`--color-canvas`, near-white — the *only* white surface, where the
  work is mounted) → the animals artwork. This lives in
  `components/observation/specimen-view.tsx`; keep the page Paper and only the
  canvas white.
- A **Dusk** dark context is scaffolded: add `data-theme="dusk"` on a section or
  `<html>` to opt in (for special exhibitions / night observation). Not enabled by default.
- Type scale, spacing rhythm, radii, and the two motion-safe animations
  (`rise-in`, `breathe`) live in `tailwind.config.ts`. `prefers-reduced-motion`
  is honoured globally in `globals.css`.

---

## Sound (future)

Not implemented in v0 by design. When added: no autoplay, play only after a user
gesture, and persist a mute preference. A `nav.sound` label already exists in the
dictionaries.

---

## Brand guardrails (please keep)

- The **work comes first**; UI is the frame, never louder than the form.
- No scores, ranks, levels, badges, streaks, gacha, completion effects, FOMO.
- Never fix a work's meaning; keep minority readings; free text is optional.
- Don't duplicate animals work-detail pages here; link to the archive instead.
- No iframe-embedding or scraping of the archive.

---

## Changed / created files

This is a fresh project; every file listed by `find . -type f` (excluding
`node_modules`, `.next`) was created for it. Key directories:

```
app/            routes (App Router)
components/     layout · observation · observations · editorial · shop · ui
data/           animal-references · observation-sessions · questions · mock-results
                products · field-notes · navigation · site-settings
lib/            observation service/repository/result/status + analytics
locales/        en · ja dictionaries
types/          all domain types
public/specimens/  drop real work images here
```

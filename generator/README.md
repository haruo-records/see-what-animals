# The work generator

Builds candidate works out of small visual modules, so that making a new
observation is a matter of choosing rather than drawing.

Nothing here publishes anything. Generating and publishing are two separate
acts, and the seam between them is one command you have to type.

---

## The five commands

```bash
npm run generator:generate -- --count 12 --seed weekly-2026-07-20
```
Builds candidates into `generated/batches/<seed>/` and writes a gallery you can
open in a browser. Nothing else is touched.

```bash
npm run generator:preview -- --batch weekly-2026-07-20
```
Rebuilds that gallery. Useful after editing a module.

```bash
npm run generator:register -- --batch weekly-2026-07-20 --candidate candidate-003 --publish-date 2026-07-22
```
Adopts one candidate as a work. This is the only command that changes the site.

```bash
npm run generator:module-create -- --category body --name spiral
```
Scaffolds a new module and tells you the two lines to add to the registry.

```bash
npm run generator:validate
npm run generator:test
```
Checks the registry, the recipes, the site data and the three questions.

---

## What a work is made of

Seven kinds of module. Each is a small file describing one visual idea.

| Category | Count | What it decides |
|---|---|---|
| **body** | 5 | the main mass — oval, ribbon, cluster, ring, segmented |
| **appendage** | 6 | what attaches — thin-line, loop, branch, plate, soft-spike, short-bar |
| **pattern** | 4 | surface — dots, rings, stripes, repeated-lines |
| **arrangement** | 5 | where things go — radial, linear, nested, asymmetric, almost-symmetrical |
| **transformation** | 6 | the deliberate imperfection |
| **motion** | 5 | how it changes in place |
| **palette** | 3 | ink, faint, slate |

A work is: one body, one arrangement, one palette, 0–2 appendage kinds, 0–2
pattern kinds, 1–3 transformations, and at most one motion. At least one
appendage or pattern is always present — a body on its own is not a work.

### Two files per module

Metadata is serialisable and goes into the recipe. The drawing function is a
pure function and never does. That split is what makes a work rebuildable from
its recipe months later.

---

## The rules that are not negotiable

**Modules describe form, never meaning.** A module may be called `thin-line`.
It may not be called `leg`. Tags may say `softness` and `repetition`; they may
not say `cute` or `bird`. `generator:validate` fails on a tag that fixes a
meaning, and `module-create` refuses a name like `wing` outright.

The reason is the whole project: the work does not decide what it is, the person
looking at it does. If a module is named `leg`, that decision has already been
made in code before anyone has looked.

**Every work has at least one deliberate imperfection.** A transformation is
required. Symmetry that closes perfectly stops being looked at.

**Motion changes a form in place.** It never travels toward a destination.
Motion modules animate about the group origin; the renderer puts that origin at
the centre of the canvas.

**Randomness is seeded, always.** `Math.random()` appears nowhere under
`generator/`. The same seed, generator version, rule-set version and module
versions must rebuild the same work.

---

## The publish date

`--publish-date` is required and has no default. A date nobody chose is not a
decision.

Publication is decided in **Asia/Tokyo**. A work dated `2026-07-22` becomes
public at 15:00 UTC on the 21st. Everything that could expose a work — the home
page, the archive, the sitemap, the pre-rendered routes — goes through
`isPublic()` in `lib/observation/publish.ts`.

Until that instant the work is not merely hidden; it has no URL. A scheduled
slug returns 404 rather than a "coming soon" page, because the fact that
observation-031 exists is not something to leak either.

---

## Adding a module

```bash
npm run generator:module-create -- --category appendage --name hook --tags shape,rigidity
```

Then add the two printed lines to `generator/registry/module-registry.ts`,
replace the scaffolded `draw` body, and:

```bash
npm run generator:validate
npm run generator:generate -- --count 12 --seed trying-hook
```

The registry is edited by hand on purpose. It is the one file where a mistake
takes everything down with it, and rewriting an import block by regex is the
kind of thing that works forty times and then quietly mangles the file.

### Changing an existing module

If the change alters what a module draws for the same parameters, **bump its
`version`**. Recipes pin module versions, so a bump is how an old work announces
that it would render differently now. `validate` reports the drift as a warning.

---

## What is committed and what is not

- `generated/` — **gitignored**. Candidates are working material.
- `content/works/<id>.recipe.json` — **committed**. How a published work was made.
- `public/specimens/<id>.svg` — **committed**. The work itself.

---

## Directory map

```
generator/
├── random/seeded-random.ts      the only source of randomness
├── registry/
│   ├── module-types.ts          the module contract
│   └── module-registry.ts       the one file that knows every module
├── modules/<category>/          one file per module
├── recipes/
│   ├── recipe-types.ts          the serialisable record
│   ├── create-recipe.ts         decides composition — never draws
│   └── validate-recipe.ts
├── rules/
│   ├── compatibility.ts         limits on one candidate
│   └── diversity-rules.ts       limits across a batch
├── render/
│   ├── render-svg.ts            recipe → SVG — decides nothing
│   ├── geometry.ts              measures what was actually drawn
│   └── build-batch.ts
├── scripts/                     the CLIs
└── tests/
```

The direction of dependency is one-way: modules know nothing about the registry,
the registry knows nothing about recipes, and the renderer makes no choices.

---

## Not built

Daily automatic generation, Supabase persistence and an admin approval screen
were specified and are **not** implemented. See `docs/generator-phase-2.md` for
the design and the reasoning about what it would cost.

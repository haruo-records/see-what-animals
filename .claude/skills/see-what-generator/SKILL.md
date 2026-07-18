---
name: see-what-generator
description: Generate, review, and register candidate works for the See What? observation site. Use when the user wants new works or observations, asks to run or explain the generator, wants to add or change a visual module, asks why a candidate looks a certain way, or needs to schedule a work's publish date. Also use when reviewing a batch, or when a generator command fails.
---

# See What? work generator

The generator builds candidate works from small visual modules. This skill
orchestrates the existing CLIs. **It does not reimplement any of their logic** —
every rule lives in `generator/`, and duplicating a rule here would mean two
versions of it that drift apart.

## The rule that matters most

The generator describes **form**, never **meaning**. A module is `thin-line`,
not `leg`. A tag is `softness`, not `cute`. The person looking at a work decides
what it is; nothing in code may decide it for them.

If asked to add a module named for a body part, an animal, or a mood, say why
that will be refused and offer a form-based name instead. `module-create`
enforces this, but it is better to explain it than to let the command reject it.

## Generating

```bash
npm run generator:generate -- --count 12 --seed weekly-2026-07-20
```

Use a meaningful seed. It is the batch's name, it is reproducible, and it is what
lets the same twelve candidates be rebuilt later. Add `--json` when you need to
read the result programmatically.

Then tell the user the gallery path and **stop**. Choosing a work is theirs.
Do not recommend a candidate unless asked; if asked, describe what each one is
doing structurally rather than what it resembles.

## Registering

```bash
npm run generator:register -- --batch <batch> --candidate <candidate-00N> --publish-date YYYY-MM-DD
```

Never invent a publish date. If the user has not given one, ask. The command
requires it precisely so that the date is always a decision.

Run with `--dry-run` first when the user seems unsure.

This command edits `data/animal-references.ts` and `data/observation-sessions.ts`
and writes into `public/specimens/` and `content/works/`. After it succeeds,
remind the user to review the generated alt text — it is written from the
composition constraint and should be checked before it ships.

## Adding a module

```bash
npm run generator:module-create -- --category <category> --name <kebab-name> --tags <a,b>
```

The command writes the file and prints two lines to add to
`generator/registry/module-registry.ts`. Add them yourself, then replace the
scaffolded `draw` body with something worth looking at, then:

```bash
npm run generator:validate
npm run generator:generate -- --count 12 --seed trying-<name>
```

If you change what an existing module draws, bump its `version`.

## Checking

```bash
npm run generator:validate     # registry, recipes, site data, the three questions
npm run generator:test         # 40 tests
npm run typecheck
```

Run `validate` after any change under `generator/`. Run `typecheck` before
telling the user a change is done.

## Reference

- `references/principles.md` — the aesthetic commitments and why they are rules
- `references/module-schema.md` — the module contract
- `references/publishing.md` — publish dates, Asia/Tokyo, the gate
- `references/workflow.md` — the weekly routine, end to end

## Never

- Never publish without an explicit publish date from the user.
- Never edit `data/animal-references.ts` or `data/observation-sessions.ts` by
  hand to add a work — use `generator:register`, which keeps the SVG, the recipe
  sidecar and the two data files consistent.
- Never re-register a candidate that is already registered. The command refuses,
  and working around it would publish one drawing as two works.
- Never write to `generated/` by hand; it is working output and is gitignored.
- Never name a module, tag, or alt text after what a work resembles.

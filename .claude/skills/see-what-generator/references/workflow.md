# The weekly routine

## 1. Generate

```bash
npm run generator:generate -- --count 12 --seed weekly-2026-07-20
```

Name the seed after the week. It is reproducible: the same seed rebuilds the
same twelve candidates.

The command prints the spread — which bodies, arrangements and constraints
appeared, and how many move. A batch dominated by one body is worth
regenerating with a different seed.

## 2. Look

Open `generated/batches/<seed>/index.html`.

The gallery has: freeze motion, dark, white ground, three sizes, and click to
zoom. Freezing motion matters — a work should hold up still, and motion should
add to something that already works rather than carry it.

## 3. Choose

Zero is a legitimate outcome. Regenerate with a different seed rather than
settling.

## 4. Register

```bash
npm run generator:register -- --batch weekly-2026-07-20 --candidate candidate-003 --publish-date 2026-07-22 --dry-run
```

Check the dry run, then run it without `--dry-run`.

## 5. Check the alt text

Open `data/animal-references.ts`. The generated alt text describes the
composition constraint. Read it and make sure it describes **form** and does not
assert what the work is.

This is the one step that cannot be automated, because it is exactly the
judgement the project is about.

## 6. Verify and ship

```bash
npm run generator:validate
npm run typecheck
npm run build
```

Commit and push. Vercel deploys. The work stays invisible until its date.

## When something fails

- **"could not be generated in 40 attempts"** — the diversity rules could not
  find a distinct enough candidate. Ask for fewer, or add a module.
- **"Output already exists"** — that seed has been used. Choose another, or pass
  `--force` if you meant to replace it.
- **"already registered as animal-0NN"** — that candidate is already a work.
- **validate reports version drift** — a module changed after a recipe pinned
  it. The old work will render differently. Decide whether that is acceptable.

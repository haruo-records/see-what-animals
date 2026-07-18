import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { validateRecipe, hasErrors } from "../recipes/validate-recipe";
import { assertSafeSegment } from "../render/build-batch";
import type { WorkRecipe } from "../recipes/recipe-types";
import { parseArgs, requireString, bool, fail, CliError, type Args } from "./cli";

/**
 * generator:register — ADOPTION. The one place a candidate becomes a work.
 *
 * Generation and publication are deliberately two separate acts, and this is
 * the seam. Nothing reaches the site without this command being typed, with a
 * publish date spelled out in full. There is no default of "today": a date
 * nobody chose is not a decision.
 *
 * The command is additive. It appends to the two data files and copies one SVG.
 * It never edits an existing entry, never removes anything, and refuses outright
 * if the id is already present — even with --force. Overwriting a published work
 * would silently invalidate every response already collected against it.
 */

const KNOWN = [
  "batch",
  "candidate",
  "publish-date",
  "close-date",
  "id",
  "number",
  "output",
  "alt",
  "dry-run",
  "json",
  "help",
];

const HELP = `
generator:register — adopt one candidate as a work

  npm run generator:register -- \\
    --batch weekly-2026-07-20 \\
    --candidate candidate-003 \\
    --publish-date 2026-07-22

  --batch <id>          which batch the candidate is in            (required)
  --candidate <id>      which candidate, e.g. candidate-003        (required)
  --publish-date <date> YYYY-MM-DD, Asia/Tokyo. No default.        (required)
  --close-date <date>   YYYY-MM-DD. Default: publish date + 6 days.
  --id <animal-id>      override the generated work id
  --number <nnn>        override the specimen / observation number
  --alt <text>          the accessibility description. Describe FORM, not meaning.
  --dry-run             report what would change and write nothing
  --json                machine-readable result
`;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function tokyoIso(date: string, endOfDay = false): string {
  return new Date(`${date}T${endOfDay ? "23:59:59" : "00:00:00"}+09:00`).toISOString();
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00+09:00`);
  d.setUTCDate(d.getUTCDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Highest existing NNN across both data files, so numbering never collides. */
function nextNumber(): string {
  let highest = 0;
  for (const [path, pattern] of [
    ["data/animal-references.ts", /id:\s*"animal-(\d+)"/g],
    ["data/observation-sessions.ts", /observationNumber:\s*"(\d+)"/g],
  ] as const) {
    if (!existsSync(path)) continue;
    for (const m of readFileSync(path, "utf8").matchAll(pattern)) {
      highest = Math.max(highest, Number(m[1]));
    }
  }
  return String(highest + 1).padStart(3, "0");
}

/**
 * Inserts an entry at the head of an exported array. Newest first, which is how
 * both data files are already ordered.
 *
 * The bracket has to be the one that opens the ARRAY LITERAL, not the first `[`
 * after the declaration. These files are written
 *
 *     export const animalReferences: AnimalReference[] = [
 *
 * so the first bracket belongs to the type annotation. Taking it inserts the
 * new work inside `AnimalReference[...]` and produces a file that no longer
 * parses. Anchoring on `= [` is the whole fix.
 */
function prependToArray(source: string, declaration: string, entry: string): string {
  const index = source.indexOf(declaration);
  if (index === -1) {
    throw new CliError(`Could not find "${declaration}". The data file may have been restructured.`);
  }
  const assignment = /=\s*\[/g;
  assignment.lastIndex = index;
  const match = assignment.exec(source);
  if (!match) {
    throw new CliError(
      `Could not find the array literal after "${declaration}".\n` +
        `  Expected something of the form "export const x: T[] = [".`,
    );
  }
  const open = match.index + match[0].length;
  return source.slice(0, open) + "\n" + entry + source.slice(open);
}

function main(args: Args) {
  if (bool(args, "help")) {
    process.stdout.write(HELP);
    return;
  }

  const batch = assertSafeSegment(requireString(args, "batch", "e.g. --batch weekly-2026-07-20"), "Batch id");
  const candidate = assertSafeSegment(
    requireString(args, "candidate", "e.g. --candidate candidate-003"),
    "Candidate id",
  );
  const publishDate = requireString(
    args,
    "publish-date",
    "e.g. --publish-date 2026-07-22. There is no default: the date must be chosen.",
  );

  if (!DATE.test(publishDate)) throw new CliError(`--publish-date must be YYYY-MM-DD. Received "${publishDate}".`);
  if (Number.isNaN(new Date(`${publishDate}T00:00:00+09:00`).getTime())) {
    throw new CliError(`"${publishDate}" is not a real date.`);
  }

  const closeDate = typeof args.flags["close-date"] === "string" ? args.flags["close-date"] : addDays(publishDate, 6);
  if (!DATE.test(closeDate)) throw new CliError(`--close-date must be YYYY-MM-DD. Received "${closeDate}".`);
  if (new Date(`${closeDate}T00:00:00+09:00`) < new Date(`${publishDate}T00:00:00+09:00`)) {
    throw new CliError(`--close-date (${closeDate}) is before --publish-date (${publishDate}).`);
  }

  // ── locate the candidate ──────────────────────────────────────────────────
  const root = typeof args.flags.output === "string" ? args.flags.output : join("generated", "batches");
  const batchDir = join(root, batch);
  if (!existsSync(batchDir)) throw new CliError(`No batch at ${batchDir}.`);

  const candidateDir = join(batchDir, candidate);
  if (!existsSync(candidateDir)) throw new CliError(`No candidate at ${candidateDir}.`);

  const recipePath = join(candidateDir, "recipe.json");
  const svgPath = join(candidateDir, "preview.svg");
  if (!existsSync(recipePath)) throw new CliError(`${recipePath} is missing.`);
  if (!existsSync(svgPath)) throw new CliError(`${svgPath} is missing.`);

  const recipe: WorkRecipe = JSON.parse(readFileSync(recipePath, "utf8"));
  const issues = validateRecipe(recipe);
  if (hasErrors(issues)) {
    throw new CliError(
      `${candidate} does not validate and will not be registered:\n` +
        issues
          .filter((i) => i.level === "error")
          .map((i) => `    ✗ ${i.message}`)
          .join("\n"),
    );
  }

  // ── identity ──────────────────────────────────────────────────────────────
  const number = typeof args.flags.number === "string" ? args.flags.number.padStart(3, "0") : nextNumber();
  const animalId = typeof args.flags.id === "string" ? args.flags.id : `animal-${number}`;
  const sessionId = `observation-${number}`;
  assertSafeSegment(animalId, "Work id");

  const animalsSource = readFileSync("data/animal-references.ts", "utf8");
  const sessionsSource = readFileSync("data/observation-sessions.ts", "utf8");

  // Duplicates are refused unconditionally. --force does not apply here.
  if (animalsSource.includes(`id: "${animalId}"`)) {
    throw new CliError(
      `A work with id "${animalId}" already exists in data/animal-references.ts.\n` +
        `  Registering over it would detach the responses already collected against it.\n` +
        `  Pass --id or --number to choose a different identity.`,
    );
  }
  if (sessionsSource.includes(`id: "${sessionId}"`)) {
    throw new CliError(`A session with id "${sessionId}" already exists in data/observation-sessions.ts.`);
  }

  const registryPath = join("content", "works", `${animalId}.recipe.json`);
  if (existsSync(registryPath)) {
    throw new CliError(`${registryPath} already exists — this work id has been registered already.`);
  }

  // A new id is allocated automatically, so "the id is free" does not prove the
  // CANDIDATE is unregistered — running the same command twice would happily
  // publish the same drawing as two different works. The sidecars record where
  // each work came from, so that can be checked.
  const worksDir = join("content", "works");
  if (existsSync(worksDir)) {
    for (const file of readdirSync(worksDir)) {
      if (!file.endsWith(".recipe.json")) continue;
      try {
        const existing = JSON.parse(readFileSync(join(worksDir, file), "utf8"));
        if (existing?.source?.batch === batch && existing?.source?.candidate === candidate) {
          throw new CliError(
            `${batch}/${candidate} is already registered as ${file.replace(".recipe.json", "")}.\n` +
              `  Registering it again would publish the same drawing twice under different numbers.`,
          );
        }
      } catch (err) {
        if (err instanceof CliError) throw err;
        // An unreadable sidecar is not a reason to block a registration.
      }
    }
  }

  const alt =
    typeof args.flags.alt === "string"
      ? args.flags.alt
      : `An abstract form. ${recipe.composition.constraint.replace(/-/g, " ")}.`;

  const publicSvg = join("public", "specimens", `${animalId}.svg`);

  const animalEntry = `  {
    id: "${animalId}",
    specimenNumber: "${number}",
    imageUrl: "/specimens/${animalId}.svg",
    archiveUrl: "https://haruo-records.github.io/animals-site/",
    // Describe form only. This text must not decide what the work is.
    alt: ${JSON.stringify(alt)},
  },
`;

  const sessionEntry = `  {
    id: "${sessionId}",
    slug: "${sessionId}",
    observationNumber: "${number}",
    animalId: "${animalId}",
    // Asia/Tokyo midnight on ${publishDate}. Until this instant, isPublic()
    // keeps the work out of the archive, the sitemap and every listing.
    startsAt: "${tokyoIso(publishDate)}",
    closesAt: "${tokyoIso(closeDate, true)}",
    questionIds: ["q-see", "q-stands", "q-name"],
    allowPostCloseResponses: false,
    featured: false,
  },
`;

  const changed = [
    publicSvg,
    registryPath,
    "data/animal-references.ts",
    "data/observation-sessions.ts",
  ];

  if (bool(args, "dry-run")) {
    process.stdout.write(
      `\nDRY RUN — nothing written\n\n` +
        `  work id       ${animalId}\n` +
        `  session id    ${sessionId}\n` +
        `  number        ${number}\n` +
        `  publishes     ${publishDate} 00:00 Asia/Tokyo  (${tokyoIso(publishDate)})\n` +
        `  closes        ${closeDate} 23:59 Asia/Tokyo\n` +
        `  constraint    ${recipe.composition.constraint}\n\n` +
        `Would change:\n${changed.map((f) => `  + ${f}`).join("\n")}\n\n`,
    );
    return;
  }

  mkdirSync(join("public", "specimens"), { recursive: true });
  mkdirSync(join("content", "works"), { recursive: true });

  copyFileSync(svgPath, publicSvg);
  // The sidecar carries the recipe plus where it came from, so the work can be
  // rebuilt and so a second registration of the same candidate can be caught.
  writeFileSync(
    registryPath,
    JSON.stringify({ ...recipe, source: { batch, candidate }, registeredAt: new Date().toISOString() }, null, 2) + "\n",
    "utf8",
  );
  writeFileSync(
    "data/animal-references.ts",
    prependToArray(animalsSource, "export const animalReferences", animalEntry),
    "utf8",
  );
  writeFileSync(
    "data/observation-sessions.ts",
    prependToArray(sessionsSource, "export const observationSessions", sessionEntry),
    "utf8",
  );

  const result = {
    ok: true,
    workId: animalId,
    sessionId,
    number,
    publishDate,
    publishesAt: tokyoIso(publishDate),
    closeDate,
    changedFiles: changed,
  };

  if (bool(args, "json")) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  process.stdout.write(
    `\nRegistered ${candidate} as ${animalId}\n\n` +
      `  publishes  ${publishDate} 00:00 Asia/Tokyo\n` +
      `  closes     ${closeDate} 23:59 Asia/Tokyo\n\n` +
      `Changed:\n${changed.map((f) => `  + ${f}`).join("\n")}\n\n` +
      `Still to do, by hand:\n` +
      `  · Read the alt text in data/animal-references.ts. It was written from the\n` +
      `    composition constraint and describes structure; check it does not assert\n` +
      `    what the work is.\n` +
      `  · The three questions are shared across every work, so the choices for\n` +
      `    "What do you see?" and "What stands out?" were NOT changed. If this work\n` +
      `    needs its own, edit data/questions.ts yourself.\n` +
      `  · Commit and push. The work stays invisible until ${publishDate}.\n\n`,
  );
}

try {
  main(parseArgs(process.argv.slice(2), KNOWN));
} catch (err) {
  fail(err);
}

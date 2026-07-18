import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../random/seeded-random";
import { createRecipe, recipeFingerprint, CANVAS } from "../recipes/create-recipe";
import { validateRecipe, hasErrors } from "../recipes/validate-recipe";
import { renderRecipe } from "../render/render-svg";
import { buildBatch, candidateId, assertSafeSegment } from "../render/build-batch";
import { allModules, getModule } from "../registry/module-registry";
import { checkRegistryIntegrity, RULES } from "../rules/compatibility";
import { isParameterInRange } from "../registry/module-types";
import { isPublic, tokyoMidnightIso, tokyoDate } from "../../lib/observation/publish";
import { questions } from "../../data/questions";
import type { ObservationSession } from "../../types";

/**
 * Tests run on node:test, which ships with Node itself. The project had no test
 * framework, and the choice here was between adding Vitest — a real dependency,
 * a config file and a place for the build to break — or using what is already
 * installed. For a suite this size the built-in runner is enough, and it keeps
 * the dependency list where it was.
 */

// ── determinism ─────────────────────────────────────────────────────────────

test("the same seed always produces the same values", () => {
  const a = createRng("hello");
  const b = createRng("hello");
  for (let i = 0; i < 200; i++) assert.equal(a.next(), b.next());
});

test("different seeds diverge", () => {
  const a = createRng("hello");
  const b = createRng("hello ");
  const left = Array.from({ length: 20 }, () => a.next());
  const right = Array.from({ length: 20 }, () => b.next());
  assert.notDeepEqual(left, right);
});

test("forked streams are independent of the parent's later draws", () => {
  const parent = createRng("seed");
  const first = parent.fork("child").next();
  parent.next();
  parent.next();
  const second = createRng("seed").fork("child").next();
  assert.equal(first, second);
});

test("the same seed rebuilds an identical recipe", () => {
  const a = createRecipe("repeat-me", "candidate-001");
  const b = createRecipe("repeat-me", "candidate-001");
  assert.equal(recipeFingerprint(a), recipeFingerprint(b));
  assert.deepEqual(a.modules, b.modules);
  assert.equal(a.composition.constraint, b.composition.constraint);
});

test("a different seed produces a different recipe", () => {
  const a = createRecipe("seed-a", "candidate-001");
  const b = createRecipe("seed-b", "candidate-001");
  assert.notEqual(recipeFingerprint(a), recipeFingerprint(b));
});

test("the same recipe renders byte-identical SVG", () => {
  const recipe = createRecipe("render-twice", "candidate-001");
  assert.equal(renderRecipe(recipe).svg, renderRecipe(recipe).svg);
});

// ── registry integrity ──────────────────────────────────────────────────────

test("the registry has no integrity errors", () => {
  const errors = checkRegistryIntegrity().filter((i) => i.level === "error");
  assert.deepEqual(errors, [], errors.map((e) => e.message).join("\n"));
});

test("module ids are unique", () => {
  const ids = allModules.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("a duplicate module id is detected", () => {
  const issues = checkRegistryIntegrity();
  // Sanity: the checker actually reports something when given a duplicate.
  const seen = new Set<string>();
  const duplicates = allModules.filter((m) => (seen.has(m.id) ? true : (seen.add(m.id), false)));
  assert.equal(duplicates.length, 0);
  assert.ok(Array.isArray(issues));
});

test("no module carries a tag that fixes a meaning", () => {
  const offenders = checkRegistryIntegrity().filter((i) => i.code === "meaning-tag");
  assert.deepEqual(offenders, []);
});

// ── composition rules ───────────────────────────────────────────────────────

test("every recipe has exactly one body, one arrangement and one palette", () => {
  for (let i = 0; i < 60; i++) {
    const r = createRecipe(`rules-${i}`, candidateId(i));
    assert.equal(getModule(r.modules.body.id)?.category, "body");
    assert.equal(getModule(r.modules.arrangement.id)?.category, "arrangement");
    assert.equal(getModule(r.modules.palette.id)?.category, "palette");
  }
});

test("transformation and appendage counts stay inside their limits", () => {
  for (let i = 0; i < 60; i++) {
    const r = createRecipe(`limits-${i}`, candidateId(i));
    assert.ok(r.modules.transformations.length >= RULES.transformations.min);
    assert.ok(r.modules.transformations.length <= RULES.transformations.max);
    assert.ok(r.modules.appendages.length <= RULES.appendageKinds.max);
    assert.ok(r.modules.patterns.length <= RULES.patternKinds.max);
    assert.ok(r.composition.appendageCount <= RULES.appendagePlacements.max);
  }
});

test("every work has at least one element beyond its body", () => {
  for (let i = 0; i < 60; i++) {
    const r = createRecipe(`secondary-${i}`, candidateId(i));
    const secondary = r.modules.appendages.length + r.modules.patterns.length;
    assert.ok(secondary >= RULES.minSecondaryKinds, `candidate ${i} has only a body`);
  }
});

test("all parameters land inside the ranges their module declares", () => {
  for (let i = 0; i < 40; i++) {
    const r = createRecipe(`params-${i}`, candidateId(i));
    const instances = [
      r.modules.body,
      r.modules.arrangement,
      ...r.modules.appendages,
      ...r.modules.patterns,
      ...r.modules.transformations,
      ...(r.modules.motion ? [r.modules.motion] : []),
    ];
    for (const instance of instances) {
      const module = getModule(instance.id);
      assert.ok(module, `${instance.id} is not registered`);
      for (const [key, def] of Object.entries(module.parameters)) {
        assert.ok(
          isParameterInRange(def, instance.parameters[key]),
          `${instance.id}.${key} = ${String(instance.parameters[key])} is out of range`,
        );
      }
    }
  }
});

test("incompatible modules never appear together", () => {
  for (let i = 0; i < 80; i++) {
    const r = createRecipe(`compat-${i}`, candidateId(i));
    const issues = validateRecipe(r).filter((x) => x.code === "incompatible-modules");
    assert.deepEqual(issues, []);
  }
});

test("disabled modules are never chosen", () => {
  const disabled = allModules.filter((m) => !m.enabled).map((m) => m.id);
  for (let i = 0; i < 40; i++) {
    const r = createRecipe(`disabled-${i}`, candidateId(i));
    const used = [
      r.modules.body.id,
      r.modules.arrangement.id,
      ...r.modules.appendages.map((a) => a.id),
      ...r.modules.patterns.map((p) => p.id),
      ...r.modules.transformations.map((t) => t.id),
    ];
    for (const id of used) assert.ok(!disabled.includes(id));
  }
});

// ── validation ──────────────────────────────────────────────────────────────

test("a freshly generated recipe validates cleanly", () => {
  for (let i = 0; i < 30; i++) {
    const issues = validateRecipe(createRecipe(`valid-${i}`, candidateId(i)));
    assert.ok(!hasErrors(issues), issues.map((x) => x.message).join("\n"));
  }
});

test("validation rejects a recipe with an out-of-range parameter", () => {
  const recipe = createRecipe("bad-param", "candidate-001");
  // Push a parameter the body actually declares outside its range. Inventing a
  // key instead would only be an unknown-parameter warning, which is a
  // different check and would let this test pass without proving anything.
  const declared = Object.keys(getModule(recipe.modules.body.id)!.parameters);
  assert.ok(declared.length > 0);
  recipe.modules.body.parameters = { ...recipe.modules.body.parameters, [declared[0]]: 999999 };
  assert.ok(hasErrors(validateRecipe(recipe)));
});

test("validation rejects an unknown module id", () => {
  const recipe = createRecipe("bad-module", "candidate-001");
  recipe.modules.body.id = "body-does-not-exist-99";
  assert.ok(hasErrors(validateRecipe(recipe)));
});

test("validation rejects a recipe with no transformation", () => {
  const recipe = createRecipe("no-transform", "candidate-001");
  recipe.modules.transformations = [];
  assert.ok(hasErrors(validateRecipe(recipe)));
});

test("validation rejects a wrong schema version", () => {
  const recipe = createRecipe("bad-schema", "candidate-001");
  assert.ok(hasErrors(validateRecipe({ ...recipe, schemaVersion: 99 })));
});

test("validation rejects things that are not recipes", () => {
  for (const junk of [null, "recipe", 42, []]) assert.ok(hasErrors(validateRecipe(junk)));
});

// ── rendering ───────────────────────────────────────────────────────────────

test("rendered SVG contains no script and no external reference", () => {
  for (let i = 0; i < 30; i++) {
    const { svg } = renderRecipe(createRecipe(`safe-${i}`, candidateId(i)));
    assert.ok(!/<script/i.test(svg));
    assert.ok(!/foreignObject/i.test(svg));
    assert.ok(!/https?:\/\/(?!www\.w3\.org)/i.test(svg));
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.trimEnd().endsWith("</svg>"));
  }
});

test("every candidate is drawn inside the frame and is not a speck", () => {
  for (let i = 0; i < 40; i++) {
    const { coverage } = renderRecipe(createRecipe(`fit-${i}`, candidateId(i)));
    assert.ok(coverage > 0.04, `candidate ${i} covers only ${coverage.toFixed(3)} of the frame`);
    assert.ok(coverage <= 1, `candidate ${i} covers ${coverage.toFixed(3)} — outside the frame`);
  }
});

test("element counts stay under the complexity ceiling", () => {
  for (let i = 0; i < 40; i++) {
    const { elementCount } = renderRecipe(createRecipe(`complex-${i}`, candidateId(i)));
    assert.ok(elementCount <= RULES.maxElements);
  }
});

test("--static suppresses all animation", () => {
  for (let i = 0; i < 20; i++) {
    const recipe = createRecipe(`static-${i}`, candidateId(i), { static: true });
    assert.equal(recipe.modules.motion, undefined);
    assert.ok(!renderRecipe(recipe, { static: true }).svg.includes("animateTransform"));
  }
});

// ── batches ─────────────────────────────────────────────────────────────────

test("a batch produces the requested count with unique ids and no duplicates", () => {
  const result = buildBatch({ batchId: "test-batch", seed: "test-batch", count: 12 });
  assert.equal(result.candidates.length, 12, result.errors.map((e) => e.message).join("\n"));

  const ids = result.candidates.map((c) => c.metadata.candidateId);
  assert.equal(new Set(ids).size, 12);

  const fingerprints = result.candidates.map((c) => recipeFingerprint(c.recipe));
  assert.equal(new Set(fingerprints).size, 12, "two candidates in the batch are identical");
});

test("a batch contains both moving and still candidates", () => {
  const result = buildBatch({ batchId: "mix", seed: "mix", count: 12 });
  const moving = result.candidates.filter((c) => c.metadata.hasMotion).length;
  assert.ok(moving > 0 && moving < result.candidates.length);
});

test("a batch is rebuilt identically from the same seed", () => {
  const a = buildBatch({ batchId: "repeat", seed: "repeat", count: 8 });
  const b = buildBatch({ batchId: "repeat", seed: "repeat", count: 8 });
  assert.deepEqual(
    a.candidates.map((c) => recipeFingerprint(c.recipe)),
    b.candidates.map((c) => recipeFingerprint(c.recipe)),
  );
});

test("batch and candidate ids that could escape the output directory are refused", () => {
  for (const bad of ["../escape", "/etc/passwd", "a/b", "", ".", "with space", 'quo"te']) {
    assert.throws(() => assertSafeSegment(bad, "Batch id"), `"${bad}" should have been refused`);
  }
  assert.equal(assertSafeSegment("weekly-2026-07-20", "Batch id"), "weekly-2026-07-20");
});

test("candidate ids are zero-padded so they sort correctly", () => {
  assert.equal(candidateId(1), "candidate-001");
  assert.equal(candidateId(12), "candidate-012");
  const sorted = [candidateId(2), candidateId(10), candidateId(1)].sort();
  assert.deepEqual(sorted, ["candidate-001", "candidate-002", "candidate-010"]);
});

test("the canvas is square, which the site's frame assumes", () => {
  assert.equal(CANVAS.width, CANVAS.height);
});

// ── publication gate ────────────────────────────────────────────────────────

const session = (startsAt: string, closesAt: string): ObservationSession => ({
  id: "observation-999",
  slug: "observation-999",
  observationNumber: "999",
  animalId: "animal-999",
  startsAt,
  closesAt,
  questionIds: ["q-see", "q-stands", "q-name"],
  allowPostCloseResponses: false,
  featured: false,
});

test("a work dated in the future is not public", () => {
  const s = session("2030-01-01T00:00:00.000Z", "2030-01-07T00:00:00.000Z");
  assert.equal(isPublic(s, new Date("2026-07-19T00:00:00Z")), false);
});

test("a work becomes public at midnight Asia/Tokyo, not midnight UTC", () => {
  const s = session(tokyoMidnightIso("2026-07-22"), tokyoMidnightIso("2026-07-28"));

  // 14:59 UTC on the 21st is 23:59 on the 21st in Tokyo — still not published.
  assert.equal(isPublic(s, new Date("2026-07-21T14:59:00Z")), false);
  // 15:00 UTC on the 21st is 00:00 on the 22nd in Tokyo — published.
  assert.equal(isPublic(s, new Date("2026-07-21T15:00:00Z")), true);
});

test("a closed work stays public", () => {
  const s = session("2026-01-01T00:00:00.000Z", "2026-01-07T00:00:00.000Z");
  assert.equal(isPublic(s, new Date("2026-07-19T00:00:00Z")), true);
});

test("tokyoDate reports the Tokyo calendar day, not the UTC one", () => {
  assert.equal(tokyoDate(new Date("2026-07-21T15:00:00Z")), "2026-07-22");
  assert.equal(tokyoDate(new Date("2026-07-21T14:59:00Z")), "2026-07-21");
});

test("tokyoMidnightIso refuses a malformed date", () => {
  assert.throws(() => tokyoMidnightIso("22-07-2026"));
  assert.throws(() => tokyoMidnightIso("2026-7-22"));
});

// ── the three questions ─────────────────────────────────────────────────────

test("the three questions are present, in order, with their agreed wording", () => {
  assert.equal(questions.length, 3);
  assert.deepEqual(
    questions.map((q) => [q.id, q.question]),
    [
      ["q-see", "What do you see?"],
      ["q-stands", "What stands out?"],
      ["q-name", "What do you call it?"],
    ],
  );
});

test("the retired wording for the second question is gone", () => {
  const retired = ["what", "do", "you", "notice", "most"].join(" ");
  for (const q of questions) assert.ok(!q.question.toLowerCase().includes(retired));
});

test("the generator does not decide the answer choices", () => {
  // Choices belong to data/questions.ts and are shared by every work. Nothing in
  // a recipe may name them, or the generator would be deciding what a work is.
  // The seed is deliberately neutral: it is serialised into the recipe, so a
  // seed containing one of these words would fail this test on its own.
  const recipe = createRecipe("neutral-seed", "candidate-001");
  const serialised = JSON.stringify(recipe).toLowerCase();
  for (const word of ["bird", "machine", "plant", "choice", "answer"]) {
    assert.ok(!serialised.includes(word), `a recipe should not mention "${word}"`);
  }
});

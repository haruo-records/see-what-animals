# Aesthetic commitments

> **Form-language v2 (generator 0.2.0).** A work is 2–5 solid ink masses with
> paper-coloured seams and openings, standing slightly wrong, with at most
> three small auxiliary parts. Not a creature with features; a stray component
> that happens to seem alive. The v1 thin-line language was retired because it
> read as abstract drawing, not as the animals.
>
> The white lines carry the volume. Three systems, at most ONE per mass:
> an interior contour (an inset echo of the silhouette — the rim of a
> thickness the flat plane is not showing), curved ribs (segment lines that
> bow the way lines wrap a rounded thing — never dead straight), and a coil
> (one continuous winding line). Straight bands read as a barcode; a bowed
> one says girth.

These are not style preferences. They are the reason the project exists, and
each one is enforced somewhere in code.

## Form, never meaning

The work does not decide what it is. Someone looking at it does.

So: modules are named for geometry (`ribbon`, `soft-spike`, `almost-symmetrical`),
tags describe visual character (`density`, `fragmented`, `symmetry`), and neither
may name an animal, a body part, or a mood.

*Enforced by* `FORBIDDEN_TAGS` and `checkRegistryIntegrity()` in
`generator/rules/compatibility.ts`, and by the name check in
`generator/scripts/create-module.ts`.

## Biologically ambiguous

A form should not resolve into one known thing. It should stay available to be
read as a creature, a machine, a plant, or none of those. The three questions
depend on this: "What do you see?" is not a real question if the answer is
obvious.

Practically this means avoiding bilateral symmetry with two matched features
near the top, avoiding anything that reads as a face, and keeping parts from
falling into familiar counts.

## Deliberate imperfection

Every work carries at least one. Perfect symmetry settles instantly and stops
being looked at; a break in one place keeps the eye returning to check.

This is structural, not noise. `transformation-missing-part` removes exactly one
placement. `arrangement-almost-symmetrical` mirrors everything except one pair.
The imperfection is a decision, recorded in the recipe.

*Enforced by* `RULES.transformations.min = 1`.

## Motion changes a form in place

Nothing travels. A work that moves toward somewhere reads as an animation of a
creature going about its business — which answers the question the site is
asking. A work that changes while staying put stays a question.

The strongest version is `motion-internal-shift`: the silhouette holds
completely still while the interior drifts.

## Space is a component

The hole in a ring, the gap where a part is absent, the empty side of an
asymmetric arrangement — these are elements, not leftovers.

## One idea per candidate

Each candidate is built around a single structural constraint, chosen *first*,
which then steers the module choices. Picking modules at random and describing
the result afterwards is what makes a batch feel mass-produced: every candidate
ends up an average of the module set rather than an attempt at something.

The nine constraints are in `COMPOSITION_CONSTRAINTS`
(`generator/recipes/recipe-types.ts`). They describe structure —
`one-disturbance-in-a-cycle` — never mood.

## A batch is judged as a batch

Twelve works differing only in a parameter are twelve versions of one work, and
no per-candidate rule can catch that, because each is individually fine.

*Enforced by* `generator/rules/diversity-rules.ts`: caps per body, per
arrangement and per constraint, plus a guarantee that a batch contains both
moving and still work.

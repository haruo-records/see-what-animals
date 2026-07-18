# The module contract

Defined in `generator/registry/module-types.ts`.

A module is two separable halves:

- **metadata** — serialisable, goes into the recipe
- **a drawing function** — pure, never serialised

## Metadata

```ts
{
  id: string;              // "body-oval-01" — unique, category-prefixed
  category: ModuleCategory;
  version: number;         // bump when output changes for the same parameters
  label: string;
  enabled: boolean;        // false = never chosen, existing recipes still render
  tags: VisualTag[];       // form only
  incompatibleWith?: string[];
  weight?: number;         // selection weight; 0 = registered but never picked
  parameters: Record<string, ParameterDefinition>;
}
```

## Parameters

```ts
{ type: "number",  min, max, step?, default }
{ type: "integer", min, max, default }
{ type: "boolean", default }
{ type: "enum",    values: string[], default }
```

Ranges are contracts. The engine picks inside them with a soft centre bias, the
renderer clamps to them, and validation reports anything outside.

## Drawing functions by category

```ts
body:           draw(ctx) → { nodes, anchors, bounds }
appendage:      draw(ctx, at: Anchor, index) → SvgNode[]
pattern:        draw(ctx, bounds) → SvgNode[]
arrangement:    place(ctx, body, count) → Anchor[]
transformation: apply(ctx, anchors) → Anchor[]
motion:         animate(ctx) → { target: "outer" | "inner", nodes }
palette:        (no function — carries `colors`)
```

Every one must be **pure**: same input, same output, no `Math.random()`, no
`Date.now()`, no filesystem.

## The pipeline

```
body.draw
  → arrangement.place        placements
  → transformation.apply     each in recipe order
  → pattern.draw             interior
  → appendage.draw           once per placement, round-robin across kinds
  → motion.animate           outer (whole form) or inner (interior only)
  → measure + fit            centre in the frame at a consistent size band
```

## Motion

Animate about the **group origin**. The renderer puts that origin at the canvas
centre, so no module needs to know where the centre is. Use `additive="sum"` so
the animation composes with the fit transform rather than replacing it.

## SVG output

Only these tags: `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `g`,
`animateTransform`. No `script`, no `foreignObject`, no external references.
The renderer refuses anything else.

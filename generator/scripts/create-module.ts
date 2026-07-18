import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MODULE_CATEGORIES, type ModuleCategory } from "../registry/module-types";
import { getModule } from "../registry/module-registry";
import { ALLOWED_TAGS } from "../rules/compatibility";
import { parseArgs, requireString, bool, fail, CliError, type Args } from "./cli";

/**
 * generator:module-create — scaffolds a new module.
 *
 * It writes the file and prints the two lines to add to the registry, but it
 * does NOT edit module-registry.ts. Rewriting an import block by regex is the
 * kind of thing that works forty times and then quietly mangles the file on the
 * forty-first; the registry is the one file where a mistake takes everything
 * down with it, so it stays hand-edited. Two lines is a small price.
 */

const KNOWN = ["category", "name", "id", "label", "tags", "force", "help"];

const HELP = `
generator:module-create — scaffold a new module

  npm run generator:module-create -- --category body --name spiral
  npm run generator:module-create -- --category appendage --name hook --tags shape,rigidity

  --category <c>  one of: ${MODULE_CATEGORIES.join(", ")}
  --name <name>   kebab-case, describing FORM not meaning ("spiral", not "tail")
  --id <id>       override the generated id (default <category>-<name>-01)
  --label <text>  human label (default: the name)
  --tags <a,b>    comma-separated visual tags
  --force         overwrite an existing file
`;

const CAMEL = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Names that decide what a work is. The generator describes shape; if a module
 * is called "wing" then every work that uses it has been told what it is before
 * anyone looked at it.
 */
const MEANING_WORDS = [
  "wing", "leg", "arm", "head", "eye", "tail", "face", "mouth", "horn", "claw",
  "paw", "beak", "fin", "ear", "tooth", "hand", "foot", "bird", "cat", "dog",
  "fish", "monster", "creature", "animal", "cute", "angry", "sad", "happy",
];

const TEMPLATES: Record<ModuleCategory, (id: string, varName: string, label: string, tags: string) => string> = {
  body: (id, v, label, tags) => `import type { BodyModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * TODO: describe the FORM this makes, and why it is worth looking at.
 * Describe shape, not meaning.
 */
export const ${v}: BodyModule = {
  id: "${id}",
  category: "body",
  version: 1,
  label: "${label}",
  enabled: true,
  tags: [${tags}],
  parameters: {
    size: { type: "number", min: 200, max: 560, default: 380 },
  },
  draw({ cx, cy, params, colors }) {
    const size = Number(params.size);
    return {
      nodes: [
        {
          tag: "circle",
          attrs: { cx: r2(cx), cy: r2(cy), r: r2(size / 2), fill: colors.light, stroke: colors.ink, "stroke-width": 3 },
        },
      ],
      anchors: [],
      bounds: { x: cx - size / 2, y: cy - size / 2, width: size, height: size },
    };
  },
};
`,
  appendage: (id, v, label, tags) => `import type { AppendageModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** TODO: describe the form. */
export const ${v}: AppendageModule = {
  id: "${id}",
  category: "appendage",
  version: 1,
  label: "${label}",
  enabled: true,
  tags: [${tags}],
  parameters: {
    length: { type: "number", min: 40, max: 180, default: 100 },
  },
  draw({ params, colors }, at) {
    const len = Number(params.length);
    return [
      {
        tag: "path",
        attrs: {
          d: \`M \${r2(at.x)} \${r2(at.y)} L \${r2(at.x + Math.cos(at.angle) * len)} \${r2(at.y + Math.sin(at.angle) * len)}\`,
          fill: "none",
          stroke: colors.ink,
          "stroke-width": 3,
          "stroke-linecap": "round",
        },
      },
    ];
  },
};
`,
  pattern: (id, v, label, tags) => `import type { PatternModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/** TODO: describe the form. */
export const ${v}: PatternModule = {
  id: "${id}",
  category: "pattern",
  version: 1,
  label: "${label}",
  enabled: true,
  tags: [${tags}],
  parameters: {
    count: { type: "integer", min: 3, max: 20, default: 8 },
  },
  draw({ params, colors }, bounds) {
    const count = Number(params.count);
    const nodes: SvgNode[] = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        tag: "circle",
        attrs: {
          cx: r2(bounds.x + (bounds.width * (i + 1)) / (count + 1)),
          cy: r2(bounds.y + bounds.height / 2),
          r: 6,
          fill: colors.ink,
        },
      });
    }
    return nodes;
  },
};
`,
  arrangement: (id, v, label, tags) => `import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { r2 } from "../shared";

/** TODO: describe how placements are distributed. */
export const ${v}: ArrangementModule = {
  id: "${id}",
  category: "arrangement",
  version: 1,
  label: "${label}",
  enabled: true,
  tags: [${tags}],
  parameters: {
    radiusScale: { type: "number", min: 0.4, max: 0.6, default: 0.5 },
  },
  place({ params }, body, count) {
    const scale = Number(params.radiusScale);
    const cx = body.bounds.x + body.bounds.width / 2;
    const cy = body.bounds.y + body.bounds.height / 2;
    const out: Anchor[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      out.push({
        x: r2(cx + Math.cos(a) * body.bounds.width * scale),
        y: r2(cy + Math.sin(a) * body.bounds.height * scale),
        angle: a,
      });
    }
    return out;
  },
};
`,
  transformation: (id, v, label, tags) => `import type { TransformationModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** TODO: describe the deliberate imperfection this introduces. */
export const ${v}: TransformationModule = {
  id: "${id}",
  category: "transformation",
  version: 1,
  label: "${label}",
  enabled: true,
  tags: [${tags}],
  parameters: {
    amount: { type: "number", min: 0.05, max: 0.4, default: 0.2 },
  },
  apply({ cx, cy, params }, anchors) {
    const amount = Number(params.amount);
    return anchors.map((a, i) =>
      i === 0 ? { ...a, x: r2(a.x + (a.x - cx) * amount), y: r2(a.y + (a.y - cy) * amount) } : a,
    );
  },
};
`,
  motion: (id, v, label, tags) => `import type { MotionModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * TODO: describe the movement.
 * Motion must change the form IN PLACE. It must never travel toward a
 * destination — the renderer puts the group origin at the canvas centre, so
 * animate about 0,0 and use additive="sum".
 */
export const ${v}: MotionModule = {
  id: "${id}",
  category: "motion",
  version: 1,
  label: "${label}",
  enabled: true,
  tags: [${tags}],
  parameters: {
    duration: { type: "number", min: 8, max: 60, default: 24 },
  },
  animate({ params }) {
    const dur = Number(params.duration);
    return {
      target: "inner",
      nodes: [
        {
          tag: "animateTransform",
          attrs: {
            attributeName: "transform",
            additive: "sum",
            type: "scale",
            values: "1;1.02;1",
            dur: \`\${r2(dur)}s\`,
            repeatCount: "indefinite",
          },
        },
      ],
    };
  },
};
`,
  palette: (id, v, label, tags) => `import type { PaletteModule } from "../../registry/module-types";

/** TODO: keep this close to the site's own surfaces. */
export const ${v}: PaletteModule = {
  id: "${id}",
  category: "palette",
  version: 1,
  label: "${label}",
  enabled: true,
  tags: [${tags}],
  parameters: {},
  colors: { ink: "#171817", mid: "#c9c4b8", light: "#f4f0e7" },
};
`,
};

const DIRS: Record<ModuleCategory, string> = {
  body: "bodies",
  appendage: "appendages",
  pattern: "patterns",
  arrangement: "arrangements",
  transformation: "transformations",
  motion: "motions",
  palette: "palettes",
};

const ARRAY_NAMES: Record<ModuleCategory, string> = {
  body: "bodies",
  appendage: "appendages",
  pattern: "patterns",
  arrangement: "arrangements",
  transformation: "transformations",
  motion: "motions",
  palette: "palettes",
};

function main(args: Args) {
  if (bool(args, "help")) {
    process.stdout.write(HELP);
    return;
  }

  const category = requireString(args, "category", `one of: ${MODULE_CATEGORIES.join(", ")}`) as ModuleCategory;
  if (!MODULE_CATEGORIES.includes(category)) {
    throw new CliError(`Unknown category "${category}". Use one of: ${MODULE_CATEGORIES.join(", ")}`);
  }

  const name = requireString(args, "name", "kebab-case, e.g. --name spiral");
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new CliError(`--name must be kebab-case: lowercase letters, numbers and dashes. Received "${name}".`);
  }

  const offending = MEANING_WORDS.filter((w) => name.split("-").includes(w));
  if (offending.length > 0) {
    throw new CliError(
      `"${name}" contains ${offending.join(", ")}, which names a meaning rather than a form.\n` +
        `  Modules describe shape; what a work turns out to be is not decided in code.\n` +
        `  Try describing the geometry instead — "hook", "taper", "fan".`,
    );
  }

  const id = typeof args.flags.id === "string" ? args.flags.id : `${category}-${name}-01`;
  if (getModule(id)) {
    throw new CliError(`A module with id "${id}" is already registered. Pass --id to choose another.`);
  }

  const label = typeof args.flags.label === "string" ? args.flags.label : name;

  const rawTags =
    typeof args.flags.tags === "string" ? args.flags.tags.split(",").map((t) => t.trim()).filter(Boolean) : ["shape"];
  for (const tag of rawTags) {
    if (!ALLOWED_TAGS.includes(tag as never)) {
      throw new CliError(`"${tag}" is not a visual tag.\n  Available: ${ALLOWED_TAGS.join(", ")}`);
    }
  }
  const tags = rawTags.map((t) => `"${t}"`).join(", ");

  const varName = CAMEL(`${category}-${name}`);
  const dir = join("generator", "modules", DIRS[category]);
  const path = join(dir, `${name}.ts`);

  if (existsSync(path) && !bool(args, "force")) {
    throw new CliError(`${path} already exists. Pass --force to overwrite it.`);
  }

  mkdirSync(dir, { recursive: true });
  writeFileSync(path, TEMPLATES[category](id, varName, label, tags), "utf8");

  const importLine = `import { ${varName} } from "../modules/${DIRS[category]}/${name}";`;
  const registryPath = join("generator", "registry", "module-registry.ts");
  const alreadyImported = existsSync(registryPath) && readFileSync(registryPath, "utf8").includes(importLine);

  process.stdout.write(
    `\nCreated ${path}\n\n` +
      (alreadyImported
        ? `It is already imported in the registry.\n\n`
        : `Add these two lines to ${registryPath}:\n\n` +
          `  1. with the other imports:\n     ${importLine}\n\n` +
          `  2. in the ${ARRAY_NAMES[category]} array:\n     ${varName},\n\n`) +
      `Then:\n` +
      `  npm run generator:validate\n` +
      `  npm run generator:generate -- --count 12 --seed trying-${name}\n\n` +
      `The scaffold draws something deliberately plain. Replace the draw body.\n\n`,
  );
}

try {
  main(parseArgs(process.argv.slice(2), KNOWN));
} catch (err) {
  fail(err);
}

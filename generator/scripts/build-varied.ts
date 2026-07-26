import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRng } from "../random/seeded-random";
import { renderForm } from "../organic/iso";
import type { Form } from "../organic/types";
import { CATEGORIES } from "../varied/categories";

const OUT = join("generated", "varied");
const SCHEMES = ["teal", "ochre", "moss", "slate", "coral", "clay", "rose", "violet", "sky", "olive", "pine", "orchid"];

function main() {
  const seed = process.argv[2] ?? "v1";
  const grey = process.argv.includes("--grey");
  const outline = process.argv.includes("--outline");
  mkdirSync(OUT, { recursive: true });
  const rng = createRng(seed);
  const schemes = rng.shuffle([...SCHEMES]);

  CATEGORIES.forEach((cat, i) => {
    const built = cat.build(rng.fork(`cat-${cat.n}`));
    const form: Form = {
      id: `form-${String(cat.n).padStart(2, "0")}`,
      title: `${cat.n}`,
      scheme: grey ? "grey" : schemes[i % schemes.length],
      nodes: built.nodes,
      links: built.links,
      slabs: built.slabs,
      notes: { structure: cat.main, suggests: "", balance: "", register: "", purpose: "" } as Form["notes"],
    };
    const parts = built.nodes.length + built.slabs.length;
    writeFileSync(join(OUT, `${form.id}.svg`), renderForm(form, { size: 1024, outline, outlineColor: "#454545", outlineWidth: 6 }), "utf8");
    process.stdout.write(`  ${String(cat.n).padStart(2)} ${cat.name.padEnd(16)} ${parts} parts — ${cat.main}\n`);
  });
}

main();

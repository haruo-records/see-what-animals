import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRng } from "../random/seeded-random";
import { renderForm } from "../organic/iso";
import type { Form } from "../organic/types";
import { CATEGORIES_C } from "../varied/categories-c";

const OUT = join("generated", "varied-c");
const SCHEMES = ["teal", "ochre", "moss", "slate", "coral", "clay", "rose", "violet", "sky", "olive", "pine", "orchid"];

function main() {
  const seed = process.argv[2] ?? "c1";
  const grey = process.argv.includes("--grey");
  mkdirSync(OUT, { recursive: true });
  const rng = createRng(seed);
  const schemes = rng.shuffle([...SCHEMES]);
  CATEGORIES_C.forEach((cat, i) => {
    const built = cat.build(rng.fork(`catc-${cat.n}`));
    const form: Form = {
      id: `form-${String(cat.n).padStart(2, "0")}`,
      title: `${cat.n}`,
      scheme: grey ? "grey" : schemes[i % schemes.length],
      nodes: built.nodes, links: built.links, slabs: built.slabs,
      notes: { structure: cat.main, suggests: "", balance: "", register: "", purpose: "" } as Form["notes"],
    };
    writeFileSync(join(OUT, `${form.id}.svg`), renderForm(form, { size: 1024, outline: true, outlineColor: "#454545", outlineWidth: 6 }), "utf8");
    process.stdout.write(`  ${String(cat.n).padStart(2)} ${cat.name.padEnd(20)} ${built.nodes.length + built.slabs.length} parts\n`);
  });
}
main();

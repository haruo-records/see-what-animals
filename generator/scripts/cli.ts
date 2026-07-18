/**
 * A very small argument parser. `node:util`'s parseArgs would do, but it throws
 * unhelpfully on typos, and the people running these commands are not
 * necessarily going to read a stack trace to find out they wrote `--seeed`.
 */

export type Args = {
  flags: Record<string, string | boolean>;
  positional: string[];
};

export function parseArgs(argv: string[], known: string[]): Args {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const [rawName, inlineValue] = token.slice(2).split("=", 2);
    const name = rawName.trim();

    if (!known.includes(name)) {
      const near = known.filter((k) => k.startsWith(name.slice(0, 3)));
      throw new CliError(
        `Unknown option --${name}.` +
          (near.length ? ` Did you mean --${near.join(" or --")}?` : "") +
          `\nAvailable: ${known.map((k) => "--" + k).join(", ")}`,
      );
    }

    if (inlineValue !== undefined) {
      flags[name] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      flags[name] = true;
    } else {
      flags[name] = next;
      i++;
    }
  }

  return { flags, positional };
}

export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

export function requireString(args: Args, name: string, hint: string): string {
  const value = args.flags[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new CliError(`--${name} is required.\n  ${hint}`);
  }
  return value;
}

export function optionalInt(args: Args, name: string, fallback: number, min: number, max: number): number {
  const value = args.flags[name];
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new CliError(`--${name} must be a whole number between ${min} and ${max}. Received "${String(value)}".`);
  }
  return n;
}

export function bool(args: Args, name: string): boolean {
  return args.flags[name] === true || args.flags[name] === "true";
}

/** Prints the error the way a person can act on, then exits non-zero. */
export function fail(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`\n✗ ${message}\n\n`);
  process.exit(1);
}

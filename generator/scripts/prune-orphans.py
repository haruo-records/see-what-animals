#!/usr/bin/env python3
"""
Removes module files the registry no longer imports.

Unpacking a release over an older one leaves the previous version's modules on
disk -- unzip adds and replaces, it never deletes. Those files are still
type-checked, so a module from a retired form language breaks `next build`
without affecting a single pixel of output.

The registry is the single source of truth for what exists, so nothing here is
hand-listed and the check cannot drift out of date.

    python generator/scripts/prune-orphans.py            # dry run
    python generator/scripts/prune-orphans.py --apply     # delete

Every file is read as UTF-8 explicitly. Python on Windows defaults to the
system code page (cp932 on a Japanese install), which fails on the first
non-ASCII character in a source file.
"""

import pathlib
import re
import sys

ENCODING = "utf-8"


def main() -> int:
    apply = "--apply" in sys.argv

    root = pathlib.Path(__file__).resolve().parent.parent  # .../generator
    registry = root / "registry" / "module-registry.ts"
    modules = root / "modules"

    if not registry.is_file():
        print(f"error: registry not found at {registry}", file=sys.stderr)
        print("Run this from anywhere; it locates itself relative to the script.", file=sys.stderr)
        return 1
    if not modules.is_dir():
        print(f"error: no modules directory at {modules}", file=sys.stderr)
        return 1

    imported = set(re.findall(r'from "\.\./modules/([^"]+)"', registry.read_text(encoding=ENCODING)))
    if not imported:
        print("error: the registry imports nothing. Refusing to delete every module.", file=sys.stderr)
        return 1

    orphans = []
    for path in sorted(modules.rglob("*.ts")):
        rel = path.relative_to(modules).with_suffix("").as_posix()
        if rel not in imported:
            orphans.append(path)

    if not orphans:
        print(f"No orphaned modules. {len(imported)} live module file(s).")
        return 0

    for path in orphans:
        shown = path.relative_to(root.parent).as_posix()
        if apply:
            path.unlink()
            print(f"removed  {shown}")
        else:
            print(f"orphaned {shown}")

    # Directories left empty once their last module is gone.
    if apply:
        for d in sorted(modules.rglob("*"), reverse=True):
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()
                print(f"removed  {d.relative_to(root.parent).as_posix()}/")

    print()
    print(f"{len(orphans)} orphaned file(s); {len(imported)} live.")

    if apply:
        print("\nNow run:")
        print("  npx tsc --noEmit")
        print("  npm run generator:validate")
        print("  npm run build")
    else:
        print("\nNothing was deleted. Re-run with --apply to remove them.")

    return 0


if __name__ == "__main__":
    sys.exit(main())

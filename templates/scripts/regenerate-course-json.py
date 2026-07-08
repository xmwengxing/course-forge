#!/usr/bin/env python3
"""regenerate-course-json.py — Validate, format, and sync course-*.json files.

What it does:
  1. Find every course*.json in the project root
  2. Validate JSON syntax — exit non-zero on the first error
  3. Re-emit each file with stable formatting (2-space indent, sorted keys)
  4. Symlink each formatted file into public/ so vite's dev server picks it up

Usage (run from a courseware project root):
  python3 scripts/regenerate-course-json.py
"""

import argparse
import json
import os
import sys
from pathlib import Path


def find_project_root(start: Path) -> Path:
    """Walk up from `start` until we find package.json + public/ + src/."""
    cur = start.resolve()
    for _ in range(10):
        if (cur / "package.json").is_file() and (cur / "public").is_dir() and (cur / "src").is_dir():
            return cur
        cur = cur.parent
        if cur == cur.parent:
            break
    return Path.cwd()


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate + format + sync course*.json")
    parser.add_argument("--project", type=Path, default=None,
                        help="Courseware project root (default: auto-detect from cwd)")
    parser.add_argument("--check-only", action="store_true",
                        help="Validate without writing or symlinking")
    parser.add_argument("--no-format", action="store_true",
                        help="Skip re-formatting (still validate + symlink)")
    args = parser.parse_args()

    project = (args.project or find_project_root(Path.cwd())).resolve()
    public = project / "public"
    if not (project / "package.json").is_file() or not public.is_dir():
        print(f"✗ Not a courseware project root: {project}", file=sys.stderr)
        return 1

    course_files = sorted(project.glob("course*.json"))
    if not course_files:
        print(f"✗ No course*.json found in {project}", file=sys.stderr)
        return 1

    print(f"→ Project root: {project}")
    print(f"→ Found {len(course_files)} json file(s): {[f.name for f in course_files]}")

    formatted_files = []
    for f in course_files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"✗ JSON SYNTAX ERROR in {f.name}: {e}", file=sys.stderr)
            print(f"  Fix the JSON before re-running.", file=sys.stderr)
            return 2
        if not args.check_only and not args.no_format:
            f.write_text(
                json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
                encoding="utf-8",
            )
        formatted_files.append(f)

    if args.check_only:
        print("✓ All course*.json files valid")
        return 0

    # Sync via symlink
    public.mkdir(exist_ok=True)
    linked = 0
    for f in formatted_files:
        target = public / f.name
        if target.is_symlink() or target.exists():
            target.unlink()
        os.symlink(f"../{f.name}", target)
        print(f"  ✓ Linked public/{f.name} -> ../{f.name}")
        linked += 1

    print(f"\n→ Total: {linked} json file(s) synced to public/")
    print("\nVerify in dev server:")
    print(f"  curl -s http://localhost:5174/course.json | python3 -m json.tool | head -5")
    return 0


if __name__ == "__main__":
    sys.exit(main())
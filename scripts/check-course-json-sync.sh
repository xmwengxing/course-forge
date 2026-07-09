#!/usr/bin/env bash
# check-course-json-sync.sh — fail CI if course.json drifted between
# project root and public/. After C fix (static import), the public/
# copy should NOT exist; this script simply checks for it.
#
# Usage:
#   bash scripts/check-course-json-sync.sh
#   # In CI: bash scripts/check-course-json-sync.sh || exit 1
#
# Exit codes:
#   0 — clean (no public/course.json; using static import)
#   1 — public/course.json exists and matches root  (just a warning, not failure)
#   2 — public/course.json exists and DIFFERS from root (sync bug, fail)

set -e

ROOT_COURSE="course.json"
PUBLIC_COURSE="public/course.json"

if [ ! -f "$ROOT_COURSE" ]; then
  echo "[check-course-json-sync] OK — no $ROOT_COURSE in project root (single-video mode?)"
  exit 0
fi

if [ ! -f "$PUBLIC_COURSE" ]; then
  echo "[check-course-json-sync] OK — no $PUBLIC_COURSE (course.json is statically imported)"
  exit 0
fi

# Both files exist. Compare them.
if diff -q "$ROOT_COURSE" "$PUBLIC_COURSE" > /dev/null 2>&1; then
  echo "[check-course-json-sync] WARN — $PUBLIC_COURSE exists and matches root."
  echo "  This is harmless (legacy) but should be deleted — vite now imports"
  echo "  $ROOT_COURSE statically; the $PUBLIC_COURSE copy is dead weight."
  exit 1
else
  echo "[check-course-json-sync] FAIL — $PUBLIC_COURSE differs from $ROOT_COURSE"
  echo "  Delete $PUBLIC_COURSE — vite imports $ROOT_COURSE directly."
  echo "  See SKILL.md § 课程模式必做 for details."
  exit 2
fi

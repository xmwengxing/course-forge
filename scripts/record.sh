#!/usr/bin/env bash
# record.sh — 录制课件画布为 MP4（Playwright 实现）
# 委托给 scripts/record.js
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/record.js" "$@"

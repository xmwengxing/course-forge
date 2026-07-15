#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
# synthesize-audio.sh — provider-agnostic TTS runner.
#
# Reads audio-segments.json (produced by extract-narrations.ts) and
# writes one mp3 per segment under public/audio/<chapter>/<N>.mp3.
#
# This file itself does NOT know how to call any TTS engine. It loads
# a provider adapter from tts-providers/<name>.sh which must expose:
#
#   tts_synthesize <text> <out_path> [<voice>]   (required)
#   tts_check                                    (optional)
#   tts_install_help                             (optional)
#
# See tts-providers/README.md for the full contract and copy-pasteable
# recipes for adding more providers (OpenAI / ElevenLabs / edge-tts /
# Azure / etc.).
#
# Choosing a provider:
#   PRESENTATION_TTS=<name>       env var  (default: edge — 免费 / 零密钥)
#   --provider=<name>             CLI flag (overrides env)
#   推荐 edge-tts：微软后端、无需 API key，开箱即用（见 tts-providers/README.md）
#
# Choosing a voice (provider decides what's valid):
#   PRESENTATION_TTS_VOICE=<id>   env var
#   --voice=<id>                  CLI flag (overrides env)
#
# Other flags:
#   --force                       re-synthesize even if mp3 exists
#
# Behavior:
#   • Serial calls (TTS APIs commonly rate-limit parallel requests).
#   • 断点续传：仅跳过"已存在且非空"的 mp3；0 字节残 file 视为失败并重合成。
#   • 失败段自动重试（最多 3 次，指数退避 2s/4s），单次网络抖动不再中断整轮。
#   • Pass --force to re-synthesize all.
#   • Prints progress per segment with elapsed time.
#
# Examples:
#   npm run synthesize-audio
#   npm run synthesize-audio -- --force
#   PRESENTATION_TTS=openai npm run synthesize-audio
#   npm run synthesize-audio -- --provider=elevenlabs --voice=Rachel
# ────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Use pwd -W so ROOT is a Windows-style path (e.g. E:/...). The TTS tools
# (jq / edge-tts / ffmpeg) are native Windows .exes launched from Git-Bash
# and cannot resolve MSYS paths like /e/workspace/...
ROOT="$(cd "$SCRIPT_DIR/.." && pwd -W)"
SEGMENTS="$ROOT/audio-segments.json"
OUT_DIR="$ROOT/public/audio"
PROVIDERS_DIR="$SCRIPT_DIR/tts-providers"

PROVIDER="${PRESENTATION_TTS:-edge}"
VOICE="${PRESENTATION_TTS_VOICE:-}"
FORCE=false

for arg in "$@"; do
  case "$arg" in
    --force)         FORCE=true ;;
    --voice=*)       VOICE="${arg#--voice=}" ;;
    --provider=*)    PROVIDER="${arg#--provider=}" ;;
    -h|--help)
      sed -n '2,46p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "✗ unknown arg: $arg" >&2; exit 1 ;;
  esac
done

PROVIDER_FILE="$PROVIDERS_DIR/$PROVIDER.sh"

# ── Pre-flight ────────────────────────────────────────────────────────
if [[ ! -f "$SEGMENTS" ]]; then
  echo "✗ $SEGMENTS not found. Run: npm run extract-narrations" >&2
  exit 1
fi
if ! command -v jq >/dev/null; then
  echo "✗ jq is required to read audio-segments.json" >&2
  echo "  Install: brew install jq   (or apt-get install jq, etc.)" >&2
  exit 1
fi
if [[ ! -f "$PROVIDER_FILE" ]]; then
  echo "✗ TTS provider '$PROVIDER' not found at $PROVIDER_FILE" >&2
  echo >&2
  echo "  Available providers:" >&2
  for f in "$PROVIDERS_DIR"/*.sh; do
    [[ -f "$f" ]] || continue
    echo "    • $(basename "$f" .sh)" >&2
  done
  echo >&2
  echo "  To add your own, see $PROVIDERS_DIR/README.md" >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$PROVIDER_FILE"

if ! declare -F tts_synthesize >/dev/null; then
  echo "✗ provider '$PROVIDER' does not define tts_synthesize" >&2
  echo "  See $PROVIDERS_DIR/README.md for the contract." >&2
  exit 1
fi

if declare -F tts_check >/dev/null; then
  if ! tts_check; then
    echo >&2
    if declare -F tts_install_help >/dev/null; then
      tts_install_help
    fi
    exit 1
  fi
fi

# ── Main loop ─────────────────────────────────────────────────────────
total=$(jq 'length' "$SEGMENTS")
i=0
synthesized=0
skipped=0
failed=0

while IFS= read -r row; do
  i=$((i + 1))
  chapter=$(echo "$row" | jq -r '.chapter')
  step=$(echo "$row" | jq -r '.step')
  text=$(echo "$row" | jq -r '.text')
  out="$OUT_DIR/$chapter/$step.mp3"

  # 断点续传：仅当 mp3 存在且"非空"才跳过；0 字节残 file 视为失败，重合成。
  if [[ -s "$out" && "$FORCE" != true ]]; then
    skipped=$((skipped + 1))
    printf "[%3d/%d] %-20s skip (exists)\n" "$i" "$total" "$chapter/$step.mp3"
    continue
  fi

  mkdir -p "$(dirname "$out")"
  # 逐段失败自动重试（edge-tts / 网络偶发失败），最多 3 次，指数退避。
  attempt=0
  max_attempts=3
  ok=false
  while [[ $attempt -lt $max_attempts ]]; do
    attempt=$((attempt + 1))
    start=$(date +%s)
    if tts_synthesize "$text" "$out" "$VOICE"; then
      ok=true
      break
    fi
    # 失败：清掉可能写出的残 file，避免下一轮被当成"已存在"跳过
    [[ -f "$out" ]] && rm -f "$out"
    if [[ $attempt -lt $max_attempts ]]; then
      printf "[%3d/%d] %-20s ✗ retry %d/%d\n" "$i" "$total" "$chapter/$step.mp3" "$attempt" "$max_attempts" >&2
      sleep $((attempt * 2))   # 2s, 4s 退避
    fi
  done

  if [[ "$ok" == true ]]; then
    elapsed=$(( $(date +%s) - start ))
    synthesized=$((synthesized + 1))
    printf "[%3d/%d] %-20s ✓ %ss\n" "$i" "$total" "$chapter/$step.mp3" "$elapsed"
  else
    failed=$((failed + 1))
    printf "[%3d/%d] %-20s ✗ FAILED (gave up after %d)\n" "$i" "$total" "$chapter/$step.mp3" "$max_attempts" >&2
  fi
done < <(jq -c '.[]' "$SEGMENTS")

echo
echo "✓ done (provider=$PROVIDER) — synthesized $synthesized, skipped $skipped, failed $failed"
[[ $failed -eq 0 ]] || exit 2

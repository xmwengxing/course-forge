#!/usr/bin/env bash
set -euo pipefail

VOICE="${PRESENTATION_EDGE_VOICE:-zh-CN-YunxiNeural}"

tts_check() {
  if ! command -v edge-tts >/dev/null; then
    echo "✗ edge-tts not found. Install: pip3 install edge-tts --break-system-packages" >&2
    return 1
  fi
}

tts_install_help() {
  cat <<'EOF' >&2
To use the Edge-TTS provider:

  Install:  pip3 install edge-tts --break-system-packages

  Default voice: zh-CN-YunxiNeural (male, natural Chinese)
  Override:     export PRESENTATION_EDGE_VOICE=zh-CN-XiaoxiaoNeural

  Other voices: edge-tts --list-voices | grep zh-CN
EOF
}

tts_synthesize() {
  local text="$1"
  local out="$2"
  local voice="${3:-$VOICE}"

  edge-tts --voice "$voice" --text "$text" --write-media "$out" >/dev/null 2>&1
}

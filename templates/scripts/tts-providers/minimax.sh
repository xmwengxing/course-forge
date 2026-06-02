#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
# MiniMax T2A v2 provider — direct curl (Token Plan keys).
# API:     POST https://api.minimax.chat/v1/t2a_v2
# Default: model=speech-2.8-hd  voice=Chinese_casual_instructor_vv2
# ────────────────────────────────────────────────────────────────────
set -euo pipefail

API_KEY="${MINIMAX_API_KEY:-}"
API_URL="https://api.minimax.chat/v1/t2a_v2"
VOICE="${PRESENTATION_MINIMAX_VOICE:-Chinese_casual_instructor_vv2}"
MODEL="${PRESENTATION_MINIMAX_MODEL:-speech-2.8-hd}"

tts_check() {
  if [[ -z "${API_KEY:-}" ]]; then
    echo "✗ MINIMAX_API_KEY is not set." >&2
    return 1
  fi
  if ! command -v python3 >/dev/null; then
    echo "✗ python3 is required but not found." >&2
    return 1
  fi
}

tts_install_help() {
  cat <<'EOF' >&2
To use the MiniMax direct-curl provider:

  Export your Token Plan API key:
    export MINIMAX_API_KEY=sk-cp-sax-xxxxx

  Optional — configure model / voice:
    export PRESENTATION_MINIMAX_MODEL=speech-2.8-hd         # default
    export PRESENTATION_MINIMAX_VOICE=Chinese_casual_instructor_vv2  # default

  Or pick another provider:  PRESENTATION_TTS=<name> npm run synthesize-audio
EOF
}

tts_synthesize() {
  local text="$1"
  local out="$2"
  local voice="${3:-$VOICE}"

  local tmp_resp
  tmp_resp=$(mktemp --suffix=.json)

  curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "
import json, sys
payload = {
    'model': '$MODEL',
    'text': sys.argv[1],
    'voice_setting': {'voice_id': '$voice'},
    'subtitle_enable': True,
    'subtitle_type': 'word'
}
print(json.dumps(payload, ensure_ascii=False))
" "$text")" \
    -o "$tmp_resp"

  if grep -q '"status_code":\s*0' "$tmp_resp" 2>/dev/null; then
    python3 -c "
import json, sys, os
with open('$tmp_resp') as f:
    resp = json.load(f)
audio_hex = resp.get('data', {}).get('audio', '')
if audio_hex:
    with open('$out', 'wb') as f:
        f.write(bytes.fromhex(audio_hex))

# Extract word-level subtitle timing from response
subtitles = resp.get('extra_info', {}).get('subtitles', [])
if subtitles:
    word_dir = os.path.join('public', 'minimax-word-timing', os.path.basename(os.path.dirname('$out')))
    os.makedirs(word_dir, exist_ok=True)
    word_file = os.path.join(word_dir, os.path.basename('$out').replace('.mp3', '.json'))
    word_data = [{'text': s['text'], 'start_ms': s.get('start_ms', 0), 'end_ms': s.get('end_ms', 0)} for s in subtitles]
    with open(word_file, 'w') as f:
        json.dump(word_data, f, ensure_ascii=False)
else:
    print('No word timing in response', file=sys.stderr)
    sys.exit(1)
"
    rm -f "$tmp_resp"
  else
    echo "✗ MiniMax API error:" >&2
    python3 -c "
import json
with open('$tmp_resp') as f:
    print(json.dumps(json.load(f), indent=2, ensure_ascii=False))
" >&2
    rm -f "$tmp_resp"
    return 1
  fi
}

#!/usr/bin/env bash
set -euo pipefail

VOICE="${PRESENTATION_EDGE_VOICE:-zh-CN-YunxiNeural}"

# edge_bin — 解析 edge-tts 可执行入口，按优先级探测：
#   1. $EDGE_TTS_BIN（显式路径；venv 装的 edge-tts 不在系统 PATH 时用）
#   2. PATH 里的 edge-tts / edge-tts.exe
#   3. python -m edge_tts（fallback；绕过 Windows Git Bash 的 PATH /c/ 格式问题）
# 返回一个"可直接在命令行展开"的字符串：
#   路径 / "edge-tts" / "edge-tts.exe" / "python -m edge_tts"
edge_bin() {
  # 1. 显式路径
  if [ -n "${EDGE_TTS_BIN:-}" ] && [ -x "$EDGE_TTS_BIN" ]; then
    printf '%s' "$EDGE_TTS_BIN"; return 0
  fi
  # 2. PATH 里的 CLI（Git-Bash on Windows 同时探测 .exe）
  if command -v edge-tts >/dev/null 2>&1; then printf '%s' "edge-tts"; return 0; fi
  if command -v edge-tts.exe >/dev/null 2>&1; then printf '%s' "edge-tts.exe"; return 0; fi
  # 3. fallback: python -m edge_tts（edge-tts 包装为 CLI 模块）
  if command -v python >/dev/null 2>&1 && python -m edge_tts --help >/dev/null 2>&1; then
    printf '%s' "python -m edge_tts"; return 0
  fi
  if command -v python3 >/dev/null 2>&1 && python3 -m edge_tts --help >/dev/null 2>&1; then
    printf '%s' "python3 -m edge_tts"; return 0
  fi
  return 1
}

tts_check() {
  if ! edge_bin >/dev/null 2>&1; then
    echo "✗ edge-tts not found. 任选一种装法：" >&2
    echo "  ① 系统/用户级：pip3 install edge-tts --break-system-packages" >&2
    echo "  ② venv 隔离：pip install edge-tts，再 export EDGE_TTS_BIN=/path/to/venv/Scripts/edge-tts.exe" >&2
    echo "  ③ fallback：确保 python -m edge_tts 可用（pip install edge-tts 后自动支持）" >&2
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

  Windows / venv 注意：
    - Git-Bash 的 command -v 需要 /c/ 格式 PATH（C:/ 格式找不到 .exe）。
      若 edge-tts 装在 venv，推荐：export EDGE_TTS_BIN=/c/path/to/venv/Scripts/edge-tts.exe
    - 或确保 python -m edge_tts 可用（本脚本会自动 fallback 到它）。
EOF
}

tts_synthesize() {
  local text="$1"
  local out="$2"
  local voice="${3:-$VOICE}"
  local bin
  bin=$(edge_bin) || { echo "✗ edge-tts not found" >&2; return 1; }

  # bin 可能是 "edge-tts" / "edge-tts.exe" / 路径 / "python -m edge_tts"
  # "python -m edge_tts" 需要 word-split 成 3 个参数；其余作为单命令调用
  if [[ "$bin" == *m\ edge_tts ]]; then
    $bin --voice "$voice" --text "$text" --write-media "$out" >/dev/null 2>&1
  else
    "$bin" --voice "$voice" --text "$text" --write-media "$out" >/dev/null 2>&1
  fi
}

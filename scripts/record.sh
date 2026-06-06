#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
# record.sh — 自动录制课件为 MP4 视频
#
# 用法:
#   bash scripts/record.sh                    # 交互式录制（有显示器）
#   bash scripts/record.sh --headless          # 无头模式（使用 Chromium）
#   bash scripts/record.sh --out my-video.mp4  # 指定输出文件名
#   bash scripts/record.sh --chapter 10         # 从指定章节开始
#   bash scripts/record.sh --dev               # 使用 dev server (localhost:5173)
#
# 依赖:
#   - ffmpeg (带 x11grab 或 pulse)
#   - 方式 A: 显示器 + x11grab
#   - 方式 B: chromium / google-chrome (无头模式)
#
# 原理:
#   1. 启动/确认 dev server 或使用生产 URL
#   2. 打开浏览器到 ?auto=1 页面
#   3. ffmpeg 录制屏幕/窗口 → MP4
#   4. 等待 auto 模式播放完毕 → 停止录制
#
# 环境变量:
#   RECORD_URL    课件页面 URL (默认: http://localhost:5173/?auto=1)
#   RECORD_DURATION  录制时长秒数 (默认: 根据课件总时长自动估算)
#   DISPLAY       显示器编号 (默认: :0)
# ────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── 参数解析 ──────────────────────────────────────────────────────
HEADLESS=false
OUTPUT="${PWD}/course-recording.mp4"
CHAPTER="0"
DEV_MODE=false
DURATION=""
RESOLUTION="1920x1080"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --headless) HEADLESS=true; shift ;;
    --out)      OUTPUT="$2"; shift 2 ;;
    --chapter)  CHAPTER="$2"; shift 2 ;;
    --dev)      DEV_MODE=true; shift ;;
    --duration) DURATION="$2"; shift 2 ;;
    --resolution) RESOLUTION="$2"; shift 2 ;;
    -h|--help)
      echo "用法: bash scripts/record.sh [选项]"
      echo ""
      echo "选项:"
      echo "  --headless        无头模式 (使用 Chromium)"
      echo "  --out FILE        输出文件路径 (默认: ./course-recording.mp4)"
      echo "  --chapter N       从第 N 章开始 (默认: 0)"
      echo "  --dev             使用 dev server (localhost:5173)"
      echo "  --duration SECS   录制时长秒数 (默认: 自动估算)"
      echo "  --resolution WxH  录制分辨率 (默认: 1920x1080)"
      echo ""
      echo "环境变量:"
      echo "  RECORD_URL        课件 URL (覆盖 --dev)"
      echo "  RECORD_DURATION   录制时长秒数"
      exit 0
      ;;
    *) echo "未知参数: $1"; exit 1 ;;
  esac
done

# ── 依赖检查 ──────────────────────────────────────────────────────
if ! command -v ffmpeg &>/dev/null; then
  echo "❌ 需要 ffmpeg，请安装: apt install ffmpeg" >&2; exit 1
fi

# ── 确定 URL ──────────────────────────────────────────────────────
if [[ -n "${RECORD_URL:-}" ]]; then
  URL="$RECORD_URL"
elif $DEV_MODE; then
  URL="http://localhost:5173/?auto=1&chapter=${CHAPTER}"
  
  # 尝试启动 dev server
  if ! curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null | grep -q 200; then
    echo "  dev server 未运行，正在启动..."
    cd "$ROOT"
    npm run dev &
    DEV_PID=$!
    trap "kill $DEV_PID 2>/dev/null" EXIT
    # 等待 dev server 就绪
    for i in $(seq 1 30); do
      if curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null | grep -q 200; then
        echo "  ✓ dev server 已就绪"
        break
      fi
      sleep 1
    done
  fi
elif [[ -f "$ROOT/dist/index.html" ]]; then
  echo "  ✗ 未指定 URL。先用 --dev 或设置 RECORD_URL" >&2
  echo "  提示: bash scripts/record.sh --dev" >&2
  exit 1
else
  echo "  ✗ 没有 dist/ 目录。请先运行 npm run build 或用 --dev" >&2
  exit 1
fi

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Course Recording"
echo "║   URL: $URL"
echo "║   Output: $OUTPUT"
echo "║   Resolution: $RESOLUTION"
$HEADLESS && echo "║  Mode: headless"
echo "╚═══════════════════════════════════════════════════════════╝"

# ── 录制 ──────────────────────────────────────────────────────────
if $HEADLESS; then
  # ── 无头模式：用 Chromium headless + ffmpeg 虚拟帧缓冲 ──────
  if ! command -v chromium &>/dev/null && ! command -v google-chrome &>/dev/null; then
    echo "❌ 需要 chromium 或 google-chrome (无头模式)" >&2; exit 1
  fi
  CHROME=$(command -v chromium 2>/dev/null || command -v google-chrome 2>/dev/null)
  
  VIRTUAL_DISPLAY=":99"
  Xvfb "$VIRTUAL_DISPLAY" -screen 0 "${RESOLUTION}x24" &
  XVFB_PID=$!
  trap "kill $XVFB_PID 2>/dev/null" EXIT
  sleep 1
  
  DISPLAY="$VIRTUAL_DISPLAY" "$CHROME" \
    --headless --disable-gpu --no-sandbox \
    --window-size="${RESOLUTION}" \
    --virtual-time-budget=15000 \
    "$URL" &
  CHROME_PID=$!
  
  # 用 ffmpeg 录制虚拟显示器
  DURATION="${DURATION:-120}"
  ffmpeg -y -f x11grab -video_size "$RESOLUTION" -i "$VIRTUAL_DISPLAY" \
    -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
    -t "$DURATION" "$OUTPUT" 2>/dev/null
  
  kill $CHROME_PID 2>/dev/null || true
else
  # ── 交互模式：录制整个屏幕 ──────────────────────────────────
  echo ""
  echo "  即将开始录制整个屏幕。"
  echo "  请确保课件页面已在浏览器中打开："
  echo "  $URL"
  echo ""
  read -p "  按 Enter 开始录制（Ctrl+C 停止）..." _
  
  DISPLAY="${DISPLAY:-:0}"
  DURATION="${DURATION:-}"
  
  DURATION_ARG=""
  if [[ -n "$DURATION" ]]; then
    DURATION_ARG="-t $DURATION"
  fi
  
  ffmpeg -y -f x11grab -video_size "$RESOLUTION" -i "$DISPLAY" \
    -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
    $DURATION_ARG "$OUTPUT"
fi

echo ""
echo "  ✅ 录制完成: $OUTPUT"
echo "  🎬 文件大小: $(du -h "$OUTPUT" | cut -f1)"

#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
# compress-audio.sh — 批量压缩 MP3 音频文件（语音优化）
#
# 用于将课件项目中 TTS 合成的高码率 MP3 批量降码率，节省存储和传输带宽。
# 纯语音叙述场景下，64kbps 单声道即可听觉透明。
#
# 用法:
#   bash compress-audio.sh                    # 默认 high 预设
#   bash compress-audio.sh --preset medium    # 48kbps
#   bash compress-audio.sh --preset low       # 32kbps
#   bash compress-audio.sh --dry-run          # 预览，不实际压缩
#   bash compress-audio.sh --preset high --verbose  # 详细输出每个文件
#
# 预设:
#   high:   64kbps CBR, 22050Hz (推荐)  — 语音完全透明
#   medium: 48kbps CBR, 22050Hz         — 轻微损失，讲课中不可察觉
#   low:    32kbps CBR, 16000Hz         — 可察觉但清晰度尚可
#
# 行为:
#   1. 遍历 public/audio/*/ 下所有 .mp3 文件
#   2. 检查源比特率是否 ≤ 目标值 → 跳过已达标文件
#   3. 压缩到临时文件，ffmpeg 成功退出后替换原文件
#   4. 运行时自动跳过已压缩过的文件（源比特率 ≤ 目标）
#   5. 建议在 extract-narrations + synthesize-audio 之后、
#      运行 subtitle-timing.py 之前调用此脚本
#
# 依赖:
#   ffmpeg (libmp3lame)
#   ffprobe
# ────────────────────────────────────────────────────────────────────
set -euo pipefail
shopt -s lastpipe 2>/dev/null || true  # 让管道后的 while 循环在同一个 shell 运行 (bash 4.2+)

# ── 参数解析 ──────────────────────────────────────────────────────
PRESET="high"
DRY_RUN=false
VERBOSE=false
AUDIO_DIR="${AUDIO_DIR:-public/audio}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preset)  PRESET="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --verbose) VERBOSE=true; shift ;;
    --dir)     AUDIO_DIR="$2"; shift 2 ;;
    -h|--help)
      echo "用法: bash compress-audio.sh [--preset high|medium|low] [--dry-run] [--verbose] [--dir <path>]"
      exit 0 ;;
    *) echo "未知参数: $1"; exit 1 ;;
  esac
done

case "$PRESET" in
  high)   BITRATE=64;  SAMPLE_RATE=22050 ;;
  medium) BITRATE=48;  SAMPLE_RATE=22050 ;;
  low)    BITRATE=32;  SAMPLE_RATE=16000 ;;
  *) echo "无效预设: $PRESET (可选: high medium low)"; exit 1 ;;
esac

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  音频压缩工具  preset=${PRESET}  ${BITRATE}kbps/${SAMPLE_RATE}Hz"
$DRY_RUN && echo "║  ⚠ DRY-RUN 模式 — 不会实际修改文件"
echo "╚═══════════════════════════════════════════════════════════╝"

# ── 依赖检查 ──────────────────────────────────────────────────────
if ! command -v ffmpeg &>/dev/null; then
  echo "❌ 需要 ffmpeg，请安装后再运行"; exit 1
fi
if ! command -v ffprobe &>/dev/null; then
  echo "❌ 需要 ffprobe，请安装后再运行"; exit 1
fi

if [[ ! -d "$AUDIO_DIR" ]]; then
  echo "❌ 音频目录不存在: $AUDIO_DIR"; exit 1
fi

# ── 统计 ──────────────────────────────────────────────────────────
TOTAL_FILES=0
SKIPPED=0
COMPRESSED=0
FAILED=0
BYTES_BEFORE=0
BYTES_AFTER=0

# 遍历所有 .mp3
compressed_log=$(mktemp)
skipped_log=$(mktemp)
failed_log=$(mktemp)
trap "rm -f $compressed_log $skipped_log $failed_log" EXIT

find "$AUDIO_DIR" -name "*.mp3" -type f | sort | while IFS= read -r src; do
  TOTAL_FILES=$((TOTAL_FILES + 1))

  # 获取源文件比特率 (bps)
  src_br=$(ffprobe -v error -select_streams a:0 -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 "$src" 2>/dev/null || echo 0)
  src_br=${src_br:-0}
  src_br_kbps=$((src_br / 1000))
  src_sz=$(stat -c%s "$src" 2>/dev/null || echo 0)

  # 已达标 → 跳过
  if [[ "$src_br_kbps" -gt 0 ]] && [[ "$src_br_kbps" -le "$BITRATE" ]]; then
    SKIPPED=$((SKIPPED + 1))
    echo "$src_sz 0 skip" >> "$skipped_log"
    $VERBOSE && printf "  ⏭ %-45s %4skbps  已达标\n" "${src#$AUDIO_DIR/}" "$src_br_kbps"
    continue
  fi

  # 压缩
  tmp="${src}.compress-tmp.mp3"

  if $DRY_RUN; then
    est_sz=$(( src_sz * BITRATE * 1000 / (src_br > 0 ? src_br : 128000) ))
    COMPRESSED=$((COMPRESSED + 1))
    echo "$src_sz $est_sz compress" >> "$compressed_log"
    $VERBOSE && printf "  🧪 %-45s %4skbps → %3skbps  (~%dKB → ~%dKB)\n" \
      "${src#$AUDIO_DIR/}" "$src_br_kbps" "$BITRATE" $((src_sz/1024)) $((est_sz/1024))
  else
    if ffmpeg -y -v quiet -i "$src" -codec:a libmp3lame -b:a "${BITRATE}k" -ar "$SAMPLE_RATE" -ac 1 "$tmp" 2>/dev/null; then
      mv "$tmp" "$src"
      new_sz=$(stat -c%s "$src" 2>/dev/null || echo 0)
      COMPRESSED=$((COMPRESSED + 1))
      echo "$src_sz $new_sz compress" >> "$compressed_log"
      local_pct=$((100 - new_sz * 100 / (src_sz > 0 ? src_sz : 1)))
      $VERBOSE && printf "  ✓  %-45s %4skbps → %3skbps  %dKB→%dKB (↓%d%%)\n" \
        "${src#$AUDIO_DIR/}" "$src_br_kbps" "$BITRATE" $((src_sz/1024)) $((new_sz/1024)) $local_pct
    else
      FAILED=$((FAILED + 1))
      echo "0 0 fail" >> "$failed_log"
      rm -f "$tmp"
      echo "  ✗ 压缩失败: ${src#$AUDIO_DIR/}"
    fi
  fi

  # 进度计数器 (每 20 个文件输出一次，dry-run 除外)
  if ! $DRY_RUN && ! $VERBOSE; then
    processed=$((COMPRESSED + SKIPPED + FAILED))
    if [[ $(( processed % 20 )) -eq 0 ]]; then
      echo "  … ${processed} / ~${TOTAL_FILES} 文件已处理"
    fi
  fi
done

# 从日志计算总字节 (解决 subshell 变量无法回传的问题)
BYTES_BEFORE=$(awk '{sum += $1} END {print sum}' "$compressed_log" 2>/dev/null || echo 0)
BYTES_AFTER=$(awk '{sum += $2} END {print sum}' "$compressed_log" 2>/dev/null || echo 0)
BYTES_BEFORE=$((BYTES_BEFORE + $(awk '{sum += $1} END {print sum}' "$skipped_log" 2>/dev/null || echo 0) + $(awk '{sum += $1} END {print sum}' "$failed_log" 2>/dev/null || echo 0)))
BYTES_AFTER=$((BYTES_AFTER + $(awk '{sum += $2} END {print sum}' "$skipped_log" 2>/dev/null || echo 0) + $(awk '{sum += $2} END {print sum}' "$failed_log" 2>/dev/null || echo 0)))

# ── 汇总 ──────────────────────────────────────────────────────────
BYTES_BEFORE_MB=$(echo "scale=1; $BYTES_BEFORE / 1048576" | bc 2>/dev/null || echo "?")
BYTES_AFTER_MB=$(echo "scale=1; $BYTES_AFTER / 1048576" | bc 2>/dev/null || echo "?")
if [[ "$BYTES_BEFORE" -gt 0 ]]; then
  SAVED_PCT=$(echo "scale=1; 100 - $BYTES_AFTER * 100 / $BYTES_BEFORE" | bc 2>/dev/null || echo "?")
else
  SAVED_PCT="?"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
printf "║  文件: %4d   跳过: %4d   压缩: %4d   失败: %4d  ║\n" "$TOTAL_FILES" "$SKIPPED" "$COMPRESSED" "$FAILED"
printf "║  大小: %s → %s (↓%s%%)                          ║\n" "${BYTES_BEFORE_MB}MB" "${BYTES_AFTER_MB}MB" "$SAVED_PCT"
echo "╚═══════════════════════════════════════════════════════════╝"

if $DRY_RUN; then
  echo "⚠ 这是 dry-run 结果，实际运行请去掉 --dry-run"
fi

# 完成后提示重新生成字幕
if ! $DRY_RUN && [[ "$COMPRESSED" -gt 0 ]]; then
  echo ""
  echo "💡 注意：音频时长未变，字幕时序无需重新生成。"
  echo "   但如果之前字幕时序还未生成，请运行: python3 scripts/subtitle-timing.py"
fi

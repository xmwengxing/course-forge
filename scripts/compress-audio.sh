#!/usr/bin/env bash
# compress-audio.sh — 压缩已合成的 TTS 口播音频
#
# 使用方法：
#   bash scripts/compress-audio.sh                    交互模式，扫描并选择压缩级别
#   bash scripts/compress-audio.sh --level 2          非交互，直接以 L2 压缩
#   bash scripts/compress-audio.sh --level 2 --backup 压缩前将原文件备份为 .backup/
#   bash scripts/compress-audio.sh --dry-run          仅预览预估效果，不执行
#   bash scripts/compress-audio.sh --dir path/to/audio 指定音频目录（默认 public/audio）
set -euo pipefail

AUDIO_DIR="public/audio"
LEVEL=""
BACKUP=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir)    AUDIO_DIR="$2"; shift 2 ;;
    --level)  LEVEL="$2";   shift 2 ;;
    --backup) BACKUP=true;  shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    -h|--help)
      sed -n '2,8p' "$0" | sed 's/^# //'
      exit 0 ;;
    *) shift ;;
  esac
done

# ── 压缩预设 ──────────────────────────────────────────────
# 格式: "bitrate|sample_rate|channels|描述"
PRESET_L1="128|24000|1|无损感 — 与原始 API 输出几乎无区别，适合存档留底"
PRESET_L2="64|24000|1|高质推荐 — 口播清晰度无损，适合录屏成品/Web 嵌入"
PRESET_L3="48|22050|1|标准品质 — 类似播客/有声书，存储友好"
PRESET_L4="32|22050|1|极致紧凑 — 文件体积最小，略有质感损失但依然可懂"

# 估算来源比特率（TTS API 通常 128–256 kbps，取中值 200）
EST_SRC_KBPS=200

# ── 工具函数 ──────────────────────────────────────────────

fmt_size() {
  local bytes=$1
  if (( bytes >= 1073741824 )); then printf "%.1f GB" "$(awk "BEGIN{printf \"%.1f\",$bytes/1073741824}")"
  elif (( bytes >= 1048576 ));  then printf "%.1f MB" "$(awk "BEGIN{printf \"%.1f\",$bytes/1048576}")"
  elif (( bytes >= 1024 ));     then printf "%.0f KB" "$(awk "BEGIN{printf \"%.0f\",$bytes/1024}")"
  else echo "${bytes} B"; fi
}

scan_audio() {
  local dir="$1" count size
  if [[ ! -d "$dir" ]]; then echo "0 0"; return; fi
  count=$(find "$dir" -name '*.mp3' -type f 2>/dev/null | wc -l)
  size=$(du -sb "$dir" 2>/dev/null | cut -f1)
  echo "${count} ${size:-0}"
}

get_preset() {
  case "$1" in
    1) echo "$PRESET_L1" ;;
    2) echo "$PRESET_L2" ;;
    3) echo "$PRESET_L3" ;;
    4) echo "$PRESET_L4" ;;
    *) echo ""; return 1 ;;
  esac
}

# ── 主逻辑 ────────────────────────────────────────────────

if ! command -v ffmpeg &>/dev/null; then
  echo "错误: 需要 ffmpeg。请先安装: brew install ffmpeg / apt install ffmpeg"
  exit 1
fi

read -r total_count total_size <<< "$(scan_audio "$AUDIO_DIR")"

if [[ "$total_count" -eq 0 ]]; then
  echo "错误: 在 $AUDIO_DIR 下未找到任何 .mp3 文件。请先运行 npm run synthesize-audio。"
  exit 1
fi

# ── 展示选项 ──────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  音频压缩 — 当前: ${total_count} 个文件 / $(fmt_size "$total_size")"
echo "═══════════════════════════════════════════════════════════════"
echo ""
printf "  %-6s %-16s %-14s %s\n" "级别" "比特率/采样率" "预估大小" "音质说明"
printf "  %-6s %-16s %-14s %s\n" "----" "--------------" "--------" "--------"
for i in 1 2 3 4; do
  preset=$(get_preset "$i")
  br=$(echo "$preset" | cut -d'|' -f1)
  sr=$(echo "$preset" | cut -d'|' -f2)
  ch=$(echo "$preset" | cut -d'|' -f3)
  desc=$(echo "$preset" | cut -d'|' -f4)
  est=$(( total_size * br / EST_SRC_KBPS ))
  saved=$(( 100 - br * 100 / EST_SRC_KBPS ))
  tag=""
  [[ "$i" == "2" ]] && tag=" ★ 推荐"
  printf "  %-6s %-16s %-14s %s (节省~%d%%)%s\n" \
    "L$i" "${br}kbps/${sr}Hz/mono" "$(fmt_size "$est")" "$desc" "$saved" "$tag"
done
echo ""
echo "  压缩级别越高，文件越小；L1 几乎无损，L4 有轻微听感差异。"
echo "  L2 对 99% 的口播场景听觉上与原版无区别。"
echo ""

# ── 选择级别 ──────────────────────────────────────────────

if [[ -z "$LEVEL" ]]; then
  while true; do
    read -r -p "  选择压缩级别 [1-4，推荐 2]: " choice
    if preset=$(get_preset "${choice:-2}"); then
      LEVEL="${choice:-2}"
      break
    fi
    echo "  请输入 1-4"
  done
  echo ""
fi

preset=$(get_preset "$LEVEL")
if [[ -z "$preset" ]]; then
  echo "错误: 无效级别 '$LEVEL'，请输入 1-4"
  exit 1
fi

bitrate=$(echo "$preset" | cut -d'|' -f1)
sample_rate=$(echo "$preset" | cut -d'|' -f2)
channels=$(echo "$preset" | cut -d'|' -f3)

est=$(( total_size * bitrate / EST_SRC_KBPS ))
saved=$(( 100 - bitrate * 100 / EST_SRC_KBPS ))

echo "  将执行: L${LEVEL} — ${bitrate}kbps CBR / ${sample_rate}Hz / mono"
echo "  预估压缩后: $(fmt_size "$est")（约节省 ${saved}%）"
echo ""

if [[ "$DRY_RUN" == true ]]; then
  echo "  [dry-run] 未执行压缩。加 --level N 可直接运行。"
  exit 0
fi

read -r -p "  确认执行? [Y/n] " confirm
if [[ ! "$confirm" =~ ^[Yy]?$ ]]; then
  echo "  已取消。"
  exit 0
fi
echo ""

# ── 备份 ──────────────────────────────────────────────────

if [[ "$BACKUP" == true ]]; then
  echo "  ⟳ 备份原文件至 ${AUDIO_DIR}.backup ..."
  cp -r "$AUDIO_DIR" "${AUDIO_DIR}.backup"
  echo "  ✓ 已备份"
fi

# ── 执行压缩 ──────────────────────────────────────────────

TMP_AUDIO_DIR="${AUDIO_DIR}.compressed"
rm -rf "$TMP_AUDIO_DIR"
mkdir -p "$TMP_AUDIO_DIR"

echo "  ⟳ 开始压缩 ${total_count} 个文件..."
echo ""

processed=0
failed=0
start_time=$(date +%s)

while IFS= read -r src; do
  rel="${src#$AUDIO_DIR/}"
  dst="$TMP_AUDIO_DIR/$rel"
  mkdir -p "$(dirname "$dst")"

  if ffmpeg -y -i "$src" \
       -codec:a libmp3lame -b:a "${bitrate}k" \
       -ar "$sample_rate" -ac "$channels" \
       -loglevel error "$dst" 2>/dev/null; then
    processed=$((processed + 1))
  else
    failed=$((failed + 1))
    echo "  ✗ 失败: $rel (保留原文件)"
    cp "$src" "$dst"
  fi

  if (( processed % 20 == 0 && processed > 0 )); then
    echo "  … ${processed}/${total_count}"
  fi
done < <(find "$AUDIO_DIR" -name '*.mp3' -type f | sort)

# ── 替换原目录 ────────────────────────────────────────────

rm -rf "$AUDIO_DIR"
mv "$TMP_AUDIO_DIR" "$AUDIO_DIR"

end_time=$(date +%s)
elapsed=$(( end_time - start_time ))

# ── 结果汇报 ──────────────────────────────────────────────

new_size=$(du -sb "$AUDIO_DIR" 2>/dev/null | cut -f1)
actual_saved=$(( 100 - new_size * 100 / total_size ))

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  压缩完成 ✓"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  压缩前: $(fmt_size "$total_size")  (${total_count} 个文件)"
echo "  压缩后: $(fmt_size "$new_size")"
printf "  节  省: %s (%.0f%%)\n" "$(fmt_size $(( total_size - new_size )))" "$actual_saved"
echo "  耗  时: ${elapsed}s"
echo ""
echo "  音频已就绪在 $AUDIO_DIR/"
[[ "$BACKUP" == true ]] && echo "  原文件备份: ${AUDIO_DIR}.backup/"

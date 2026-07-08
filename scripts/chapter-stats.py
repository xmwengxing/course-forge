#!/usr/bin/env python3
"""chapter-stats.py — Analyze audio-segments.json to report per-chapter and
per-section narration/estimated-video duration.

Usage:
  python3 scripts/chapter-stats.py
  python3 scripts/chapter-stats.py --file=audio-segments.json --json
  python3 scripts/chapter-stats.py --section=S2

Section inference (generic):
  - "S1".."S5" suffix on chapter id  → that section
  - Anything else                   → "未分组"
"""

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

DEFAULT_MS_PER_CHAR = 380      # narration ms per Chinese char
DEFAULT_STEP_VISUAL_S = 1.5    # visual transition + element entry per step


def guess_section(chapter_id: str) -> str:
    """Generic: use the last dash-delimited segment if it starts with 'S' followed by digits."""
    last = chapter_id.rsplit("-", 1)[-1]
    if len(last) >= 2 and last[0].upper() == "S" and last[1:].isdigit():
        return last.upper()
    return "未分组"


def is_chinese_char(c: str) -> bool:
    cp = ord(c)
    return (
        0x4E00 <= cp <= 0x9FFF
        or 0x3400 <= cp <= 0x4DBF
        or 0xF900 <= cp <= 0xFAFF
    )


def count_chinese_chars(text: str) -> int:
    return sum(1 for c in text if is_chinese_char(c))


def fmt_duration(seconds: float) -> str:
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    secs = seconds - minutes * 60
    return f"{minutes}m{secs:04.1f}s"


def fmt_int(n: int) -> str:
    return f"{n:,}"


def analyze(segments, ms_per_char: float, step_visual_s: float):
    by_section = defaultdict(lambda: {"steps": 0, "chars": 0})
    by_chapter = defaultdict(lambda: {"section": "未分组", "steps": 0, "chars": 0})

    for seg in segments:
        ch = seg["chapter"]
        section = guess_section(ch)
        by_chapter[ch]["section"] = section
        by_chapter[ch]["steps"] += 1
        by_chapter[ch]["chars"] += count_chinese_chars(seg.get("text", ""))
        by_section[section]["steps"] += 1
        by_section[section]["chars"] += count_chinese_chars(seg.get("text", ""))

    for d in [by_section, by_chapter]:
        for v in d.values():
            v["audio_s"] = v["chars"] * ms_per_char / 1000
            v["video_s"] = v["audio_s"] + v["steps"] * step_visual_s
    return by_section, by_chapter


def print_report(segments, ms_per_char, step_visual_s, only_section=None):
    by_section, by_chapter = analyze(segments, ms_per_char, step_visual_s)

    if only_section:
        if only_section.upper().startswith("S"):
            by_section = {k: v for k, v in by_section.items() if k == only_section.upper()}
            by_chapter = {k: v for k, v in by_chapter.items() if v["section"] == only_section.upper()}
        else:
            # filter by chapter-id prefix
            filtered_segs = [s for s in segments if s["chapter"].startswith(only_section)]
            by_section, by_chapter = analyze(filtered_segs, ms_per_char, step_visual_s)

    sorted_chapters = sorted(by_chapter.keys())

    print("=" * 80)
    print(f"📊 课件时长统计 (audio_ms={ms_per_char:.0f}ms, visual={step_visual_s:.1f}s/step)")
    print("=" * 80)
    print()
    print(f"{'章节':<32} {'段':<6} {'步数':>4} {'字数':>6} {'音频时长':>10} {'视频估算':>10}")
    print("-" * 80)

    total_steps = total_chars = 0
    total_audio_s = total_video_s = 0
    section_audio_s = defaultdict(float)
    section_video_s = defaultdict(float)
    section_steps = defaultdict(int)
    section_chars = defaultdict(int)

    for ch in sorted_chapters:
        d = by_chapter[ch]
        sec = d["section"]
        print(f"{ch:<32} {sec:<6} {d['steps']:>4} {fmt_int(d['chars']):>6} "
              f"{fmt_duration(d['audio_s']):>10} {fmt_duration(d['video_s']):>10}")
        total_steps += d["steps"]
        total_chars += d["chars"]
        total_audio_s += d["audio_s"]
        total_video_s += d["video_s"]
        section_audio_s[sec] += d["audio_s"]
        section_video_s[sec] += d["video_s"]
        section_steps[sec] += d["steps"]
        section_chars[sec] += d["chars"]

    print("-" * 80)
    print("【按段小计】")
    print(f"{'段':<6} {'章节数':>6} {'步数':>4} {'字数':>6} {'音频时长':>10} {'视频估算':>10}")
    for sec in sorted(section_audio_s.keys()):
        chapters_in_sec = [ch for ch, d in by_chapter.items() if d["section"] == sec]
        print(f"{sec:<6} {len(chapters_in_sec):>6} {section_steps[sec]:>4} "
              f"{fmt_int(section_chars[sec]):>6} "
              f"{fmt_duration(section_audio_s[sec]):>10} "
              f"{fmt_duration(section_video_s[sec]):>10}")
    print("-" * 80)
    print(f"{'总计':<6} {len(by_chapter):>6} {total_steps:>4} {fmt_int(total_chars):>6} "
          f"{fmt_duration(total_audio_s):>10} {fmt_duration(total_video_s):>10}")
    print()
    print(f"💡 录屏语速通常 300ms/字 → 视频时长估 {fmt_duration(total_chars * 0.3):>10}")
    print("=" * 80)


def main():
    parser = argparse.ArgumentParser(description="Analyze audio-segments.json: per-chapter and per-section narration/estimated-video duration.")
    parser.add_argument("--file", type=Path, default=Path("presentation/audio-segments.json"),
                        help="audio-segments.json path (default: presentation/audio-segments.json)")
    parser.add_argument("--section", help="Filter to one section (e.g. S2) or one chapter-id prefix")
    parser.add_argument("--audio-ms", type=float, default=DEFAULT_MS_PER_CHAR,
                        help=f"ms per Chinese char (default {DEFAULT_MS_PER_CHAR})")
    parser.add_argument("--visual-s", type=float, default=DEFAULT_STEP_VISUAL_S,
                        help=f"visual transition seconds per step (default {DEFAULT_STEP_VISUAL_S})")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of a report")
    args = parser.parse_args()

    if not args.file.exists():
        print(f"❌ {args.file} does not exist", file=sys.stderr)
        sys.exit(1)

    with open(args.file) as f:
        segments = json.load(f)

    if args.json:
        by_section, by_chapter = analyze(segments, args.audio_ms, args.visual_s)
        output = {
            "params": {"audio_ms_per_char": args.audio_ms, "visual_s_per_step": args.visual_s},
            "by_section": dict(by_section),
            "by_chapter": dict(by_chapter),
            "total": {
                "steps": sum(d["steps"] for d in by_chapter.values()),
                "chars": sum(d["chars"] for d in by_chapter.values()),
                "audio_s": sum(d["audio_s"] for d in by_chapter.values()),
                "video_s": sum(d["video_s"] for d in by_chapter.values()),
            },
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print_report(segments, args.audio_ms, args.visual_s, args.section)


if __name__ == "__main__":
    main()
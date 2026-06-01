#!/usr/bin/env python3
"""
chapter-stats.py — 验收时统计课件时长

从 audio-segments.json 自动算出每章 / 每段的:
  - 步数
  - 中文字数
  - 纯朗读时长（380ms/字）
  - 视频估算时长（+ 视觉过渡 1.5s/步）

用法:
  python3 scripts/chapter-stats.py                          # 用 presentation/audio-segments.json
  python3 scripts/chapter-stats.py --file <path>            # 指定其他 audio-segments.json
  python3 scripts/chapter-stats.py --section <prefix>       # 只看某 section (如 t6)
  python3 scripts/chapter-stats.py --json                  # 输出 JSON (供其他脚本消费)

翁老师语速参考: 350-400ms/字 (录屏时通常 300ms/字 → 视频比纯朗读短)
"""
import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

# 默认参数
DEFAULT_MS_PER_CHAR = 380       # 纯朗读（翁老师录音）
DEFAULT_STEP_VISUAL_S = 1.5     # 每步视觉过渡 + 元素入场

# 章节 → 段 (S1-S5) 的映射（基于 1.6 课件的命名约定）
def guess_section(chapter_id: str) -> str:
    # 启发式：从章节名判断属于哪个段
    # 1.6 课件的命名：t6-bill-gate/role-shift/toxic-warning/promise → S1
    #                t6-bpmn-symbols/as-is/to-be/flowchart/recap-s2 → S2
    #                t6-ecrs-intro/eliminate/combine/rearrange/simplify/recap-s3 → S3
    #                t6-reimburse-as-is/pause-think/reimburse-solve/magic-experience/recap-s4 → S4
    #                t6-mindmap/quiz/assignment/next → S5
    S1 = {"bill-gate", "role-shift", "toxic-warning", "promise"}
    S2 = {"bpmn-symbols", "as-is", "to-be", "flowchart", "recap-s2"}
    S3 = {"ecrs-intro", "eliminate", "combine", "rearrange", "simplify", "recap-s3"}
    S4 = {"reimburse-as-is", "pause-think", "reimburse-solve", "magic-experience", "recap-s4"}
    S5 = {"mindmap", "quiz", "assignment", "next"}
    short = chapter_id.split("-", 1)[-1] if "-" in chapter_id else chapter_id
    if short in S1: return "S1"
    if short in S2: return "S2"
    if short in S3: return "S3"
    if short in S4: return "S4"
    if short in S5: return "S5"
    return "其他"


def is_chinese_char(c: str) -> bool:
    """简单中文字符判定（覆盖 90% 课件场景）"""
    cp = ord(c)
    return (
        0x4E00 <= cp <= 0x9FFF
        or 0x3400 <= cp <= 0x4DBF
        or 0xF900 <= cp <= 0xFAFF
    )


def count_chinese_chars(text: str) -> int:
    """只统计中文字符（不含英文/数字/标点）"""
    return sum(1 for c in text if is_chinese_char(c))


def fmt_duration(seconds: float) -> str:
    """格式化时长"""
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    secs = seconds - minutes * 60
    return f"{minutes}m{secs:04.1f}s"


def fmt_int(n: int) -> str:
    return f"{n:,}"


def analyze(segments, ms_per_char: float, step_visual_s: float):
    """分析 audio-segments.json，返回按 section 分组的数据"""
    by_section = defaultdict(lambda: {"steps": 0, "chars": 0, "texts": 0})
    by_chapter = defaultdict(lambda: {"section": "其他", "steps": 0, "chars": 0})

    for seg in segments:
        ch = seg["chapter"]
        section = guess_section(ch)
        by_chapter[ch]["section"] = section
        by_chapter[ch]["steps"] += 1
        by_chapter[ch]["chars"] += count_chinese_chars(seg.get("text", ""))
        by_section[section]["steps"] += 1
        by_section[section]["chars"] += count_chinese_chars(seg.get("text", ""))

    # 计算时长
    for d in [by_section, by_chapter]:
        for k, v in d.items():
            v["audio_s"] = v["chars"] * ms_per_char / 1000
            v["video_s"] = v["audio_s"] + v["steps"] * step_visual_s
    return by_section, by_chapter


def print_report(segments, ms_per_char, step_visual_s, only_section=None):
    by_section, by_chapter = analyze(segments, ms_per_char, step_visual_s)

    # 过滤（支持段名 S1-S5 或课程前缀 t6/t2）
    if only_section:
        if only_section.upper().startswith("S"):
            by_section = {k: v for k, v in by_section.items() if k == only_section}
            by_chapter = {k: v for k, v in by_chapter.items() if v["section"] == only_section}
        else:
            # 按课程前缀过滤 (如 t6) — 用过滤后的 segments 重新计算
            filtered_segs = [s for s in segments if s["chapter"].startswith(only_section)]
            by_section, by_chapter = analyze(filtered_segs, ms_per_char, step_visual_s)

    # 排序
    sorted_chapters = sorted(by_chapter.keys())

    # 打印
    print("=" * 80)
    print(f"📊 课件时长统计 (audio_ms={ms_per_char:.0f}ms, visual={step_visual_s:.1f}s/step)")
    print("=" * 80)
    print()
    print(f"{'章节':<32} {'段':<6} {'步数':>4} {'字数':>6} {'音频时长':>10} {'视频估算':>10}")
    print("-" * 80)

    total_steps = 0
    total_chars = 0
    total_audio_s = 0
    total_video_s = 0
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

    # 按段小计
    print("-" * 80)
    print("【按段小计】")
    print(f"{'段':<6} {'章节数':>6} {'步数':>4} {'字数':>6} {'音频时长':>10} {'视频估算':>10}")
    for sec in ["S1", "S2", "S3", "S4", "S5", "其他"]:
        if sec not in section_audio_s:
            continue
        chapters_in_sec = [ch for ch, d in by_chapter.items() if d["section"] == sec]
        print(f"{sec:<6} {len(chapters_in_sec):>6} {section_steps[sec]:>4} "
              f"{fmt_int(section_chars[sec]):>6} "
              f"{fmt_duration(section_audio_s[sec]):>10} "
              f"{fmt_duration(section_video_s[sec]):>10}")
    print("-" * 80)
    print(f"{'总计':<6} {len(by_chapter):>6} {total_steps:>4} {fmt_int(total_chars):>6} "
          f"{fmt_duration(total_audio_s):>10} {fmt_duration(total_video_s):>10}")
    print()
    print(f"💡 翁老师录屏语速通常 300ms/字 → 视频时长估 {fmt_duration(total_chars * 0.3):>10}")
    print("=" * 80)


def main():
    parser = argparse.ArgumentParser(description="验收时统计课件时长")
    parser.add_argument(
        "--file",
        type=Path,
        default=Path("presentation/audio-segments.json"),
        help="audio-segments.json 路径（默认: presentation/audio-segments.json）",
    )
    parser.add_argument(
        "--section",
        help="只显示某段或某前缀 (如 S1/S2/S3/S4/S5 或 t6/t2 课程前缀)",
    )
    parser.add_argument(
        "--audio-ms",
        type=float,
        default=DEFAULT_MS_PER_CHAR,
        help=f"每字毫秒（默认 {DEFAULT_MS_PER_CHAR}）",
    )
    parser.add_argument(
        "--visual-s",
        type=float,
        default=DEFAULT_STEP_VISUAL_S,
        help=f"每步视觉过渡秒数（默认 {DEFAULT_STEP_VISUAL_S}）",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="输出 JSON 格式",
    )
    args = parser.parse_args()

    if not args.file.exists():
        print(f"❌ {args.file} 不存在", file=sys.stderr)
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

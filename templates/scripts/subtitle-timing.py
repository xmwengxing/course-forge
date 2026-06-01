#!/usr/bin/env python3
"""
从 audio-segments.json 生成 subtitle-timing.json。
切分规则：每块 ≤ 60 字，按字数占比分配 ms，300ms/字课堂语速，0-indexed keys。

用法：python3 subtitle-timing.py
依赖：audio-segments.json（由 npm run extract-narrations 生成）
输出：presentation/public/subtitle-timing.json
"""
import json, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, "..") if os.path.basename(SCRIPT_DIR) == 'scripts' else SCRIPT_DIR
SEGMENTS_FILE = os.path.join(ROOT, "audio-segments.json")
TIMING_FILE = os.path.join(ROOT, "public", "subtitle-timing.json")

# 配置
MAX_CHARS = 60       # 每块最多字数
MS_PER_CHAR = 300     # 课堂语速 ms/字
MIN_MS_PER_CHUNK = 2500  # 每块最少停留 ms
MIN_TOTAL_MS = 4000   # 每步最少总时长 ms


def split_text(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    chunks, remaining = [], text
    while remaining:
        if len(remaining) <= max_chars:
            chunks.append(remaining)
            break
        cut = max_chars
        # 优先在句号、感叹号、问号处切
        for sep in ["。", "！", "？"]:
            pos = remaining.rfind(sep, 0, max_chars)
            if pos > max_chars // 2:
                cut = pos + 1
                break
        else:
            # 退而求其次在逗号处切
            for sep in ["，", "；", "："]:
                pos = remaining.rfind(sep, 0, max_chars)
                if pos > max_chars // 3:
                    cut = pos + 1
                    break
        chunks.append(remaining[:cut])
        remaining = remaining[cut:]
    return chunks


def main(only_chapters: list[str] | None = None):
    with open(SEGMENTS_FILE) as f:
        segs = json.load(f)

    # 读取已有 timing（如果存在，保留非目标章节）
    try:
        with open(TIMING_FILE) as f:
            timing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        timing = {}

    # 确定要处理的章节
    if only_chapters:
        targets = set(only_chapters)
    else:
        targets = {s["chapter"] for s in segs}

    # 如果需要全量重建，清空 targets 之外的数据
    if not only_chapters:
        for ch in list(timing.keys()):
            if ch not in targets:
                del timing[ch]

    # 生成 timing
    for ch in targets:
        timing[ch] = {}
        for s in segs:
            if s["chapter"] != ch:
                continue
            step0 = str(s["step"] - 1)  # audio-segments 是 1-indexed，Subtitle 需要 0-indexed
            text = s["text"]
            chunks = split_text(text)
            total_ms = max(MIN_TOTAL_MS, int(len(text) * MS_PER_CHAR))
            total_chars = sum(len(c) for c in chunks)
            timing[ch][step0] = []
            for c in chunks:
                ms = max(MIN_MS_PER_CHUNK, int(total_ms * len(c) / total_chars))
                timing[ch][step0].append({"text": c, "ms": ms})

    os.makedirs(os.path.dirname(TIMING_FILE), exist_ok=True)
    with open(TIMING_FILE, "w") as f:
        json.dump(timing, f, ensure_ascii=False, indent=2)

    steps = sum(len(v) for v in timing.values())
    chunks_count = sum(len(c) for v in timing.values() for c in v.values())
    print(f"✓ subtitle-timing.json: {len(timing)} chapters, {steps} steps, {chunks_count} chunks")
    print(f"  配置: max_chars={MAX_CHARS}, ms_per_char={MS_PER_CHAR}, min_ms={MIN_MS_PER_CHUNK}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate subtitle timing from audio-segments.json")
    parser.add_argument("--chapters", nargs="*", help="Only regenerate specific chapters")
    args = parser.parse_args()
    main(args.chapters)

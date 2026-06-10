#!/usr/bin/env python3
"""
Generate subtitle-timing.json from audio-segments.json.

Modes (default behavior):
  minimax  — read word-level timing from public/minimax-word-timing/ (exact alignment).
             Auto-fallback to default for any chapter without minimax-word-timing data.
  default  — split text by sentence boundaries, use ffprobe for real duration.
             Use as explicit fallback when minimax data is unavailable.

Usage:
  python3 scripts/subtitle-timing.py                              # ★ DEFAULT: try minimax, auto-fallback
  python3 scripts/subtitle-timing.py --mode minimax               # Force minimax (skip default entirely)
  python3 scripts/subtitle-timing.py --mode default               # Force default only
  python3 scripts/subtitle-timing.py --chapters id1 id2           # Only process specific chapters
"""
import json, os, sys, subprocess, argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, "..") if os.path.basename(SCRIPT_DIR) == 'scripts' else SCRIPT_DIR
SEGMENTS_FILE = os.path.join(ROOT, "audio-segments.json")
TIMING_FILE = os.path.join(ROOT, "public", "subtitle-timing.json")
WORD_TIMING_DIR = os.path.join(ROOT, "public", "minimax-word-timing")

# ── Config ──
MAX_CHARS = 55
MIN_MS_CHUNK = 2000

def split_text(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    chunks, remaining = [], text
    while remaining:
        if len(remaining) <= max_chars: chunks.append(remaining); break
        cut = max_chars
        for sep in ["。", "！", "？"]:
            pos = remaining.rfind(sep, 0, max_chars)
            if pos > max_chars // 2: cut = pos + 1; break
        else:
            for sep in ["，", "；", "："]:
                pos = remaining.rfind(sep, 0, max_chars)
                if pos > max_chars // 3: cut = pos + 1; break
        chunks.append(remaining[:cut])
        remaining = remaining[cut:]
    return chunks

duration_cache = {}

def get_audio_duration(chapter: str, step: int) -> float:
    key = f"{chapter}/{step}"
    if key in duration_cache: return duration_cache[key]
    mp3_path = os.path.join(ROOT, "public", "audio", chapter, f"{step}.mp3")
    if not os.path.isfile(mp3_path): return 0
    try:
        result = subprocess.check_output(
            ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
             '-of', 'csv=p=0', mp3_path], timeout=5).decode().strip()
        duration_cache[key] = float(result)
        return duration_cache[key]
    except: return 0


def fill_with_default(timing: dict, segs: list, chapters: list[str]) -> int:
    """Fill timing[ch][step] using default mode for chapters. Returns count filled."""
    count = 0
    for ch in chapters:
        if ch not in timing: timing[ch] = {}
        for s in segs:
            if s['chapter'] != ch: continue
            step0 = str(s['step'] - 1)
            chunks = split_text(s['text'])
            real_dur = get_audio_duration(ch, s['step'])
            total_ms = int(real_dur * 1000) if real_dur > 0 else max(4000, int(len(s['text']) * 300))
            total_chars = sum(len(c) for c in chunks)
            timing[ch][step0] = [{'text': c, 'ms': max(MIN_MS_CHUNK, int(total_ms * len(c) / total_chars))} for c in chunks]
            count += 1
    return count


def generate_default(chapters_filter: list[str] | None = None):
    """Force default mode for all chapters."""
    with open(SEGMENTS_FILE) as f: segs = json.load(f)
    try:
        with open(TIMING_FILE) as f: timing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        timing = {}

    targets = list(chapters_filter) if chapters_filter else list({s['chapter'] for s in segs})
    filled = fill_with_default(timing, segs, targets)

    os.makedirs(os.path.dirname(TIMING_FILE), exist_ok=True)
    with open(TIMING_FILE, 'w') as f:
        json.dump(timing, f, ensure_ascii=False, indent=2)

    steps = sum(len(v) for v in timing.values())
    chunks_count = sum(len(c) for v in timing.values() for c in v.values())
    print(f"✓ Default mode: {len(timing)} chapters, {steps} steps, {chunks_count} chunks")


def generate_minimax(chapters_filter: list[str] | None = None, auto_fallback: bool = True):
    """Use MiniMax word-level timing data for exact alignment.
    If auto_fallback=True, chapters without minimax-word-timing data fall back to default mode."""
    if not os.path.isdir(WORD_TIMING_DIR):
        if auto_fallback:
            print(f"⚠ Word timing directory not found: {WORD_TIMING_DIR}")
            print("  Falling back to default mode for all chapters.")
            generate_default(chapters_filter)
            return
        else:
            print(f"✗ Word timing directory not found: {WORD_TIMING_DIR}")
            sys.exit(1)

    with open(SEGMENTS_FILE) as f: segs = json.load(f)
    try:
        with open(TIMING_FILE) as f: timing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        timing = {}

    available_chapters = set(os.listdir(WORD_TIMING_DIR))
    if auto_fallback:
        # targets = all chapters in segs; minimax handles those with word data; rest fall back
        targets = list(chapters_filter) if chapters_filter else list({s['chapter'] for s in segs})
    else:
        targets = list(chapters_filter) if chapters_filter else list(available_chapters)

    used_minimax = 0
    fallback_chapters: list[str] = []

    for ch in targets:
        word_ch_dir = os.path.join(WORD_TIMING_DIR, ch)
        if not os.path.isdir(word_ch_dir):
            # Chapter has no minimax word-timing data
            if auto_fallback:
                fallback_chapters.append(ch)
                continue
            else:
                print(f"✗ No word timing for chapter '{ch}'")
                sys.exit(1)

        timing[ch] = {}
        for s in segs:
            if s['chapter'] != ch: continue
            step0 = str(s['step'] - 1)
            word_file = os.path.join(word_ch_dir, f"{s['step']}.json")
            if not os.path.isfile(word_file):
                if auto_fallback:
                    # Skip this step — will be handled by fallback pass
                    continue
                else:
                    print(f"✗ Missing word file: {word_file}")
                    sys.exit(1)

            with open(word_file) as f:
                word_data = json.load(f)

            # Group words into subtitle chunks (~MAX_CHARS each), preferring punctuation boundaries
            chunks = []
            word_idx = 0
            while word_idx < len(word_data):
                chunk_text = word_data[word_idx]['text']
                chunk_start = word_data[word_idx]['start_ms']
                chunk_end = word_data[word_idx]['end_ms']
                word_idx += 1
                while word_idx < len(word_data) and len(chunk_text + word_data[word_idx]['text']) <= MAX_CHARS:
                    chunk_text += word_data[word_idx]['text']
                    chunk_end = word_data[word_idx]['end_ms']
                    word_idx += 1
                chunks.append({
                    'text': chunk_text,
                    'ms': max(MIN_MS_CHUNK, chunk_end - chunk_start)
                })

            timing[ch][step0] = chunks
            used_minimax += 1

    # Auto-fallback: chapters without word-timing data fall back to default
    if auto_fallback and fallback_chapters:
        print(f"⚠ {len(fallback_chapters)} chapter(s) lack minimax word-timing: {fallback_chapters[:5]}{'...' if len(fallback_chapters) > 5 else ''}")
        print(f"  Falling back to default mode for these.")
        used_default = fill_with_default(timing, segs, fallback_chapters)
    else:
        used_default = 0

    os.makedirs(os.path.dirname(TIMING_FILE), exist_ok=True)
    with open(TIMING_FILE, 'w') as f:
        json.dump(timing, f, ensure_ascii=False, indent=2)

    steps = sum(len(v) for v in timing.values())
    chunks_count = sum(len(c) for v in timing.values() for c in v.values())
    print(f"✓ Minimax mode: {len(timing)} chapters, {steps} steps, {chunks_count} chunks")
    print(f"  minimax word-timing: {used_minimax}, default fallback: {used_default}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate subtitle-timing.json (default: minimax with auto-fallback)")
    parser.add_argument("--mode", choices=["default", "minimax"], default="minimax",
                        help="default: minimax (auto-fallback). Use 'default' to force ffprobe-only.")
    parser.add_argument("--chapters", nargs="*", help="Only process specific chapters")
    args = parser.parse_args()

    if args.mode == "minimax":
        # If --mode minimax explicitly: NO fallback, strict
        generate_minimax(args.chapters, auto_fallback=False)
    else:
        # If --mode default: force default
        generate_default(args.chapters)